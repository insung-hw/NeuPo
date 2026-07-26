# NeuPo database setup and policy migration

NeuPo uses Supabase Postgres for the renewable-policy catalog and email signups. The application falls back to the bundled, validated policy catalog when Supabase is not configured or a catalog read fails. Never treat that fallback as evidence that a database migration succeeded.

## Existing database migration

The migration is destructive to the superseded `pillars` and `projects` tables. Coordinate it with the matching application deployment.

1. Export or back up the current Supabase tables.
2. Open `supabase/migrations/20260726_policy_areas.sql` in the Supabase SQL Editor.
3. Run the entire transaction once. Do not run individual fragments.
4. Verify exactly 5 Policy Areas, 8 policies, 38 documents, 41 links, and 24 assessments.
5. Confirm the `pillars` and `projects` tables no longer exist.
6. Deploy the matching application commit.

Do not execute the migration from an application runtime or automation job. An operator must review and run it in the Supabase SQL Editor.

## Fresh database

Run these files in order in the Supabase SQL Editor:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/signups.sql`

Then configure the server environment:

```text
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

The anon key is intended for public clients, but the service-role key must never be committed or exposed to the browser.

## Verification queries

```sql
select count(*) from policy_areas;              -- 5
select count(*) from policies;                  -- 8
select count(*) from policy_documents;          -- 38
select count(*) from policy_document_links;     -- 41
select count(*) from policy_status_assessments; -- 24
```

Confirm that every policy has one legal, one implementation, and one litigation assessment. Review RLS policies before production deployment.

## Refreshing generated data

The research workbook is converted into the bundled JSON catalog and then into seed SQL:

```powershell
npm run data:import
npm run data:seed
```

Expected import totals are 8 policies, 38 documents, 41 links, and 24 assessments. Review the generated diff, run the domain/content/seed tests, and deploy the application and database artifacts from the same commit.

## Runtime behavior

- SSR reads through `src/server/data/policy-repo.ts`.
- Browser navigation reads `GET /api/policies` and `GET /api/policies/:policyId`.
- With valid Supabase configuration, the repository reads the policy tables.
- Without configuration, on connection failure, or when the new tables are unavailable, it logs the issue and returns the bundled catalog from `src/data/policies.content.json`.
- Signup remains available through `POST /api/signup` after `supabase/signups.sql` is applied.

The fallback preserves availability; it must not hide schema drift during migration verification.
