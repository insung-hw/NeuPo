# NeuPo

NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.

The current verified catalog contains 5 Policy Areas, 8 policies, 38 official documents, 41 policy-document links, and 24 dated status assessments. Counts displayed in the UI are derived from the loaded catalog.

## Product routes

- `/` — policy-native overview, coverage, status framework, and methodology
- `/policies` — searchable and filterable source-traced policy catalog
- `/energy` — permanent redirect to `/policies`
- `/register` — signup
- `/api/policies` — full policy catalog
- `/api/policies/:policyId` — one policy, for example `POL-001`
- `/api/signup` — email signup
- `/robots.txt`, `/sitemap.xml`, `/llms.txt` — machine-readable public identity

The former sector pages and pillar APIs are removed.

## Architecture

```text
src/
  components/
    policies/                 Policy filters, cards, axes, and evidence
    PolicyCoverageSection.tsx Derived five-area/eight-policy coverage
    PolicyStatusOverviewSection.tsx
    MethodologySection.tsx
  data/
    policy-domain.ts          Validation, catalog building, filtering, summaries
    policy-areas.content.json Canonical area mapping
    policies.content.json     Bundled source-traced dataset
  lib/policies-loader.ts      SSR/API data loader
  pages/index.tsx             Homepage
  pages/policies.tsx          Canonical catalog page
  server/
    data/policy-repo.ts       Supabase reads with validated fallback
    api/policies/             Catalog endpoints
    entry.ts                  Express APIs, SEO text routes, production SSR
supabase/
  schema.sql                  Fresh policy schema
  seed.sql                    Reproducible policy seed
  migrations/20260726_policy_areas.sql
  signups.sql
```

## Data model and provenance

Canonical Policy Areas are `tax-incentives`, `grid-transmission`, `permitting-siting`, `trade-supply-chain`, and `offshore-wind`.

Each policy keeps legal, implementation, and litigation as independent axes. Evidence retains official document identifiers and URLs when available, citation locators, controlling-source relationships, source tiers, link-review state and dates, confidence, reviewer status, assessment dates, and explicit analyst-inference flags. NeuPo does not derive a percentage, score, budget, project count, or completion metric from those statuses.

The research workbook is the upstream editorial source. `npm run data:import` regenerates `src/data/policies.content.json`; `npm run data:seed` regenerates `supabase/seed.sql`. Review both generated artifacts together.

## Local development

Node.js 22 or newer is required.

```powershell
npm install
npm run dev
npm test -- --run
npm run type-check
npm run build
```

Production builds create the client under `dist/server/client` and the Express SSR bundle at `dist/server/entry.js`.

## Supabase

Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` on the server. If either is absent or a policy read fails, the repository returns the bundled validated catalog and logs the failure. This supports local development and continuity, but operators must still verify the database row counts after migration.

See [docs/DATABASE-SETUP.md](docs/DATABASE-SETUP.md) for the existing-database transaction, fresh-database sequence, row-count checks, and safety warnings.

## Scope and disclaimer

NeuPo presents research information, not legal advice. Analyst interpretation is visibly labeled. Signup is a waitlist/update subscription; there is no user-login system.
