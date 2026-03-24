import { FinderAgent } from "../agents/finder.js";
import { SocialScraperAgent } from "../agents/socialScraper.js";
import type { AgentResult } from "../agents/base.js";

// ---------- Agent Configuration (18 governorates) ----------
export interface GovernorConfig {
  id: string;
  governorate: string;
  category: string;
  rate: string;
}

export const GOVERNOR_CONFIGS: GovernorConfig[] = [
  { id: "Agent-01", governorate: "Baghdad",       category: "restaurants",     rate: "Rate Level 1" },
  { id: "Agent-02", governorate: "Basra",         category: "cafes",           rate: "Rate Level 1" },
  { id: "Agent-03", governorate: "Nineveh",       category: "bakeries",        rate: "Rate Level 1" },
  { id: "Agent-04", governorate: "Erbil",         category: "hotels",          rate: "Rate Level 1" },
  { id: "Agent-05", governorate: "Sulaymaniyah",  category: "gyms",            rate: "Rate Level 2" },
  { id: "Agent-06", governorate: "Kirkuk",        category: "beauty_salons",   rate: "Rate Level 2" },
  { id: "Agent-07", governorate: "Duhok",         category: "barbershops",     rate: "Rate Level 2" },
  { id: "Agent-08", governorate: "Anbar",         category: "pharmacies",      rate: "Rate Level 2" },
  { id: "Agent-09", governorate: "Babil",         category: "supermarkets",    rate: "Rate Level 3" },
  { id: "Agent-10", governorate: "Karbala",       category: "electronics",     rate: "Rate Level 3" },
  { id: "Agent-11", governorate: "Wasit",         category: "clothing_stores", rate: "Rate Level 3" },
  { id: "Agent-12", governorate: "Dhi Qar",       category: "car_services",    rate: "Rate Level 3" },
  { id: "Agent-13", governorate: "Maysan",        category: "dentists",        rate: "Rate Level 4" },
  { id: "Agent-14", governorate: "Muthanna",      category: "clinics",         rate: "Rate Level 4" },
  { id: "Agent-15", governorate: "Najaf",         category: "schools",         rate: "Rate Level 4" },
  { id: "Agent-16", governorate: "Qadisiyyah",    category: "coworking",       rate: "Rate Level 5" },
  { id: "Agent-17", governorate: "Saladin",       category: "entertainment",   rate: "Rate Level 5" },
  { id: "Agent-18", governorate: "Diyala",        category: "tourism",         rate: "Rate Level 5" },
];

// Active run tracking
const activeRuns = new Map<string, { abort: boolean; status: string }>();

// ---------- Shared agent instances ----------
let finderAgent: FinderAgent | null = null;
let socialAgent: SocialScraperAgent | null = null;

function getFinder(): FinderAgent {
  if (!finderAgent) finderAgent = new FinderAgent();
  return finderAgent;
}

function getSocial(): SocialScraperAgent {
  if (!socialAgent) socialAgent = new SocialScraperAgent();
  return socialAgent;
}

// ---------- Public API ----------

export type TaskType = "find" | "social" | "both";

export interface RunOptions {
  taskType?: TaskType;
  category?: string;
  limit?: number;
}

/** Run a single governor (by Agent-XX id or governorate name) */
export async function runGovernor(
  agentNameOrGov: string,
  options: RunOptions = {}
): Promise<AgentResult[]> {
  const config =
    GOVERNOR_CONFIGS.find((c) => c.id === agentNameOrGov) ||
    GOVERNOR_CONFIGS.find(
      (c) => c.governorate.toLowerCase() === agentNameOrGov.toLowerCase()
    );

  if (!config) {
    throw new Error(
      `Governor "${agentNameOrGov}" not found. Valid: ${GOVERNOR_CONFIGS.map((c) => c.id).join(", ")}`
    );
  }

  const taskType = options.taskType || "both";
  const category = options.category || config.category;
  const limit = options.limit || 15;
  const results: AgentResult[] = [];

  const runKey = config.id;
  activeRuns.set(runKey, { abort: false, status: "running" });

  console.log(`\n========== ${config.id}: ${config.governorate} ==========`);
  console.log(`Task: ${taskType} | Category: ${category} | Limit: ${limit}`);

  try {
    // Step 1: Find businesses
    if (taskType === "find" || taskType === "both") {
      if (activeRuns.get(runKey)?.abort) throw new Error("Aborted by user");
      const findResult = await getFinder().run(config.governorate, { category, limit });
      results.push(findResult);
      console.log(`  Finder: ${findResult.recordsInserted} inserted`);
    }

    // Step 2: Social scrape
    if (taskType === "social" || taskType === "both") {
      if (activeRuns.get(runKey)?.abort) throw new Error("Aborted by user");
      const socialResult = await getSocial().run(config.governorate, { limit, category });
      results.push(socialResult);
      console.log(`  Social: ${socialResult.recordsInserted} updated`);
    }
  } catch (err: any) {
    console.error(`  Error: ${err.message}`);
  }

  activeRuns.set(runKey, { abort: false, status: "done" });
  return results;
}

/** Run multiple governors in sequence */
export async function runGovernors(
  governorIds: string[],
  options: RunOptions = {}
): Promise<Record<string, AgentResult[]>> {
  const allResults: Record<string, AgentResult[]> = {};

  for (const id of governorIds) {
    allResults[id] = await runGovernor(id, options);
  }

  return allResults;
}

/** Run ALL 18 governors */
export async function runAllGovernors(options: RunOptions = {}): Promise<Record<string, AgentResult[]>> {
  return runGovernors(
    GOVERNOR_CONFIGS.map((c) => c.id),
    options
  );
}

/** Stop a running governor */
export function stopGovernor(agentId: string) {
  const run = activeRuns.get(agentId);
  if (run) run.abort = true;
}

/** Stop all running governors */
export function stopAllGovernors() {
  for (const [, run] of activeRuns) {
    run.abort = true;
  }
}

/** Get status of all governors */
export function getActiveRuns() {
  const result: Record<string, string> = {};
  for (const [id, run] of activeRuns) {
    result[id] = run.status;
  }
  return result;
}
