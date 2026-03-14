import { supabaseAdmin } from "../supabase-admin.js";
import type { DataQualityReport } from "../crawler/types.js";

export class ValidationAgent {
  agentId = "Agent-19";

  async run() {
    const { data: businesses } = await supabaseAdmin
      .from("businesses")
      .select("id,name,phone,lat,lng,address,updated_at,city")
      .limit(1000);

    const reports: DataQualityReport[] = [];
    const seen = new Map<string, string>();

    for (const business of businesses ?? []) {
      if (business.phone && seen.has(business.phone)) {
        reports.push({ business_id: business.id, issue_type: "duplicate", severity: "high", details: `Duplicate phone with ${seen.get(business.phone)}` });
      }
      if (business.phone) {
        seen.set(business.phone, business.name);
      }
      if (!business.phone || !/^\+964\d{10}$/.test(business.phone.replace(/\s+/g, ""))) {
        reports.push({ business_id: business.id, issue_type: "invalid_phone", severity: "medium", details: "Phone missing or invalid format" });
      }
      if (business.lat == null || business.lng == null) {
        reports.push({ business_id: business.id, issue_type: "missing_coordinates", severity: "high", details: "No coordinates" });
      }
      if (!business.address) {
        reports.push({ business_id: business.id, issue_type: "missing_address", severity: "medium", details: "No address provided" });
      }
      if (business.updated_at && new Date(business.updated_at).getTime() < Date.now() - 1000 * 60 * 60 * 24 * 180) {
        reports.push({ business_id: business.id, issue_type: "outdated_listing", severity: "low", details: "Listing older than 180 days" });
      }
    }

    if (reports.length) {
      await supabaseAdmin.from("data_quality_reports").insert(reports.map((report) => ({ ...report, created_at: new Date().toISOString() })));
    }

    return reports.length;
  }
}
