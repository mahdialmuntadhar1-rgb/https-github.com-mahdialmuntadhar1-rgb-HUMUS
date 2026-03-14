import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "../supabase-admin.js";
import { createDefaultSources } from "../agents/sources/index.js";
import type { CollectorSource, CrawlQueueJob, CrawlTile, RawBusinessRecord } from "./types.js";
import { generateTilesForIraq } from "./tile-grid.js";

export class CrawlerService {
  private sources: CollectorSource[];

  constructor(sources = createDefaultSources()) {
    this.sources = sources;
  }

  async seedTilesIfEmpty() {
    const { count } = await supabaseAdmin.from("crawl_tiles").select("id", { head: true, count: "exact" });
    if ((count ?? 0) > 0) return;

    const generatedTiles = generateTilesForIraq();
    for (let i = 0; i < generatedTiles.length; i += 500) {
      await supabaseAdmin.from("crawl_tiles").insert(generatedTiles.slice(i, i + 500));
    }
  }

  async refillQueue(minimumPending = 200) {
    const { count: pending } = await supabaseAdmin
      .from("crawl_queue")
      .select("id", { head: true, count: "exact" })
      .eq("status", "pending");

    if ((pending ?? 0) >= minimumPending) return;

    const { data: candidateTiles } = await supabaseAdmin
      .from("crawl_tiles")
      .select("id")
      .in("status", ["pending", "completed"])
      .order("priority", { ascending: false })
      .limit(minimumPending);

    const jobs = (candidateTiles ?? []).map((tile) => ({
      id: randomUUID(),
      tile_id: tile.id,
      source: "all",
      status: "pending",
      attempts: 0,
      created_at: new Date().toISOString(),
    }));

    if (jobs.length) {
      await supabaseAdmin.from("crawl_queue").insert(jobs);
    }
  }

  async claimJob(agentName: string): Promise<(CrawlQueueJob & { tile: CrawlTile }) | null> {
    const { data, error } = await supabaseAdmin.rpc("claim_next_crawl_job", { p_agent_name: agentName });
    if (error || !data?.length) return null;

    const job = data[0] as CrawlQueueJob;
    const { data: tile } = await supabaseAdmin.from("crawl_tiles").select("*").eq("id", job.tile_id).single();
    if (!tile) return null;

    await supabaseAdmin.from("crawl_tiles").update({ status: "processing" }).eq("id", tile.id);
    return { ...job, tile };
  }

  async processJob(job: CrawlQueueJob & { tile: CrawlTile }, agentName: string) {
    const startedAt = Date.now();

    const collectedBySource = await Promise.allSettled(this.sources.map((source) => source.collectBusinesses(job.tile)));
    const sourceErrors = collectedBySource.filter((item) => item.status === "rejected").length;
    const records = collectedBySource
      .flatMap((item) => (item.status === "fulfilled" ? item.value : []))
      .map((record) => ({ ...record, city: record.city ?? job.tile.city }));

    const deduped = await this.dedupe(records);
    const inserted = await this.storeBusinesses(deduped, agentName, job.tile);
    await this.expandDiscovery(job.tile, deduped);

    await supabaseAdmin
      .from("crawl_queue")
      .update({
        status: sourceErrors === this.sources.length ? "failed" : "completed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", job.id);

    await supabaseAdmin
      .from("crawl_tiles")
      .update({
        status: "completed",
        last_crawled_at: new Date().toISOString(),
      })
      .eq("id", job.tile.id);

    await supabaseAdmin.from("agent_logs").insert({
      action: "tile_crawl",
      result: "success",
      metadata: {
        agentName,
        tileId: job.tile.id,
        recordsCollected: records.length,
        recordsInserted: inserted,
        sourceErrors,
        executionMs: Date.now() - startedAt,
      },
    });
  }

  async markJobFailed(jobId: string, reason: string) {
    await supabaseAdmin
      .from("crawl_queue")
      .update({ status: "failed", processed_at: new Date().toISOString() })
      .eq("id", jobId);

    await supabaseAdmin.from("agent_logs").insert({ action: "tile_crawl", result: "error", metadata: { jobId, reason } });
  }

  async retryFailedJobs(maxAttempts = 3) {
    const { data: failed } = await supabaseAdmin
      .from("crawl_queue")
      .select("id,attempts")
      .eq("status", "failed")
      .lt("attempts", maxAttempts)
      .limit(100);

    for (const job of failed ?? []) {
      await supabaseAdmin
        .from("crawl_queue")
        .update({ status: "pending", attempts: (job.attempts ?? 0) + 1, processed_at: null })
        .eq("id", job.id);
    }
  }

  async detectStalledJobs(stallMinutes = 20) {
    const cutoff = new Date(Date.now() - stallMinutes * 60_000).toISOString();
    const { data: stalled } = await supabaseAdmin
      .from("crawl_queue")
      .select("id,attempts")
      .eq("status", "processing")
      .lt("started_at", cutoff)
      .limit(100);

    for (const job of stalled ?? []) {
      await supabaseAdmin
        .from("crawl_queue")
        .update({ status: "pending", attempts: (job.attempts ?? 0) + 1 })
        .eq("id", job.id);
    }
  }

  private async dedupe(records: RawBusinessRecord[]): Promise<RawBusinessRecord[]> {
    const unique: RawBusinessRecord[] = [];
    for (const record of records) {
      const { data: match } = await supabaseAdmin
        .from("businesses")
        .select("id,name,city,phone,website,lat,lng")
        .or([
          record.phone ? `phone.eq.${record.phone}` : "",
          record.website ? `website.eq.${record.website}` : "",
          record.name && record.city ? `and(name.ilike.${record.name},city.eq.${record.city})` : "",
        ].filter(Boolean).join(","))
        .limit(3);

      if ((match ?? []).length === 0) {
        unique.push(record);
      }
    }
    return unique;
  }

  private async storeBusinesses(records: RawBusinessRecord[], agentName: string, tile: CrawlTile) {
    if (!records.length) return 0;

    const payload = records.map((item) => ({
      name: item.name,
      category: item.category,
      city: item.city,
      governorate: tile.governorate,
      address: item.address,
      phone: item.phone,
      website: item.website,
      lat: item.lat,
      lng: item.lng,
      source_url: item.source_url,
      created_by_agent: agentName,
      source: item.source,
      dedupe_key: `${(item.phone ?? "").toLowerCase()}|${(item.website ?? "").toLowerCase()}|${(item.name ?? "").toLowerCase()}|${item.city ?? ""}`,
      updated_at: new Date().toISOString(),
    }));

    for (let i = 0; i < payload.length; i += 200) {
      await supabaseAdmin.from("businesses").upsert(payload.slice(i, i + 200), { onConflict: "dedupe_key" });
    }

    return payload.length;
  }

  private async expandDiscovery(tile: CrawlTile, records: RawBusinessRecord[]) {
    const expansions = records.slice(0, 20).map((business) => ({
      id: randomUUID(),
      tile_id: tile.id,
      source: `discovery:${business.category ?? "general"}`,
      status: "pending",
      attempts: 0,
      created_at: new Date().toISOString(),
    }));

    if (expansions.length) {
      await supabaseAdmin.from("crawl_queue").insert(expansions);
    }
  }
}
