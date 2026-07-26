-- ---------------------------------------------------------------------------
-- NeuPo — waitlist / newsletter signups
-- Run this ONCE in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- It stores emails captured from the hero form, footer newsletter, and the
-- /register page. Safe to re-run.
-- ---------------------------------------------------------------------------

create table if not exists public.signups (
  email      text primary key,
  source     text not null default 'web',
  created_at timestamptz not null default now()
);

-- RLS: allow anonymous INSERT (the public site writes here through the anon
-- key), but NO select/update/delete policies — so the email list can never be
-- read back through the public API. View signups in the Supabase Table Editor,
-- which uses a privileged key that bypasses RLS.
alter table public.signups enable row level security;

drop policy if exists "Anon insert signups" on public.signups;
create policy "Anon insert signups"
  on public.signups for insert
  to anon
  with check (true);
