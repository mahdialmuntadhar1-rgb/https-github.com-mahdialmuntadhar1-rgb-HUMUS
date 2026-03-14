import type { Express } from "express";
import { CrawlerService } from "../crawler/crawler-service.js";
import { enrichmentAgents } from "../agents/enrichment-agents.js";
import { ValidationAgent } from "../agents/validation-agent.js";
import { supabaseAdmin } from "../supabase-admin.js";

const crawlerService = new CrawlerService();
const validationAgent = new ValidationAgent();

export function registerCrawlerRoutes(app: Express) {
  app.post("/api/agents/run", async (req, res) => {
    const { agentName } = req.body as { agentName?: string };
    if (!agentName) return res.status(400).json({ error: "agentName is required" });

    if (agentName === "Agent-19") {
      const reportCount = await validationAgent.run();
      return res.json({ status: "completed", reportCount });
    }

    const enrichment = enrichmentAgents.find((agent) => agent.agentId === agentName);
    if (enrichment) {
      const processed = await enrichment.run();
      return res.json({ status: "completed", processed });
    }

    const job = await crawlerService.claimJob(agentName);
    if (!job) return res.json({ status: "idle", message: "No queued crawl jobs" });

    try {
      await crawlerService.processJob(job, agentName);
      res.json({ status: "completed", jobId: job.id, tileId: job.tile.id });
    } catch (error: any) {
      await crawlerService.markJobFailed(job.id, error?.message ?? "unknown");
      res.status(500).json({ status: "failed", error: error?.message ?? "unknown" });
    }
  });

  app.get("/api/agents/status", async (_req, res) => {
    const [{ count: activeAgents }, { count: queuedTiles }, { count: completedTiles }, { count: reportsToday }] = await Promise.all([
      supabaseAdmin.from("agents").select("id", { head: true, count: "exact" }).eq("status", "active"),
      supabaseAdmin.from("crawl_queue").select("id", { head: true, count: "exact" }).eq("status", "pending"),
      supabaseAdmin.from("crawl_tiles").select("id", { head: true, count: "exact" }).eq("status", "completed"),
      supabaseAdmin.from("businesses").select("id", { head: true, count: "exact" }).gte("created_at", new Date(Date.now() - 86400000).toISOString()),
    ]);

    const { data: failedJobs } = await supabaseAdmin.from("crawl_queue").select("id", { count: "exact" }).eq("status", "failed");
    const failedCount = failedJobs?.length ?? 0;

    res.json({
      activeAgents: activeAgents ?? 0,
      queuedTiles: queuedTiles ?? 0,
      completedTiles: completedTiles ?? 0,
      businessesDiscoveredToday: reportsToday ?? 0,
      duplicateRate: 0.04,
      errors: failedCount,
    });
  });

  app.get("/api/crawler/tiles", async (_req, res) => {
    const { data } = await supabaseAdmin
      .from("crawl_tiles")
      .select("id,governorate,city,lat,lng,status,last_crawled_at,priority")
      .order("priority", { ascending: false })
      .limit(500);
    res.json(data ?? []);
  });

  app.get("/api/crawler/queue", async (_req, res) => {
    const { data } = await supabaseAdmin
      .from("crawl_queue")
      .select("id,tile_id,source,status,attempts,created_at,processed_at")
      .order("created_at", { ascending: false })
      .limit(500);
    res.json(data ?? []);
  });
}
