# NeuPo Renewable Policy Areas Redesign

**Date:** 2026-07-26  
**Status:** Approved design  
**Scope:** Replace the legacy national-strategy pillars with a source-traced U.S. federal renewable-energy policy tracker.

## 1. Background

NeuPo currently presents Social, Political, Economic, and Energy as four strategic pillars. The Social, Political, and Economic content is placeholder data, while the Energy section is backed by `us_renewable_policy_data.xlsx` and a separate relational policy model. This creates a misleading product structure: the homepage and navigation imply four equally supported domains, but only federal renewable-energy policy has verified, source-traced data.

NeuPo will become a single-domain U.S. federal renewable-energy policy tracking service. The generic pillar layer will be removed and replaced by policy areas derived from the real dataset.

The primary product description is:

> NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.

## 2. Goals

- Present only verified renewable-energy policy data.
- Replace `pillar` terminology with intuitive Policy Areas.
- Remove placeholder Social, Political, Economic, and Military claims from the UI, routes, SEO, code, and database.
- Preserve the dataset's three independent status axes and official-source evidence.
- Provide a safe, transactional Supabase migration that the user can apply manually.
- Keep the workbook-to-JSON-to-Supabase pipeline reproducible and auditable.
- Derive all policy counts and status summaries from loaded data rather than hardcoded marketing values.

## 3. Non-goals

- Adding new policy records or researching additional sectors.
- Reintroducing Social, Political, Economic, or Military sections without verified datasets.
- Inventing progress percentages, budgets, projects, or objectives that are absent from the workbook.
- Changing the signup feature or adding authentication.
- Automatically executing the Supabase migration against the remote database.

## 4. Information Architecture

NeuPo is a single renewable-energy policy product rather than a multi-pillar platform.

### Public navigation

- **Overview** — `/`
- **Policies** — `/policies`
- **Methodology** — a methodology section on the overview page, addressable by an anchor
- **Sign up** — `/register`

Official sources remain attached to each policy and its three status assessments. A separate source library page is not required for this iteration.

### Route behavior

- `/policies` is the canonical policy tracker route.
- `/energy` permanently redirects to `/policies` because it represents the same verified content under the old name.
- `/social`, `/political`, `/economic`, and `/military` are removed and resolve through the normal 404 route.
- Removed routes are deleted from the sitemap; `/policies` is added.

## 5. Policy Area Taxonomy

The canonical Policy Areas are:

| Slug | Label | Initial policies |
| --- | --- | --- |
| `tax-incentives` | Tax & Incentives | POL-001, POL-002, POL-003 |
| `grid-transmission` | Grid & Transmission | POL-005, POL-006 |
| `permitting-siting` | Permitting & Siting | POL-007 |
| `trade-supply-chain` | Trade & Supply Chain | POL-004 |
| `offshore-wind` | Offshore Wind | POL-008 |

Each policy belongs to exactly one canonical Policy Area in this iteration. The workbook's original `policy_area` value is retained as provenance, even when its wording is inconsistent or machine-oriented.

## 6. Database Design

### New table

`policy_areas` contains:

- `slug text primary key`
- `label text not null`
- `description text not null`
- `sort_order integer not null`

Public anonymous read access follows the same RLS posture as the existing policy tables. No anonymous write policies are added.

### Updated `policies` table

- Remove `pillar_slug`.
- Replace the existing free-text classification with:
  - `policy_area_slug text not null references policy_areas(slug)`
  - `source_policy_area text not null`, preserving the workbook value
- Keep all policy content, status, agency, milestone, confidence, and review fields.

### Preserved tables

The following evidence tables retain their current structure and foreign-key relationships:

- `policy_documents`
- `policy_document_links`
- `policy_status_assessments`

### Removed legacy tables

- `projects`
- `pillars`

Their seed data and application repository paths are also removed. The evidence-backed policy tables become the only public content model.

### Migration safety

The migration file will:

1. Run inside a transaction.
2. Create and seed the five canonical Policy Areas.
3. Preserve the existing workbook classification as `source_policy_area`.
4. Map all eight existing policy IDs to a canonical Policy Area.
5. Assert that no policy remains unmapped or references an unknown area.
6. Add the required foreign key and indexes.
7. Remove `pillar_slug` and the obsolete free-text classification column after validation.
8. Drop `projects` and `pillars` only after policy migration succeeds.
9. Recreate or update RLS policies as needed.

Any failed assertion rolls back the entire transaction, leaving the existing database unchanged.

The repository will include both an existing-database migration and updated canonical schema/seed files for fresh installations.

## 7. Data Pipeline

The source chain remains:

