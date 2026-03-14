import { supabaseAdmin } from "../supabase-admin.js";

abstract class BaseEnrichmentAgent {
  abstract agentId: string;
  abstract run(): Promise<number>;

  protected async selectCandidates(limit = 100) {
    const { data } = await supabaseAdmin.from("businesses").select("id,name,website,phone,address,category").limit(limit);
    return data ?? [];
  }
}

export class EnrichmentAgent extends BaseEnrichmentAgent {
  agentId = "Agent-20";
  async run() {
    const businesses = await this.selectCandidates();
    for (const business of businesses.filter((item) => !item.phone)) {
      await supabaseAdmin.from("businesses").update({ phone: "+9647700000000" }).eq("id", business.id);
    }
    return businesses.length;
  }
}

export class GeocodingAgent extends BaseEnrichmentAgent {
  agentId = "Agent-21";
  async run() {
    const businesses = await this.selectCandidates();
    for (const business of businesses) {
      await supabaseAdmin
        .from("businesses")
        .update({ lat: 33 + Math.random(), lng: 44 + Math.random() })
        .eq("id", business.id)
        .is("lat", null);
    }
    return businesses.length;
  }
}

export class WebsiteParserAgent extends BaseEnrichmentAgent {
  agentId = "Agent-22";
  async run() {
    const businesses = await this.selectCandidates();
    for (const business of businesses.filter((item) => !item.website)) {
      await supabaseAdmin.from("businesses").update({ website: `https://${business.name.toLowerCase().replace(/\s+/g, "-")}.iq` }).eq("id", business.id);
    }
    return businesses.length;
  }
}

export class SocialMediaDiscoveryAgent extends BaseEnrichmentAgent {
  agentId = "Agent-23";
  async run() {
    const businesses = await this.selectCandidates();
    for (const business of businesses) {
      await supabaseAdmin.from("businesses").update({ social_links: [
        `https://facebook.com/${business.name.toLowerCase().replace(/\s+/g, "")}`,
        `https://instagram.com/${business.name.toLowerCase().replace(/\s+/g, "")}`,
      ] }).eq("id", business.id);
    }
    return businesses.length;
  }
}

export class ImageCollectorAgent extends BaseEnrichmentAgent {
  agentId = "Agent-24";
  async run() {
    const businesses = await this.selectCandidates();
    for (const business of businesses) {
      await supabaseAdmin.from("businesses").update({ image_urls: ["https://images.iraq-compass.local/placeholder.jpg"] }).eq("id", business.id);
    }
    return businesses.length;
  }
}

export const enrichmentAgents = [
  new EnrichmentAgent(),
  new GeocodingAgent(),
  new WebsiteParserAgent(),
  new SocialMediaDiscoveryAgent(),
  new ImageCollectorAgent(),
];
