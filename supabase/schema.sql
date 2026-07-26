-- Canonical renewable-policy schema for a fresh Supabase installation.
-- Run before seed.sql. Re-running drops and recreates the policy tables.

drop table if exists public.policy_status_assessments cascade;
drop table if exists public.policy_document_links cascade;
drop table if exists public.policy_documents cascade;
drop table if exists public.policies cascade;
drop table if exists public.policy_areas cascade;

create table public.policy_areas (
  slug text primary key,
  label text not null,
  description text not null,
  sort_order integer not null default 0
);

create table public.policies (
  policy_id text primary key,
  policy_area_slug text not null references public.policy_areas(slug),
  source_policy_area text not null,
  policy_title text not null,
  short_summary text not null,
  legal_status text not null,
  implementation_status text not null,
  litigation_status text not null,
  status_as_of date not null,
  status_explanation text not null,
  effective_requirements text not null,
  inactive_or_limited_scope text,
  lead_agencies text[] not null default '{}',
  affected_entities text[] not null default '{}',
  next_milestone text,
  confidence text not null,
  review_status text not null,
  sort_order integer not null default 0
);

create table public.policy_documents (
  document_id text primary key,
  document_type text not null,
  title text not null,
  issuing_body text not null,
  publication_date date,
  effective_date date,
  official_identifier text not null,
  official_page_url text,
  official_text_url text,
  citation_locator text,
  proposition_supported text,
  source_tier integer not null check (source_tier between 1 and 4),
  document_effect text not null,
  link_checked_at date,
  link_status text not null,
  is_legal_anchor boolean not null default false,
  notes text
);

create table public.policy_document_links (
  link_id text primary key,
  policy_id text not null references public.policies(policy_id) on delete cascade,
  document_id text not null references public.policy_documents(document_id) on delete cascade,
  relationship_type text not null,
  relationship_summary text not null,
  scope_affected text,
  valid_from date,
  valid_to date,
  is_controlling_source boolean not null default false,
  unique (policy_id, document_id, relationship_type)
);

create table public.policy_status_assessments (
  assessment_id text primary key,
  policy_id text not null references public.policies(policy_id) on delete cascade,
  assessment_date date not null,
  assessment_type text not null
    check (assessment_type in ('legal_status', 'implementation_status', 'litigation_status')),
  assessment_value text not null,
  assessment_summary text not null,
  primary_document_id text references public.policy_documents(document_id) on delete set null,
  supporting_document_ids text[] not null default '{}',
  citation_locator text,
  analyst_inference boolean not null default false,
  confidence text not null,
  reviewer_status text not null
);

create index policies_area_idx on public.policies (policy_area_slug, sort_order);
create index policy_document_links_policy_idx on public.policy_document_links (policy_id);
create index policy_status_assessments_policy_idx on public.policy_status_assessments (policy_id);

alter table public.policy_areas enable row level security;
alter table public.policies enable row level security;
alter table public.policy_documents enable row level security;
alter table public.policy_document_links enable row level security;
alter table public.policy_status_assessments enable row level security;

create policy "Public read access - policy_areas"
  on public.policy_areas for select using (true);

create policy "Public read access - policies"
  on public.policies for select using (true);

create policy "Public read access - policy_documents"
  on public.policy_documents for select using (true);

create policy "Public read access - policy_document_links"
  on public.policy_document_links for select using (true);

create policy "Public read access - policy_status_assessments"
  on public.policy_status_assessments for select using (true);
