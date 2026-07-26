begin;

create table if not exists public.policy_areas (
  slug text primary key,
  label text not null,
  description text not null,
  sort_order integer not null default 0
);

insert into public.policy_areas (slug, label, description, sort_order) values
  ('tax-incentives', 'Tax & Incentives', 'Federal clean-energy credits and location or sourcing bonuses.', 0),
  ('grid-transmission', 'Grid & Transmission', 'Generator interconnection and long-term transmission planning reforms.', 1),
  ('permitting-siting', 'Permitting & Siting', 'Federal environmental review, permitting, and siting policy.', 2),
  ('trade-supply-chain', 'Trade & Supply Chain', 'Trade remedies and supply conditions affecting renewable-energy deployment.', 3),
  ('offshore-wind', 'Offshore Wind', 'Federal leasing and permitting policy specific to offshore wind.', 4)
on conflict (slug) do update set
  label = excluded.label,
  description = excluded.description,
  sort_order = excluded.sort_order;

alter table public.policies add column if not exists source_policy_area text;
alter table public.policies add column if not exists policy_area_slug text;

update public.policies
set source_policy_area = coalesce(source_policy_area, policy_area),
    policy_area_slug = case policy_id
      when 'POL-001' then 'tax-incentives'
      when 'POL-002' then 'tax-incentives'
      when 'POL-003' then 'tax-incentives'
      when 'POL-004' then 'trade-supply-chain'
      when 'POL-005' then 'grid-transmission'
      when 'POL-006' then 'grid-transmission'
      when 'POL-007' then 'permitting-siting'
      when 'POL-008' then 'offshore-wind'
      else policy_area_slug
    end;

do $$
begin
  if exists (select 1 from public.policies where source_policy_area is null or policy_area_slug is null) then
    raise exception 'Policy Area migration aborted: at least one policy is unmapped';
  end if;
  if exists (
    select 1 from public.policies p
    left join public.policy_areas a on a.slug = p.policy_area_slug
    where a.slug is null
  ) then
    raise exception 'Policy Area migration aborted: at least one area slug is invalid';
  end if;
end $$;

alter table public.policies alter column source_policy_area set not null;
alter table public.policies alter column policy_area_slug set not null;
alter table public.policies
  add constraint policies_policy_area_slug_fkey
  foreign key (policy_area_slug) references public.policy_areas(slug);

create index policies_area_idx on public.policies (policy_area_slug, sort_order);

alter table public.policies drop column if exists pillar_slug;
alter table public.policies drop column if exists policy_area;

drop table if exists public.projects;
drop table if exists public.pillars;

alter table public.policy_areas enable row level security;

create policy "Public read access - policy_areas"
  on public.policy_areas for select using (true);

commit;
