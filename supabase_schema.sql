-- SQL Schema for Iraq Compass (Supabase)
-- Run this in your Supabase SQL Editor
-- ⚠️ Run each section one at a time if you get errors

-- 1. Businesses Table (High-Fidelity)
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id TEXT UNIQUE NOT NULL, -- unique-slug
  name JSONB NOT NULL, -- { "en": "", "ar": "", "ku": "" }
  category TEXT NOT NULL,
  subcategory TEXT,
  city TEXT NOT NULL,
  district TEXT,
  verified BOOLEAN DEFAULT false,
  verification_score INTEGER DEFAULT 0,
  sources TEXT[] DEFAULT '{}',
  contact JSONB DEFAULT '{ "phone": [], "whatsapp": "", "website": "", "instagram": "", "facebook": "" }',
  location JSONB DEFAULT '{ "google_maps_url": "", "coordinates": { "lat": null, "lng": null }, "address": { "en": "", "ar": "", "ku": "" } }',
  postcard JSONB DEFAULT '{ "logo_url": "", "cover_image_url": "", "tagline": { "en": "", "ar": "", "ku": "" }, "description": { "en": "", "ar": "", "ku": "" }, "highlights": [] }',
  agent_notes TEXT,
  last_verified TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Agents Table (Status Tracking)
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT UNIQUE NOT NULL,
  category TEXT,
  status TEXT DEFAULT 'idle', -- idle, active, error
  records_collected INTEGER DEFAULT 0,
  target INTEGER DEFAULT 1000,
  errors INTEGER DEFAULT 0,
  last_run TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Agent Tasks Table (Work Queue)
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id INTEGER,
  agent_name TEXT,
  task_type TEXT NOT NULL DEFAULT 'chat', -- chat, find, social, clean, verify
  prompt TEXT,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  result TEXT,
  category TEXT,
  city TEXT,
  government_rate TEXT,
  description TEXT,
  assigned_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Agent Logs Table (Activity Tracking)
CREATE TABLE IF NOT EXISTS agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  record_id TEXT,
  records_added INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- 6. Public Read Policies
CREATE POLICY "Public Read Businesses" ON businesses FOR SELECT USING (true);
CREATE POLICY "Public Read Agents" ON agents FOR SELECT USING (true);
CREATE POLICY "Public Read Tasks" ON agent_tasks FOR SELECT USING (true);
CREATE POLICY "Public Read Logs" ON agent_logs FOR SELECT USING (true);

-- 7. Public Write Policies (for anon key — tighten these for production)
CREATE POLICY "Anon Insert Businesses" ON businesses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update Businesses" ON businesses FOR UPDATE USING (true);
CREATE POLICY "Anon Insert Agents" ON agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update Agents" ON agents FOR UPDATE USING (true);
CREATE POLICY "Anon Insert Tasks" ON agent_tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon Update Tasks" ON agent_tasks FOR UPDATE USING (true);
CREATE POLICY "Anon Delete Tasks" ON agent_tasks FOR DELETE USING (true);
CREATE POLICY "Anon Insert Logs" ON agent_logs FOR INSERT WITH CHECK (true);
