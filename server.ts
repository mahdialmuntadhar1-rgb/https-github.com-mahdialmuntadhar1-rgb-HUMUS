import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import {
  runGovernor,
  runGovernors,
  runAllGovernors,
  stopGovernor,
  stopAllGovernors,
  getActiveRuns,
  GOVERNOR_CONFIGS,
} from "./server/governors/index.js";
import { supabaseAdmin } from "./server/supabase-admin.js";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ──────────── Health ────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", gemini: !!process.env.GEMINI_API_KEY, governors: GOVERNOR_CONFIGS.length });
  });

  // ──────────── Agent Configuration ────────────
  app.get("/api/agents", async (_req, res) => {
    // Return live agent status from Supabase + config
    const { data: dbAgents } = await supabaseAdmin.from("agents").select("*");
    const active = getActiveRuns();

    const merged = GOVERNOR_CONFIGS.map((config) => {
      const db = dbAgents?.find((a: any) => a.agent_name === config.id);
      return {
        name: config.id,
        governorate: config.governorate,
        category: config.category,
        rate: config.rate,
        status: active[config.id] || db?.status || "idle",
        recordsCollected: db?.records_collected || 0,
        target: db?.target || 1000,
        errors: db?.errors || 0,
        lastRun: db?.last_run || null,
      };
    });

    res.json(merged);
  });

  // ──────────── Run a single agent ────────────
  app.post("/api/agents/:agentId/run", async (req, res) => {
    const { agentId } = req.params;
    const { taskType, category, limit } = req.body || {};

    try {
      // Run async — don't block the response
      runGovernor(agentId, { taskType, category, limit }).catch(console.error);
      res.json({ status: "started", agentId, taskType: taskType || "both" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ──────────── Run multiple agents (by governorate list) ────────────
  app.post("/api/orchestrator/run", async (req, res) => {
    const { governorates, taskType, category, limit } = req.body || {};

    if (!governorates || !Array.isArray(governorates) || governorates.length === 0) {
      return res.status(400).json({ error: "Provide governorates[] array" });
    }

    // Map governorate names to Agent IDs
    const agentIds = governorates.map((gov: string) => {
      const config = GOVERNOR_CONFIGS.find(
        (c) => c.governorate.toLowerCase() === gov.toLowerCase() || c.id === gov
      );
      return config?.id;
    }).filter(Boolean) as string[];

    // Run async
    runGovernors(agentIds, { taskType, category, limit }).catch(console.error);
    res.json({ status: "started", agents: agentIds, taskType: taskType || "both" });
  });

  // ──────────── Run ALL agents ────────────
  app.post("/api/orchestrator/start", async (req, res) => {
    const { taskType, category, limit } = req.body || {};
    runAllGovernors({ taskType, category, limit }).catch(console.error);
    res.json({ status: "started", count: GOVERNOR_CONFIGS.length });
  });

  // ──────────── Stop ────────────
  app.post("/api/orchestrator/stop", (_req, res) => {
    stopAllGovernors();
    res.json({ status: "stopping" });
  });

  app.post("/api/agents/:agentId/stop", (req, res) => {
    stopGovernor(req.params.agentId);
    res.json({ status: "stopping", agentId: req.params.agentId });
  });

  // ──────────── Status ────────────
  app.get("/api/orchestrator/status", (_req, res) => {
    res.json({ activeRuns: getActiveRuns(), configs: GOVERNOR_CONFIGS });
  });

  // ──────────── Agent Logs ────────────
  app.get("/api/logs", async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const { data, error } = await supabaseAdmin
      .from("agent_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // ──────────── Business Stats ────────────
  app.get("/api/stats", async (_req, res) => {
    const { count: totalBusinesses } = await supabaseAdmin
      .from("businesses")
      .select("*", { count: "exact", head: true });

    const { count: verifiedCount } = await supabaseAdmin
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("verified", true);

    res.json({
      totalBusinesses: totalBusinesses || 0,
      verifiedCount: verifiedCount || 0,
      governorates: GOVERNOR_CONFIGS.length,
    });
  });

  // ──────────── Vite Dev Server ────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`\n🧭 Iraq Compass Server running on http://localhost:${PORT}`);
    console.log(`   Agents: ${GOVERNOR_CONFIGS.length} governors configured`);
    console.log(`   Gemini: ${process.env.GEMINI_API_KEY ? "✅ API key set" : "❌ Missing GEMINI_API_KEY"}`);
    console.log(`   Supabase: ${process.env.VITE_SUPABASE_URL || "using fallback URL"}\n`);
  });
}

startServer();
