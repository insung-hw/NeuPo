# NeuPo development guide

NeuPo is a source-traced U.S. federal renewable-energy policy tracker. Public copy, data, APIs, navigation, SEO, and documentation must use that identity.

## Invariants

- Canonical areas are exactly `tax-incentives`, `grid-transmission`, `permitting-siting`, `trade-supply-chain`, and `offshore-wind`.
- Legal, implementation, and litigation are independent status axes. Never synthesize them into progress, percentages, or scores.
- Do not invent budgets, projects, objectives, source claims, or numeric metrics.
- Preserve official documents, citations, source relationships, source tiers, confidence, review status, dates, link status/check dates, and `analystInference` visibility.
- Render an official-source anchor only when the document has a URL.
- Counts in product UI must be derived from `PolicyCatalog` arrays.
- Signup remains supported. NeuPo provides research information, not legal advice.

## Runtime flow

```text
Browser/SSR request
  -> React Router loader (`loadPolicyCatalog`)
  -> SSR: `server/data/policy-repo.ts`
     Browser navigation: `/api/policies`
  -> Supabase policy tables when configured and available
  -> validated bundled `fallbackPolicyCatalog` on missing config/read failure
```

The fallback lives in `src/data/policies.content.json`. It is a continuity mechanism, not permission to ignore a failed database migration.

## Routes and APIs

Pages: `/`, `/policies`, `/register`; `/energy` is a 301 redirect; `*` is the 404 route.

APIs: `GET /api/health`, `POST /api/contact/:formName`, `GET /api/policies`, `GET /api/policies/:policyId`, and `POST /api/signup`.

API handlers must be imported and registered inside the marked blocks in `src/server/entry.ts`.

## Primary files

- `src/data/policy-domain.ts`: types, validation, catalog construction, filtering, summaries
- `src/data/policy-areas.content.json`: canonical mapping and labels
- `src/data/policies.content.json`: bundled dataset
- `src/components/policies/`: filters, cards, three axes, expandable evidence
- `src/pages/index.tsx`: policy-native homepage and metadata
- `src/pages/policies.tsx`: catalog route
- `src/server/data/policy-repo.ts`: database/fallback boundary
- `supabase/schema.sql`, `supabase/seed.sql`: fresh database
- `supabase/migrations/20260726_policy_areas.sql`: existing database transaction; operator-run only

## Commands

```powershell
npm run data:import
npm run data:seed
npm run type-check
npm test -- --run
npm run lint
npm run build
node dist/server/entry.js
```

The data refresh must report 8 policies, 38 documents, 41 links, and 24 assessments. Generated JSON and SQL should be reviewed and committed together.

## Database operations

Never execute `supabase/migrations/20260726_policy_areas.sql` remotely on the user's behalf. Existing databases require a backup, one full transaction run in Supabase SQL Editor, exact count verification, confirmation that `pillars` and `projects` are gone, then deployment of the matching application commit. Fresh databases run `schema.sql`, `seed.sql`, and `signups.sql` in order.

## Verification

For UI/route changes, run the focused explorer, homepage, routes, entry, and llms/sitemap tests, then client and SSR builds. Check public source for legacy routes/copy. Workspace-wide tests and TypeScript may have unrelated baseline failures; report them precisely and use changed-slice checks rather than silently repairing unrelated code.
