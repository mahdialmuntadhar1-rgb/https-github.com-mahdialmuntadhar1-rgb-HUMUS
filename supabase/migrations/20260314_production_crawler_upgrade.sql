-- Phase 1/2: tile and queue architecture
create extension if not exists "uuid-ossp";

create table if not exists crawl_tiles (
  id uuid primary key default uuid_generate_v4(),
  governorate text not null,
  city text,
  lat double precision not null,
  lng double precision not null,
  radius integer not null,
  status text not null default 'pending',
  last_crawled_at timestamptz,
  priority integer not null default 50,
  created_at timestamptz not null default now()
);

create table if not exists crawl_queue (
  id uuid primary key default uuid_generate_v4(),
  tile_id uuid not null references crawl_tiles(id) on delete cascade,
  source text not null,
  status text not null default 'pending',
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  processed_at timestamptz,
  assigned_agent text
);

create table if not exists data_quality_reports (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid,
  issue_type text not null,
  severity text not null,
  details text not null,
  created_at timestamptz not null default now()
);

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text,
  role text not null default 'owner',
  created_at timestamptz not null default now()
);

create table if not exists business_claims (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null,
  user_id uuid not null references users(id) on delete cascade,
  status text not null default 'pending',
  evidence text,
  created_at timestamptz not null default now()
);

create table if not exists posts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null,
  user_id uuid not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists media (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null,
  user_id uuid references users(id) on delete set null,
  media_url text not null,
  media_type text not null default 'image',
  created_at timestamptz not null default now()
);

-- Performance indexes
create index if not exists idx_businesses_governorate on businesses(governorate);
create index if not exists idx_businesses_category on businesses(category);
create index if not exists idx_businesses_city on businesses(city);
create index if not exists idx_businesses_phone on businesses(phone);
create index if not exists idx_businesses_dedupe_key on businesses(dedupe_key);
create index if not exists idx_businesses_lat on businesses(lat);
create index if not exists idx_businesses_lng on businesses(lng);
create index if not exists idx_businesses_website on businesses(website);
create index if not exists idx_businesses_name_lower on businesses((lower(name)));

create index if not exists idx_crawl_queue_status_created on crawl_queue(status, created_at);
create index if not exists idx_crawl_tiles_status_priority on crawl_tiles(status, priority desc);

-- Queue claim function for distributed workers
create or replace function claim_next_crawl_job(p_agent_name text)
returns setof crawl_queue
language plpgsql
as $$
declare
  target_id uuid;
begin
  select id
  into target_id
  from crawl_queue
  where status = 'pending'
  order by created_at
  limit 1
  for update skip locked;

  if target_id is not null then
    return query
    update crawl_queue
    set status = 'processing',
        assigned_agent = p_agent_name,
        started_at = now()
    where id = target_id
    returning *;
  end if;
end;
$$;
