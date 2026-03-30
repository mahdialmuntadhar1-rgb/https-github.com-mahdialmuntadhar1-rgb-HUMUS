import express from 'express';
import { runGovernor } from '../server/governors/index.ts';
import { supabaseAdmin } from '../server/supabase-admin.ts';

const app = express();
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  const [agentsCheck, tasksCheck, logsCheck, businessesCheck] = await Promise.all([
    supabaseAdmin.from('agents').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('agent_tasks').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('agent_logs').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('businesses').select('id', { count: 'exact', head: true }),
  ]);

  const errors = [agentsCheck.error, tasksCheck.error, logsCheck.error, businessesCheck.error].filter(Boolean);
  res.json({
    status: errors.length ? 'degraded' : 'ok',
    persistence: 'supabase',
    tables: {
      agents: agentsCheck.error ? 'unreachable' : 'ok',
      agent_tasks: tasksCheck.error ? 'unreachable' : 'ok',
      agent_logs: logsCheck.error ? 'unreachable' : 'ok',
      businesses: businessesCheck.error ? 'unreachable' : 'ok',
    },
    detail: errors.map((e) => e?.message).join('; ') || null,
  });
});

app.get('/api/agents', async (_req, res) => {
  const { data, error } = await supabaseAdmin.from('agents').select('*').order('agent_name');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

app.post('/api/orchestrator/start', async (_req, res) => {
  const { data: agents, error: fetchError } = await supabaseAdmin
    .from('agents')
    .select('agent_name, category, government_rate')
    .order('agent_name');

  if (fetchError) return res.status(500).json({ error: fetchError.message });

  const agentRows = (agents ?? []).filter((row) => row.agent_name);

  await supabaseAdmin.from('agent_logs').insert({
    agent_name: 'system',
    action: 'orchestrator_start',
    details: `Queued ${agentRows.length} agent run(s)`,
    created_at: new Date().toISOString(),
  });

  if (agentRows.length) {
    await supabaseAdmin.from('agents').update({ status: 'running' }).in('agent_name', agentRows.map((r) => r.agent_name));
  }

  // Fire-and-forget: trigger governors in background without awaiting
  agentRows.forEach((agent) => {
    runGovernor(agent.agent_name).catch((err: Error) => {
      console.error(`Background run failed for ${agent.agent_name}:`, err.message);
    });
  });

  const { data: updatedAgents } = await supabaseAdmin.from('agents').select('*').order('agent_name');
  res.json({
    status: 'queued',
    queuedAgents: agentRows.length,
    agents: updatedAgents ?? [],
  });
});

app.post('/api/orchestrator/stop', async (_req, res) => {
  const [{ error: statusError }, { error: taskError }, { error: logError }] = await Promise.all([
    supabaseAdmin.from('agents').update({ status: 'idle' }).neq('agent_name', ''),
    supabaseAdmin
      .from('agent_tasks')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .in('status', ['pending', 'running']),
    supabaseAdmin.from('agent_logs').insert({
      agent_name: 'system',
      action: 'orchestrator_stop',
      details: 'Orchestrator stop requested; pending/running tasks marked failed',
      created_at: new Date().toISOString(),
    }),
  ]);

  const error = statusError || taskError || logError;
  if (error) return res.status(500).json({ error: error.message });

  const { data } = await supabaseAdmin.from('agents').select('*').order('agent_name');
  res.json({ status: 'stopped', agents: data ?? [] });
});

app.post('/api/agents/:agentName/run', async (req, res) => {
  const { agentName } = req.params;
  const taskId = `manual_${Date.now()}`;

  // Respond immediately — governor runs in background
  res.json({ status: 'running', agentName, taskId });

  runGovernor(agentName).catch((err: Error) => {
    console.error(`Background agent run failed for ${agentName}:`, err.message);
  });
});

app.get('/api/sources', async (_req, res) => {
  const sources = [
    {
      id: 'gemini',
      name: 'Gemini AI Research',
      description: 'AI-powered web research for Iraqi businesses',
      enabled: !!process.env.GEMINI_API_KEY,
      reliability: 'high',
      coverage: 'Iraq-wide',
      rateLimit: '60 requests/minute',
    },
    {
      id: 'google-places',
      name: 'Google Places',
      description: 'Global business directory via Google',
      enabled: !!process.env.GOOGLE_PLACES_API_KEY,
      reliability: 'medium',
      coverage: 'Limited in Iraq',
      rateLimit: '100 requests/day (free tier)',
    },
    {
      id: 'yelp',
      name: 'Yelp',
      description: 'Review and business data platform',
      enabled: !!process.env.YELP_API_KEY,
      reliability: 'low',
      coverage: 'Not available in Iraq',
      rateLimit: '5000 requests/day',
    },
    {
      id: 'manual',
      name: 'Manual Import',
      description: 'User-uploaded CSV data',
      enabled: true,
      reliability: 'high',
      coverage: 'User-dependent',
      rateLimit: 'N/A',
    },
  ];
  res.json({ sources });
});

// POST /api/discovery/run — responds immediately (started), runs governor in background
app.post('/api/discovery/run', async (req, res) => {
  const { city, category, sources, limit = 10 } = req.body;

  if (!city || !category) {
    return res.status(400).json({ error: 'Missing required fields: city, category' });
  }

  const runId = `discovery_${Date.now()}`;

  // Log discovery start (non-blocking)
  void supabaseAdmin.from('agent_logs').insert({
    agent_name: 'discovery-orchestrator',
    action: 'discovery_start',
    details: `Multi-source discovery started for ${category} in ${city}. Sources: ${(sources || ['gemini']).join(', ')}. Limit: ${limit}`,
    created_at: new Date().toISOString(),
  });

  const agentMapping: Record<string, string> = {
    restaurants: 'Agent-01',
    cafes: 'Agent-02',
    bakeries: 'Agent-03',
    hotels: 'Agent-04',
    gyms: 'Agent-05',
    beauty_salons: 'Agent-06',
    pharmacies: 'Agent-07',
    supermarkets: 'Agent-08',
  };

  const agentName = agentMapping[category.toLowerCase()] || 'Agent-01';

  // Respond immediately — Vercel serverless can't await a long-running governor
  res.json({
    runId,
    status: 'started',
    city,
    category,
    sourcesUsed: sources || ['gemini'],
    totalFound: 0,
    message: `Discovery run started for ${category} in ${city}. Results will appear shortly.`,
  });

  // Fire-and-forget: run governor after responding
  runGovernor(agentName)
    .then(async () => {
      const { count } = await supabaseAdmin
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('city', city)
        .eq('category', category.toLowerCase());

      await supabaseAdmin.from('agent_logs').insert({
        agent_name: 'discovery-orchestrator',
        action: 'discovery_complete',
        details: `Discovery run ${runId} completed for ${category} in ${city}. Total businesses: ${count ?? 0}`,
        created_at: new Date().toISOString(),
      });
    })
    .catch(async (error: Error) => {
      void supabaseAdmin.from('agent_logs').insert({
        agent_name: 'discovery-orchestrator',
        action: 'discovery_failed',
        details: `Discovery run ${runId} failed: ${error.message}`,
        created_at: new Date().toISOString(),
      });
    });
});

app.get('/api/businesses', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const city = req.query.city as string;
  const category = req.query.category as string;
  const source = req.query.source as string;
  const status = req.query.status as string;
  const search = req.query.search as string;

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabaseAdmin
    .from('businesses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(start, end);

  if (city && city !== 'All') query = query.eq('city', city);
  if (category && category !== 'All') query = query.eq('category', category.toLowerCase());
  if (source && source !== 'All') query = query.eq('source_name', source);
  if (status && status !== 'All') query = query.eq('verification_status', status.toLowerCase());
  if (search) query = query.ilike('business_name', `%${search}%`);

  const { data, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  const totalPages = Math.ceil((count || 0) / pageSize);
  res.json({
    data: data || [],
    pagination: {
      page,
      pageSize,
      totalItems: count || 0,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

app.get('/api/businesses/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabaseAdmin.from('businesses').select('*').eq('id', id).single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'Business not found' });

  res.json(data);
});

export default app;
