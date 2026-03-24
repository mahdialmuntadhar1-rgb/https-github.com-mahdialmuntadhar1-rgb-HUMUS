import { GoogleGenAI } from "@google/genai";
import { supabaseAdmin } from "../supabase-admin.js";

export interface AgentResult {
  agent: string;
  governorate: string;
  status: "success" | "error" | "partial";
  recordsProcessed: number;
  recordsInserted: number;
  errors: string[];
  details: string;
}

export interface BusinessRecord {
  business_id: string;
  name: { en: string; ar: string; ku: string };
  category: string;
  subcategory?: string;
  city: string;
  district?: string;
  verified: boolean;
  verification_score: number;
  sources: string[];
  contact: {
    phone: string[];
    whatsapp: string;
    website: string;
    instagram: string;
    facebook: string;
  };
  location: {
    google_maps_url: string;
    coordinates: { lat: number | null; lng: number | null };
    address: { en: string; ar: string; ku: string };
  };
  postcard: {
    logo_url: string;
    cover_image_url: string;
    tagline: { en: string; ar: string; ku: string };
    description: { en: string; ar: string; ku: string };
    highlights: string[];
  };
  agent_notes: string;
}

export abstract class BaseAgent {
  name: string;
  role: string;
  protected ai: GoogleGenAI;
  protected supabase = supabaseAdmin;

  constructor(name: string, role: string) {
    this.name = name;
    this.role = role;
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        `GEMINI_API_KEY is required. Set it in your .env file.`
      );
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /** Log an action to the agent_logs table */
  async log(action: string, details?: string, recordId?: string) {
    await this.supabase.from("agent_logs").insert({
      agent_name: this.name,
      action,
      details,
      record_id: recordId,
    });
    console.log(`[${this.name}] ${action}${details ? ": " + details : ""}`);
  }

  /** Update this agent's status in the agents table */
  async setStatus(status: "idle" | "active" | "error", extra?: Partial<Record<string, any>>) {
    await this.supabase
      .from("agents")
      .upsert(
        {
          agent_name: this.name,
          category: this.role,
          status,
          updated_at: new Date().toISOString(),
          last_run: status === "active" ? new Date().toISOString() : undefined,
          ...extra,
        },
        { onConflict: "agent_name" }
      );
  }

  /** Call Gemini with a system prompt and user prompt, return text */
  async askGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    const result = await this.ai.models.generateContent({
      model: "gemini-2.0-flash",
      config: { systemInstruction: systemPrompt },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    });
    return result.text || "";
  }

  /** Parse JSON from Gemini output (handles markdown code fences) */
  parseJSON<T = any>(raw: string): T {
    let cleaned = raw.trim();
    // Strip markdown code fences
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    return JSON.parse(cleaned);
  }

  abstract run(governorate: string, options?: Record<string, any>): Promise<AgentResult>;
}
