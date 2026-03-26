-- Canonical schema for autonomous agent runtime
-- Apply this file in Supabase SQL editor (or migration runner) as a single source of truth.

create extension if not exists "pgcrypto";

create table if not exists agents (
  id uuid primary key default gen_random_uuid(),
  agent_name text unique not null,
  category text not null,
  status text not null default 'idle' check (status in ('idle', 'active', 'error')),
  government_rate text,
  records_collected integer not null default 0,
  errors integer not null default 0,
  last_run timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists agent_tasks (
  id bigserial primary key,
  city text not null,
  category text not null,
  government_rate text not null,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  attempts integer not null default 0,
  assigned_agent text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_agent_tasks_status_created on agent_tasks(status, created_at);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  government_rate text,
  city text not null,
  address text,
  phone text,
  website text,
  description text,
  source_url text,
  created_by_agent text,
  verification_status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_business_name_city unique (name, city)
);

create table if not exists agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete set null,
  action text not null,
  result text not null,
  records_added integer not null default 0,
  records_updated integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function claim_next_task(agent_name text)
returns setof agent_tasks
language plpgsql
as $$
declare
  target_id bigint;
begin
  select id
    into target_id
  from agent_tasks
  where status = 'pending'
  order by created_at
  limit 1
  for update skip locked;

  if target_id is null then
    return;
  end if;

  return query
  update agent_tasks
  set status = 'processing',
      assigned_agent = agent_name,
      updated_at = now()
  where id = target_id
  returning *;
end;
$$;

alter publication supabase_realtime add table agents;
alter publication supabase_realtime add table agent_tasks;
alter publication supabase_realtime add table businesses;
alter publication supabase_realtime add table agent_logs;
