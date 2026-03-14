# Iraq Compass Agent System (Production Upgrade)

## Architecture Overview

The crawler now uses a **tile-first** architecture:

1. `crawl_tiles` stores 500m-1000m search tiles grouped by governorate/city.
2. `crawl_queue` stores crawl jobs per tile and source.
3. Agents claim queue jobs via `claim_next_crawl_job` for crash-safe distributed execution.
4. Source adapters in `server/agents/sources` collect in parallel per tile.
5. Results are deduplicated with weighted rules and inserted in batches.
6. Discovery expansion schedules additional jobs from newly found businesses.
7. Validation and enrichment agents run continuously on existing businesses.

## Data Flow

- Orchestrator (`scripts/orchestrator.ts`) runs periodic ticks:
  - seed tiles
  - refill queue
  - retry failed jobs
  - revive stalled jobs
- Worker endpoint (`POST /api/agents/run`) claims and processes a crawl job.
- Monitoring endpoints:
  - `GET /api/agents/status`
  - `GET /api/crawler/tiles`
  - `GET /api/crawler/queue`

## Scaling Strategy

- Chunked tile generation for all Iraqi governorates.
- Batch insert/upsert for businesses (200 rows per chunk).
- Queue-based parallelism for horizontal workers.
- Retry logic with attempts counter.
- Source fallback (parallel collectors tolerate partial failures).
- Indexes for governorate/category/city/phone/dedupe/location.

## Agents

- Agent 1-18: tile crawl workers
- Agent 19: validation (`data_quality_reports`)
- Agent 20: enrichment
- Agent 21: geocoding
- Agent 22: website parser
- Agent 23: social media discovery
- Agent 24: image collection

## Admin Control Layer

Admin UI now includes:

- Crawler Monitor
- Tile Coverage Map panel
- Agent Performance panel

API control endpoints:

- `/api/agents/run`
- `/api/agents/status`
- `/api/crawler/tiles`
- `/api/crawler/queue`

## Compatibility

This upgrade keeps the existing React + Vite frontend and Supabase backend flow while adding distributed crawler capabilities.
