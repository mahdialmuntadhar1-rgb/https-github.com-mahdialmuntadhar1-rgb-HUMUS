# ARCHITECTURE_CANONICAL_MAP

## 1. Canonical architecture summary

This repository is a **single-codebase application** with:

- **Frontend**: React + Vite SPA in `src/`.
- **Backend/orchestration**: Express server in `server.ts` with governor execution endpoints.
- **Data layer**: Supabase via two clients:
  - Browser client in `src/lib/supabase.ts` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Admin client in `server/supabase-admin.ts` (`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- **Operational flow**:
  1. Admin UI calls `/api/orchestrator/*` and `/api/agents/:agentName/run`.
  2. Server dispatches governor logic in `server/governors/*`.
  3. Governors upsert data into Supabase tables and log execution state.

## 2. Repositories and deployment pipeline

### Repository roles
- **Current repository** (this repo): frontend + backend orchestration in one deployment unit.
- **No additional repositories were detected** from local files; if separate infra repos exist externally (IaC, DB migrations, deployment templates), they should be declared explicitly.

### Deployment assumptions
- Local run uses `npm run dev` (`tsx server.ts`).
- Production split is implied:
  - Vite build for frontend (`npm run build`).
  - Node runtime for server (`npm run start`).
- If Vercel is used, server runtime alignment and environment variable scoping should be validated in project settings.

## 3. Data model references and consistency

Observed Supabase table references in code:
- `businesses`
- `agents`
- `agent_logs`

### Consistency risk to validate
- No `directory` table references exist in code; if your canonical schema expects `directory` instead of `businesses`, this is a schema-contract mismatch risk and should be normalized via migration + code update in one controlled release.

## 4. Infrastructure risks identified

1. **Schema contract drift risk**: code hardcodes `businesses` table naming in governor storage logic.
2. **Environment variable coupling**: server uses `VITE_SUPABASE_URL` for backend as well; if frontend/public and backend/internal config diverge later, introduce dedicated server-side variable naming.
3. **Orchestrator state persistence risk**: in-memory agent status in `server.ts` can be reset on process restart unless the persistent source of truth is always Supabase.
4. **Developer machine C: pressure risk**: without enforced cache/temp redirection, package managers and build tools will repopulate `C:` quickly.

## 5. PowerShell-first automation scope

## PowerShell-suitable tasks
- Workstation audit report generation.
- D: directory standardization.
- TEMP/TMP redirection.
- npm/pip/gradle/nuget/yarn cache relocation.
- Safe temporary-file cleanup and component cleanup.
- Single-command orchestration wrapper.

## Repository edit tasks (kept minimal)
- Add canonical architecture map (this file).
- Add reusable PowerShell automation suite under `powershell/`.

## 6. Canonical workstation layout target

```text
C:\
  Windows\
  Program Files\ (minimal)
  Git\
  System components only

D:\
  Dev\
  Tools\
  Projects\
  Workspace\
  Temp\
  Cache\
  Downloads\
  Tools\PowerShell\
  Tools\AuditReports\
```

## 7. Single-command execution

From an elevated PowerShell session, run:

```powershell
D:\Tools\PowerShell\optimize-dev-machine.ps1
```

If running directly from this repo checkout first:

```powershell
powershell -ExecutionPolicy Bypass -File .\powershell\optimize-dev-machine.ps1
```

