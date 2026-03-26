# Prompt for Claude (or any coding agent) to inspect 18-AGENTS

Use this exact prompt with your coding assistant:

---

You are a senior AI systems engineer and software auditor.

I want a **deep diagnostic audit** of my application and repository to identify what is missing so it can operate as a **real, long-running AI agent system** that:
1) collects real external data,
2) continues running reliably without stopping quickly,
3) stores memory/state,
4) can be observed, debugged, and recovered.

## Context
- Project name: `18-AGENTS`
- Deployed URL: `https://tawaw18agent.mahdialmuntadhar1.workers.dev/`
- Repository: `https://github.com/mahdialmuntadhar1-rgb/18-AGENTS`
- Supabase URL: `https://mxxaxhrtccomkazpvthn.supabase.co`
- Cloudflare Workers service path: `18agents/production`

## Critical rules for your audit
1. **Do not skip files.** Inspect frontend, backend, worker, DB schema, config, and CI/deployment artifacts.
2. **Show evidence.** For each finding, cite file paths, function names, and exact lines or snippets.
3. **Be brutally concrete.** No generic advice like “improve security”; instead specify exact code-level changes.
4. **Assume production intent.** Evaluate reliability, scalability, observability, cost, and abuse resistance.
5. If something cannot be verified, clearly mark it as **Unknown** and list exactly what data is missing.

## What I want you to deliver

### A) Architecture Reality Check (as-is)
- Infer and describe the current architecture (UI, APIs, job execution, storage, scheduling, external integrations).
- Explain where “agent logic” truly lives right now.
- Clarify whether the current system is actually event-driven, request/response only, or has background execution.

### B) Gap Analysis: “Demo app” vs “Real agent platform”
Create a table with columns:
- `Capability`
- `Current State (Evidence)`
- `Risk if Missing`
- `Minimal Fix`
- `Production-Grade Fix`

Mandatory capabilities to assess:
1. Long-running execution model (durable workflows / queues / cron / resumability)
2. Tool calling layer (HTTP, scraping, APIs, retries, backoff, rate limits)
3. Memory model (short-term context, long-term memory, vector or structured retrieval)
4. Agent state machine (queued, running, waiting, failed, completed, retried)
5. Task scheduling & orchestration (recurring jobs, dependency graphs)
6. Data ingestion pipelines (validation, dedupe, normalization, provenance)
7. Human-in-the-loop review and override controls
8. Multi-agent coordination (if intended)
9. Observability (logs, traces, metrics, dashboards, alerting)
10. Fault tolerance (idempotency keys, dead-letter queues, replay)
11. Security (secret management, authz, tenant isolation, prompt injection defenses)
12. Cost controls (budgets, model routing, usage metering)
13. Testing strategy (unit, integration, e2e, load, chaos)
14. Deployment maturity (environments, migration flow, rollback)

### C) Cloudflare + Supabase Specific Review
- Verify whether architecture matches Cloudflare Worker constraints (CPU time, no traditional long-running process).
- Determine if missing: Queues, Cron Triggers, Durable Objects, Workflows, or external job runners.
- Assess Supabase usage for:
  - schema quality,
  - indexes,
  - row-level security,
  - audit logs,
  - job/task tables,
  - retry metadata,
  - memory tables.

### D) Data Reality Check
- Identify every place the system currently gets “real data”.
- Flag mocked/static/manual data paths.
- Identify data freshness strategy, source reliability checks, and anti-duplication controls.

### E) Reliability Checklist (must be explicit)
For each item mark `Present / Partial / Missing` with evidence:
- retry policy
- exponential backoff
- timeout handling
- circuit breaker
- idempotent writes
- poison message handling
- dead-letter queue
- job heartbeat
- crash recovery
- exactly-once or at-least-once strategy

### F) Security & Abuse Review
- Secret leakage risk, especially hardcoded keys/tokens.
- Endpoint abuse controls (auth, quotas, CAPTCHA, signatures).
- Prompt injection & data exfiltration risk if agent uses web content.
- Minimum secure defaults needed before real users.

### G) Prioritized Implementation Plan
Provide three staged plans:
1. **48-hour stabilization plan** (smallest changes to stop brittle behavior)
2. **2-week production foundation plan**
3. **6-week scale plan**

For each task include:
- exact files to edit/create,
- why,
- estimated effort,
- dependencies,
- expected impact.

### H) Ready-to-apply outputs
Generate:
1. SQL for missing core tables (agents, runs, tasks, events, tool_calls, memories, retries)
2. TypeScript interfaces for agent/task/run states
3. A minimal worker/queue orchestration skeleton
4. A production checklist in markdown with checkboxes

## Output format (strict)
1. `Executive Summary`
2. `Current Architecture (Verified)`
3. `Critical Gaps`
4. `Risk Register`
5. `Prioritized Roadmap`
6. `Patch Suggestions (file-by-file)`
7. `Unknowns / Needed Access`

## Important
- If you find repository secrets or exposed tokens, call them out immediately and recommend rotation steps.
- Prefer concrete migration-safe changes over large rewrites.
- Do not hallucinate: every claim must be tied to inspected code or config.

---

Optional final line to append when you run this prompt:

"After the audit, ask me whether I want you to implement the 48-hour stabilization plan directly as code changes."
