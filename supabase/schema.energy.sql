-- ---------------------------------------------------------------------------
-- NeuPo — energy policy schema (research dataset)
-- Run this ONCE in the Supabase SQL Editor, after schema.sql.
-- It is safe to re-run: it drops and recreates the four tables and policies.
--
-- These tables are deliberately NOT shaped like public.projects. The legacy
-- pillars store one flat row per item; a policy here is a record with three
-- independent status axes, backed by official documents and dated assessments.
-- The app adapts these rows onto the shared card UI at read time
-- (src/data/energy.ts), so the source data keeps its full fidelity and the
-- site can move to a policy-native UI without a migration.
-- ---------------------------------------------------------------------------

-- Drop in dependency order (children reference policies/documents).
drop table if exists public.policy_status_assessments cascade;
drop table if exists public.policy_document_links cascade;
drop table if exists public.policy_documents cascade;
drop table if exists public.policies cascade;

-- Policies: one row per tracked federal policy cluster.
create table public.policies (
  policy_id                 text primary key,
  pillar_slug               text not null default 'energy',
  policy_title              text not null,
  policy_area               text not null,
  short_summary             text not null,
  -- Three independent status axes. Kept as free text rather than enums so a
  -- refreshed research workbook can introduce a new value without a migration;
  -- the vocabulary in use is documented in src/data/energy.ts.
  legal_status              text not null,
  implementation_status     text not null,
  litigation_status         text not null,
  status_as_of              date not null,
  status_explanation        text not null,
  effective_requirements    text not null,
  inactive_or_limited_scope text,
  lead_agencies             text[] not null default '{}',
  affected_entities         text[] not null default '{}',
  next_milestone            text,
  confidence                text not null,
  review_status             text not null,
  sort_order                integer not null default 0
);

-- Documents: the official record behind every status statement.
create table public.policy_documents (
  document_id           text primary key,
  document_type         text not null,
  title                 text not null,
  issuing_body          text not null,
  publication_date      date,
  effective_date        date,
  official_identifier   text not null,
  official_page_url     text,
  official_text_url     text,
  citation_locator      text,
  proposition_supported text,
  -- 1 = enacted law / final rule / official judicial record, 2 = agency
  -- implementation guidance, 3 = government press or explanatory page,
  -- 4 = non-government commentary. Tiers 3-4 never serve as controlling evidence.
  source_tier           integer not null check (source_tier between 1 and 4),
  document_effect       text not null,
  link_checked_at       date,
  link_status           text not null,
  is_legal_anchor       boolean not null default false,
  notes                 text
);

-- Links: which document supports which policy, and how.
create table public.policy_document_links (
  link_id               text primary key,
  policy_id             text not null references public.policies(policy_id) on delete cascade,
  document_id           text not null references public.policy_documents(document_id) on delete cascade,
  relationship_type     text not null,
  relationship_summary  text not null,
  scope_affected        text,
  valid_from            date,
  valid_to              date,
  is_controlling_source boolean not null default false,
  unique (policy_id, document_id, relationship_type)
);

-- Assessments: the dated finding for each status axis, with its citation.
create table public.policy_status_assessments (
  assessment_id           text primary key,
  policy_id               text not null references public.policies(policy_id) on delete cascade,
  assessment_date         date not null,
  assessment_type         text not null
    check (assessment_type in ('legal_status', 'implementation_status', 'litigation_status')),
  assessment_value        text not null,
  assessment_summary      text not null,
  primary_document_id     text references public.policy_documents(document_id) on delete set null,
  supporting_document_ids text[] not null default '{}',
  citation_locator        text,
  -- true when the value is the analyst's reading rather than a direct quote
  -- from the cited document. Surfaced in the UI so readers can weigh it.
  analyst_inference       boolean not null default false,
  confidence              text not null,
  reviewer_status         text not null
);

-- The read paths are "all policies for a pillar" and "everything for a policy".
create index policies_pillar_idx on public.policies (pillar_slug, sort_order);
create index policy_document_links_policy_idx on public.policy_document_links (policy_id);
create index policy_status_assessments_policy_idx on public.policy_status_assessments (policy_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: same posture as the legacy tables — the site reads with
-- the public "anon" key, so anonymous SELECT is granted explicitly and no
-- write policies exist. Edits happen in the dashboard or the SQL editor.
-- ---------------------------------------------------------------------------
alter table public.policies                 enable row level security;
alter table public.policy_documents         enable row level security;
alter table public.policy_document_links    enable row level security;
alter table public.policy_status_assessments enable row level security;

create policy "Public read access - policies"
  on public.policies for select using (true);

create policy "Public read access - policy_documents"
  on public.policy_documents for select using (true);

create policy "Public read access - policy_document_links"
  on public.policy_document_links for select using (true);

create policy "Public read access - policy_status_assessments"
  on public.policy_status_assessments for select using (true);