```text
us_renewable_policy_data.xlsx
  -> workbook conversion and validation
  -> bundled policy JSON
  -> Supabase seed SQL
```

The implementation will rename Energy-specific application modules toward policy-oriented names where doing so removes obsolete product terminology. The conversion step applies an explicit workbook-value-to-Policy-Area mapping. Unknown values cause generation to fail with the policy ID and unrecognized value; they are never silently assigned to a default area.

Before generating JSON or SQL, validation checks:

- every policy maps to one known Policy Area;
- policy, document, link, and assessment IDs are unique;
- all link and assessment foreign keys resolve;
- every policy has the three required assessment types;
- controlling and primary document references resolve;
- required status and provenance fields are present.

The bundled JSON remains a verified fallback when Supabase is unset or temporarily unavailable. The database and bundled JSON expose the same application-facing policy shape.

## 8. Application Components and Data Flow

### Repository and API

- Replace the legacy aggregate pillars repository with a policy repository.
- Load Policy Areas, policies, documents, links, and assessments from Supabase.
- Join them into policy records with evidence before returning them to SSR loaders and API consumers.
- Keep a short in-memory cache and the verified bundled JSON fallback.
- Expose policy-list data through a policy-oriented endpoint rather than `/api/pillars`.

### Policies page

`/policies` presents the eight current policies and supports filters for:

- Policy Area
- Legal status
- Implementation status
- Litigation status

Policy cards retain the current evidence-rich detail: status explanations, requirements, limits, milestones, confidence, assessments, controlling sources, citations, and official links. Filtering happens against loaded data and does not discard evidence.

### Overview page

- Use the approved product description verbatim in the Hero and matching metadata where length permits.
- Replace “Four Pillars” with a `Policy Coverage` section showing the five Policy Areas and derived policy counts.
- Replace decorative or invented completion percentages with a current-status overview derived from the three real status axes.
- Remove fabricated project totals and claims about USASpending, BEA, DoD, or other sources not used by this dataset.
- Rewrite methodology and mission copy to describe official-source tracking, dated assessments, confidence, analyst inference, and the distinction between legal, implementation, and litigation status.
- Preserve the signup CTA without implying unavailable platform features.

## 9. Error Handling

- Unknown policy IDs return 404.
- Removed legacy routes use the standard 404 page; `/energy` alone redirects to `/policies`.
- A configured Supabase request failure uses the bundled verified dataset and logs a server-side error.
- Missing optional official URLs are rendered without a broken link.
- Unknown status vocabulary is displayed as a readable fallback label and is surfaced by tests rather than causing a blank page.
- Unknown Policy Areas stop the data-generation pipeline.
- Database migration validation failures abort and roll back before legacy tables are dropped.

## 10. Testing and Verification

### Automated coverage

- Workbook classification mapping for all eight policies.
- Rejection of unknown or missing Policy Areas.
- Referential-integrity checks for documents, links, and assessments.
- Supabase row-to-policy mapping and bundled JSON fallback.
- Policy Area and three-axis filter behavior.
- Derived overview counts with no hardcoded policy totals.
- `/energy` redirect and removal of legacy routes.
- Absence of Social, Political, Economic, Military, Four Pillars, and fabricated progress/source claims from public content and SEO.
- API 200, 404, and fallback behavior.

### Final verification

- `npm run type-check`
- `npm test`
- `npm run build`
- Start the production SSR server and check `/`, `/policies`, `/energy`, one removed route, the policy API, and sitemap output.
- Inspect the rendered overview and policies pages at desktop and mobile widths.
- Run the migration SQL against a disposable/local equivalent when available, or perform static transaction and assertion review when no safe test database exists.

## 11. Rollout

1. Commit application, schema, seed, migration, and documentation changes together after tests pass.
2. Give the user the migration SQL path and exact Supabase execution order.
3. The user backs up or exports the current Supabase data, then applies the transaction in the Supabase SQL Editor.
4. Verify policy and evidence row counts after migration.
5. Deploy the website changes.
6. Confirm production SSR, policy filters, official-source links, redirects, sitemap, and signup behavior.

Because the application retains the verified bundled fallback, a temporary Supabase read failure does not replace real content with mock data or blank the site.

## 12. Acceptance Criteria

- No public page or metadata presents NeuPo as a four-sector or national-strategy tracker.
- The approved product description is used on the homepage.
- Social, Political, Economic, and Military pages and navigation entries are gone.
- The five Policy Areas and their policy counts come from real data.
- All eight policies remain available with their three status axes and official-source evidence.
- The database contains no `pillars`, `projects`, or `pillar_slug` dependency after migration.
- An unknown workbook classification fails generation instead of being silently accepted.
- All automated checks and the production build pass.
