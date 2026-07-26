-- ---------------------------------------------------------------------------
-- NeuPo — database schema
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It is safe to re-run: it drops and recreates the two tables and their policies.
-- ---------------------------------------------------------------------------

-- Drop in dependency order (projects references pillars).
drop table if exists public.projects cascade;
drop table if exists public.pillars cascade;

-- Pillars: the three top-level domains (social / political / economic).
create table public.pillars (
  slug        text primary key,
  label       text not null,
  description text not null,
  sort_order  integer not null default 0
);

-- Projects: every objective / policy / project belongs to one pillar.
create table public.projects (
  id          text primary key,
  pillar_slug text not null references public.pillars(slug) on delete cascade,
  category    text not null check (category in ('Objectives', 'Policies', 'Projects')),
  title       text not null,
  agency      text not null,
  status      text not null check (status in ('On Track', 'Delayed', 'Completed', 'At Risk')),
  progress    integer not null check (progress between 0 and 100),
  budget      text not null default 'N/A',
  description text not null,
  source      text not null,
  source_url  text,
  sort_order  integer not null default 0
);

-- Speeds up the "all projects for a pillar" query the API runs.
create index projects_pillar_idx on public.projects (pillar_slug, sort_order);

-- ---------------------------------------------------------------------------
-- Row Level Security: the site reads with the public "anon" key, so we must
-- explicitly allow anonymous SELECT. No INSERT/UPDATE/DELETE policies are
-- created, so the anon key can only READ — edits happen in the Supabase
-- dashboard (which uses a privileged key) or via the SQL editor.
-- ---------------------------------------------------------------------------
alter table public.pillars  enable row level security;
alter table public.projects enable row level security;

create policy "Public read access - pillars"
  on public.pillars for select
  using (true);

create policy "Public read access - projects"
  on public.projects for select
  using (true);
