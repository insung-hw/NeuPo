# Renewable Policy Areas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert NeuPo from a placeholder four-sector national-strategy site into a source-traced U.S. federal renewable-energy policy tracker organized by five canonical Policy Areas.

**Architecture:** Replace the pillar/project adapter with a policy-native catalog shared by bundled JSON, Supabase, SSR loaders, APIs, the policy explorer, and the homepage. Preserve the workbook's original classification as provenance while mapping every policy to a normalized `policy_areas` row. Keep Supabase failures safe by returning the same verified bundled catalog, never legacy mock content.

**Tech Stack:** React 19, TypeScript 5.7, React Router 7 loaders, Vite 6 SSR, Express 5, Vitest 4, Tailwind CSS 3, Supabase Postgres/PostgREST, Python workbook conversion, Node.js SQL generation.

## Global Constraints

- Node.js must remain `>=22`.
- Use this approved copy verbatim: “NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.”
- Canonical Policy Areas are exactly `tax-incentives`, `grid-transmission`, `permitting-siting`, `trade-supply-chain`, and `offshore-wind`.
- Do not invent progress percentages, budgets, projects, objectives, or unsupported source claims.
- Preserve legal, implementation, and litigation as three independent status axes.
- Preserve official documents, citations, confidence, review status, and `analyst_inference` visibility.
- Preserve the workbook's original classification in `source_policy_area`.
- Unknown workbook classifications must fail generation; no default Policy Area is allowed.
- The Supabase migration must be transactional and must validate all policy mappings before dropping `pillars` or `projects`.
- Do not execute the migration against the user's remote Supabase project; deliver the SQL for manual application.
- Keep the verified bundled policy JSON as the only database fallback.
- Preserve the existing signup flow and do not add authentication.

---

## File Structure

### Policy domain and generated data

- Create `src/data/policy-areas.content.json`: canonical area labels, descriptions, ordering, and accepted workbook values.
- Create `src/data/policy-domain.ts`: policy/evidence types, validation, catalog assembly, filtering, and status summaries.
- Create `src/data/policies.content.json`: generated workbook payload with canonical and source classifications.
- Create `src/data/policies.ts`: imports generated content and exports the verified fallback catalog.
- Create `src/data/__tests__/policy-domain.test.ts`: pure mapping, validation, filtering, and summary tests.
- Create `src/data/__tests__/policies-content.test.ts`: real generated dataset integrity test.
- Delete `src/data/energy.ts`, `src/data/energy.content.json`, `src/data/pillars.ts`, and `src/data/pillars.content.json` after all consumers move.

### Workbook, SQL, and migration

- Create `supabase/xlsx-to-policies-json.py`: workbook importer, area mapper, and referential validator.
- Create `supabase/policy-seed-lib.mjs`: pure SQL renderer.
- Create `supabase/generate-policy-seed.mjs`: reads generated content and writes canonical seed SQL.
- Create `supabase/__tests__/policy-seed-lib.test.mjs`: seed-column and escaping tests.
- Create `supabase/migrations/20260726_policy_areas.sql`: safe migration for the existing Supabase database.
- Replace `supabase/schema.sql`: canonical renewable-policy schema.
- Replace `supabase/seed.sql`: generated canonical seed.
- Delete the legacy and interim generators/schema/seed files after replacement.

### Server and loading

- Create `src/server/data/policy-repo.ts`: Supabase reads, in-memory join, cache, and verified fallback.
- Create `src/server/data/policy-repo.test.ts`: unset, success, empty, and failed Supabase cases.
- Create `src/server/api/policies/GET.ts`: catalog endpoint.
- Create `src/server/api/policies/[policyId]/GET.ts`: single-policy endpoint.
- Create `src/lib/policies-loader.ts`: SSR-direct/client-API catalog loader.
- Modify `src/server/entry.ts`: register policy APIs and remove pillar APIs.
- Delete the legacy pillar/energy repositories, APIs, and loader after callers move.

### Policy UI and routes

- Create `src/components/policies/PolicyStatusAxes.tsx`: the three status values.
- Create `src/components/policies/PolicyEvidencePanel.tsx`: explanations, assessments, milestones, and official sources.
- Create `src/components/policies/PolicyCard.tsx`: policy summary plus evidence components.
- Create `src/components/policies/PolicyFilters.tsx`: four accessible filters.
- Create `src/components/policies/PolicyExplorer.tsx`: filter state and result grid.
- Create `src/components/policies/__tests__/PolicyExplorer.test.tsx`: filter and evidence-preservation tests.
- Create `src/pages/policies.tsx`: canonical policy route and metadata.
- Modify `src/routes.tsx`: add `/policies`, redirect `/energy`, and remove legacy routes.
- Delete `src/components/CategoryPage.tsx` and the four legacy page modules after replacement.

### Homepage, navigation, and public identity

- Modify `src/pages/index.tsx`: load and pass the policy catalog, update SEO and JSON-LD.
- Modify `src/components/HeroSection.tsx`: use approved copy and remove decorative fake metrics.
- Create `src/components/PolicyCoverageSection.tsx`: five areas with derived policy counts.
- Create `src/components/PolicyStatusOverviewSection.tsx`: derived three-axis summaries.
- Create `src/components/MethodologySection.tsx`: honest dataset methodology.
- Create `src/components/__tests__/PolicyHomepage.test.tsx`: approved copy, real counts, and legacy-claim regression checks.
- Modify `src/layouts/parts/Header.tsx` and `Footer.tsx`: Overview, Policies, Methodology, and signup only.
- Modify `src/lib/site-meta.ts` and the generated SEO route registry.
- Remove superseded homepage sections and unused `DonutChart.tsx` after import verification.

### Documentation

- Rewrite `docs/DATABASE-SETUP.md`, `README.md`, and `CLAUDE.md` around the policy-native model and manual migration sequence.

---

### Task 1: Canonical Policy Domain and Validation

**Files:**
- Create: `src/data/policy-areas.content.json`
- Create: `src/data/policy-domain.ts`
- Test: `src/data/__tests__/policy-domain.test.ts`

**Interfaces:**
- Consumes: raw workbook-shaped `PolicyDataset` rows.
- Produces: `PolicyArea`, `PolicyRow`, `PolicyRecord`, `PolicyCatalog`, `PolicyFilters`, `policyAreaForSourceValue(value)`, `validatePolicyDataset(dataset)`, `buildPolicyCatalog(dataset)`, `filterPolicies(records, filters)`, and `summarizePolicyStatuses(records)`.

- [ ] **Step 1: Write failing mapping and validation tests**

Create `src/data/__tests__/policy-domain.test.ts` with a minimal valid fixture and these assertions:

```ts
import { describe, expect, it } from 'vitest';
import {
  buildPolicyCatalog,
  filterPolicies,
  policyAreaForSourceValue,
  summarizePolicyStatuses,
  validatePolicyDataset,
  type PolicyDataset,
} from '../policy-domain';

const dataset: PolicyDataset = {
  meta: { title: 'Test', source: 'test.xlsx', generatedFrom: 'test', statusAsOf: '2026-07-26' },
  policies: [{
    policy_id: 'POL-001',
    policy_title: 'Clean-electricity credits',
    policy_area_slug: 'tax-incentives',
    source_policy_area: 'Federal clean-energy tax credits',
    short_summary: 'Summary',
    legal_status: 'in_force',
    implementation_status: 'guidance_issued',
    litigation_status: 'none_identified',
    status_as_of: '2026-07-26',
    status_explanation: 'Explanation',
    effective_requirements: 'Requirements',
    lead_agencies: ['IRS'],
    affected_entities: ['Developers'],
    confidence: 'medium',
    review_status: 'verified',
    sort_order: 0,
  }],
  documents: [{
    document_id: 'DOC-001',
    document_type: 'statute',
    title: 'Law',
    issuing_body: 'Congress',
    official_identifier: 'Public Law 1',
    source_tier: 1,
    document_effect: 'effective',
    link_status: 'working',
    is_legal_anchor: true,
  }],
  links: [{
    link_id: 'LNK-001',
    policy_id: 'POL-001',
    document_id: 'DOC-001',
    relationship_type: 'authority',
    relationship_summary: 'Establishes authority',
    is_controlling_source: true,
  }],
  assessments: [
    { assessment_id: 'ASM-001-L', policy_id: 'POL-001', assessment_date: '2026-07-26', assessment_type: 'legal_status', assessment_value: 'in_force', assessment_summary: 'In force', primary_document_id: 'DOC-001', supporting_document_ids: [], analyst_inference: false, confidence: 'medium', reviewer_status: 'verified' },
    { assessment_id: 'ASM-001-I', policy_id: 'POL-001', assessment_date: '2026-07-26', assessment_type: 'implementation_status', assessment_value: 'guidance_issued', assessment_summary: 'Guidance issued', primary_document_id: 'DOC-001', supporting_document_ids: [], analyst_inference: false, confidence: 'medium', reviewer_status: 'verified' },
    { assessment_id: 'ASM-001-T', policy_id: 'POL-001', assessment_date: '2026-07-26', assessment_type: 'litigation_status', assessment_value: 'none_identified', assessment_summary: 'None identified', primary_document_id: 'DOC-001', supporting_document_ids: [], analyst_inference: true, confidence: 'medium', reviewer_status: 'verified' },
  ],
};

describe('policy domain', () => {
  it('maps workbook labels to canonical areas', () => {
    expect(policyAreaForSourceValue('Federal clean-energy tax credits')).toBe('tax-incentives');
    expect(() => policyAreaForSourceValue('unmapped value')).toThrow(/Unknown policy area/);
  });

  it('validates and assembles a policy-native catalog', () => {
    expect(() => validatePolicyDataset(dataset)).not.toThrow();
    const catalog = buildPolicyCatalog(dataset);
    expect(catalog.policies[0].area.slug).toBe('tax-incentives');
    expect(catalog.policies[0].documents[0].officialIdentifier).toBe('Public Law 1');
  });

  it('rejects a missing status axis', () => {
    const invalid = { ...dataset, assessments: dataset.assessments.slice(0, 2) };
    expect(() => validatePolicyDataset(invalid)).toThrow(/litigation_status/);
  });

  it('filters and summarizes raw status values', () => {
    const records = buildPolicyCatalog(dataset).policies;
    expect(filterPolicies(records, { areaSlug: 'tax-incentives', legalStatus: 'all', implementationStatus: 'all', litigationStatus: 'all' })).toHaveLength(1);
    expect(summarizePolicyStatuses(records).legal.in_force).toBe(1);
  });
});
```

- [ ] **Step 2: Run the test and confirm the domain module is missing**

Run: `npm test -- src/data/__tests__/policy-domain.test.ts`

Expected: FAIL because `../policy-domain` does not exist.

- [ ] **Step 3: Add the canonical Policy Area registry**

Create `src/data/policy-areas.content.json` with five entries. Each entry must contain `slug`, `label`, `description`, `sort_order`, and `source_values`. Use this exact mapping:

```json
{
  "areas": [
    { "slug": "tax-incentives", "label": "Tax & Incentives", "description": "Federal clean-energy credits and location or sourcing bonuses.", "sort_order": 0, "source_values": ["Federal clean-energy tax credits", "Federal clean-energy tax-credit bonus"] },
    { "slug": "grid-transmission", "label": "Grid & Transmission", "description": "Generator interconnection and long-term transmission planning reforms.", "sort_order": 1, "source_values": ["generator_interconnection", "regional_transmission_planning"] },
    { "slug": "permitting-siting", "label": "Permitting & Siting", "description": "Federal environmental review, permitting, and siting policy.", "sort_order": 2, "source_values": ["permitting"] },
    { "slug": "trade-supply-chain", "label": "Trade & Supply Chain", "description": "Trade remedies and supply conditions affecting renewable-energy deployment.", "sort_order": 3, "source_values": ["Solar trade remedies and project supply"] },
    { "slug": "offshore-wind", "label": "Offshore Wind", "description": "Federal leasing and permitting policy specific to offshore wind.", "sort_order": 4, "source_values": ["offshore_wind"] }
  ]
}
```

- [ ] **Step 4: Implement the policy-native types and pure functions**

Create `src/data/policy-domain.ts`. Define workbook-shaped row interfaces for every existing field in policies, documents, links, and assessments. Define the enriched record contract as:

```ts
import definitionsJson from './policy-areas.content.json';

export const POLICY_AREA_SLUGS = [
  'tax-incentives',
  'grid-transmission',
  'permitting-siting',
  'trade-supply-chain',
  'offshore-wind',
] as const;

export type PolicyAreaSlug = (typeof POLICY_AREA_SLUGS)[number];

export interface PolicyArea {
  slug: PolicyAreaSlug;
  label: string;
  description: string;
  sort_order: number;
}

export interface PolicyRecord {
  id: string;
  title: string;
  area: PolicyArea;
  sourcePolicyArea: string;
  shortSummary: string;
  legalStatus: string;
  implementationStatus: string;
  litigationStatus: string;
  statusAsOf: string;
  statusExplanation: string;
  effectiveRequirements: string;
  inactiveOrLimitedScope?: string;
  leadAgencies: string[];
  affectedEntities: string[];
  nextMilestone?: string;
  confidence: string;
  reviewStatus: string;
  assessments: EvidenceAssessment[];
  documents: EvidenceDocument[];
}

export interface PolicyCatalog {
  meta: PolicyDataset['meta'];
  areas: PolicyArea[];
  policies: PolicyRecord[];
}

export interface PolicyFilters {
  areaSlug: PolicyAreaSlug | 'all';
  legalStatus: string | 'all';
  implementationStatus: string | 'all';
  litigationStatus: string | 'all';
}
```

Build the lookup maps once and reject duplicate IDs with the field name in the error:

```ts
interface PolicyAreaDefinition extends PolicyArea {
  source_values: string[];
}

const definitions = definitionsJson.areas as PolicyAreaDefinition[];
export const policyAreas: PolicyArea[] = definitions
  .map(({ source_values: _sourceValues, ...area }) => area)
  .sort((a, b) => a.sort_order - b.sort_order);

const policyAreaBySlug = new Map(policyAreas.map((area) => [area.slug, area]));
const sourceValueToSlug = new Map<string, PolicyAreaSlug>();
for (const definition of definitions) {
  for (const sourceValue of definition.source_values) {
    if (sourceValueToSlug.has(sourceValue)) {
      throw new Error(`Duplicate source policy area mapping: ${sourceValue}`);
    }
    sourceValueToSlug.set(sourceValue, definition.slug);
  }
}

function uniqueIds<T extends Record<K, string>, K extends keyof T>(rows: T[], key: K): Set<string> {
  const ids = new Set<string>();
  for (const row of rows) {
    const id = row[key];
    if (ids.has(id)) throw new Error(`Duplicate ${String(key)}: ${id}`);
    ids.add(id);
  }
  return ids;
}
```

Implement the mapping and validation with explicit errors:

```ts
export function policyAreaForSourceValue(value: string): PolicyAreaSlug {
  const slug = sourceValueToSlug.get(value);
  if (!slug) throw new Error(`Unknown policy area: ${value}`);
  return slug;
}

export function validatePolicyDataset(dataset: PolicyDataset): void {
  const policyIds = uniqueIds(dataset.policies, 'policy_id');
  const documentIds = uniqueIds(dataset.documents, 'document_id');
  uniqueIds(dataset.links, 'link_id');
  uniqueIds(dataset.assessments, 'assessment_id');

  for (const policy of dataset.policies) {
    if (!policyAreaBySlug.has(policy.policy_area_slug)) {
      throw new Error(`Unknown policy area slug for ${policy.policy_id}: ${policy.policy_area_slug}`);
    }
    const types = new Set(dataset.assessments.filter((row) => row.policy_id === policy.policy_id).map((row) => row.assessment_type));
    for (const required of ['legal_status', 'implementation_status', 'litigation_status']) {
      if (!types.has(required)) throw new Error(`${policy.policy_id} is missing ${required}`);
    }
  }

  for (const link of dataset.links) {
    if (!policyIds.has(link.policy_id)) throw new Error(`${link.link_id} references unknown policy ${link.policy_id}`);
    if (!documentIds.has(link.document_id)) throw new Error(`${link.link_id} references unknown document ${link.document_id}`);
  }

  for (const assessment of dataset.assessments) {
    if (!policyIds.has(assessment.policy_id)) throw new Error(`${assessment.assessment_id} references unknown policy ${assessment.policy_id}`);
    const referenced = [assessment.primary_document_id, ...(assessment.supporting_document_ids ?? [])].filter(Boolean) as string[];
    for (const id of referenced) {
      if (!documentIds.has(id)) throw new Error(`${assessment.assessment_id} references unknown document ${id}`);
    }
  }
}
```

Port `statusLabel`, evidence-document ordering, statement splitting, and `analystInference` preservation from `src/data/energy.ts`. Do not port `Project`, `deriveProjectStatus`, `deriveProgress`, budget, category, or pillar adapters. `buildPolicyCatalog` must call `validatePolicyDataset` before joining rows.

- [ ] **Step 5: Run domain tests and type-check**

Run: `npm test -- src/data/__tests__/policy-domain.test.ts`

Expected: PASS with 4 tests.

Run: `npm run type-check`

Expected: PASS; the new parallel domain must not disturb legacy callers yet.

- [ ] **Step 6: Commit the policy domain**

```powershell
git add src/data/policy-areas.content.json src/data/policy-domain.ts src/data/__tests__/policy-domain.test.ts
git commit -m "feat(data): define renewable policy areas"
```

---

### Task 2: Workbook Conversion, Canonical Seed, and Safe Migration

**Files:**
- Create: `supabase/xlsx-to-policies-json.py`
- Create: `supabase/policy-seed-lib.mjs`
- Create: `supabase/generate-policy-seed.mjs`
- Create: `supabase/__tests__/policy-seed-lib.test.mjs`
- Create: `supabase/migrations/20260726_policy_areas.sql`
- Create: `src/data/policies.content.json` by running the converter
- Create: `src/data/__tests__/policies-content.test.ts`
- Modify: `supabase/schema.sql`
- Modify: `supabase/seed.sql` by running the generator
- Modify: `package.json`

**Interfaces:**
- Consumes: `../us_renewable_policy_data.xlsx`, `policy-areas.content.json`, and Task 1's `validatePolicyDataset` contract.
- Produces: generated `PolicyDataset`, `renderPolicySeed(dataset, areas): string`, a fresh-install schema/seed, and a transaction-safe existing-database migration.

- [ ] **Step 1: Write failing real-dataset and SQL-renderer tests**

Create `src/data/__tests__/policies-content.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import content from '../policies.content.json';
import { buildPolicyCatalog, validatePolicyDataset, type PolicyDataset } from '../policy-domain';

describe('generated policy content', () => {
  it('contains the complete verified workbook dataset', () => {
    const dataset = content as PolicyDataset;
    expect(() => validatePolicyDataset(dataset)).not.toThrow();
    const catalog = buildPolicyCatalog(dataset);
    expect(catalog.areas).toHaveLength(5);
    expect(catalog.policies).toHaveLength(8);
    expect(dataset.documents).toHaveLength(38);
    expect(dataset.links).toHaveLength(41);
    expect(dataset.assessments).toHaveLength(24);
  });
});
```

Create `supabase/__tests__/policy-seed-lib.test.mjs`:

```js
import { describe, expect, it } from 'vitest';
import { renderPolicySeed } from '../policy-seed-lib.mjs';

describe('renderPolicySeed', () => {
  it('writes canonical and source policy areas and escapes apostrophes', () => {
    const sql = renderPolicySeed({
      meta: { statusAsOf: '2026-07-26' },
      policies: [{ policy_id: 'POL-001', policy_area_slug: 'tax-incentives', source_policy_area: "Agency's label", policy_title: 'Title', short_summary: 'Summary', legal_status: 'in_force', implementation_status: 'implementing', litigation_status: 'none_identified', status_as_of: '2026-07-26', status_explanation: 'Explanation', effective_requirements: 'Requirements', lead_agencies: [], affected_entities: [], confidence: 'high', review_status: 'verified', sort_order: 0 }],
      documents: [], links: [], assessments: [],
    }, [{ slug: 'tax-incentives', label: 'Tax & Incentives', description: 'Description', sort_order: 0 }]);
    expect(sql).toContain('policy_area_slug, source_policy_area');
    expect(sql).toContain("'tax-incentives'");
    expect(sql).toContain("'Agency''s label'");
  });
});
```

- [ ] **Step 2: Run both tests and confirm the missing files fail**

Run: `npm test -- src/data/__tests__/policies-content.test.ts supabase/__tests__/policy-seed-lib.test.mjs`

Expected: FAIL because the new generated JSON and SQL renderer do not exist.

- [ ] **Step 3: Implement workbook classification and referential validation**

Copy the existing workbook normalization behavior into `supabase/xlsx-to-policies-json.py`, then load `src/data/policy-areas.content.json` and enrich each policy:

```py
def area_lookup(area_config):
    lookup = {}
    for area in area_config["areas"]:
        for source_value in area["source_values"]:
            if source_value in lookup:
                raise ValueError(f"Duplicate source policy area mapping: {source_value}")
            lookup[source_value] = area["slug"]
    return lookup


def classify_policies(policies, lookup):
    for index, policy in enumerate(policies):
        policy_id = policy.get("policy_id", f"row {index + 2}")
        source_value = policy.pop("policy_area", None)
        if source_value not in lookup:
            raise ValueError(f"Unknown policy area for {policy_id}: {source_value}")
        policy["source_policy_area"] = source_value
        policy["policy_area_slug"] = lookup[source_value]
        policy["sort_order"] = index
```

Add Python validation that raises `ValueError` for each of these exact conditions before writing output: duplicate `policy_id`, `document_id`, `link_id`, or `assessment_id`; a link whose policy or document does not exist; an assessment whose policy, primary document, or supporting document does not exist; and a policy missing any of `legal_status`, `implementation_status`, or `litigation_status` assessments. Write to `policies.content.json.tmp`, then call `Path.replace(out_path)` only after all checks pass so a bad workbook cannot overwrite the last verified JSON.

- [ ] **Step 4: Generate and verify the policy JSON**

Run from `website/`:

```powershell
python supabase/xlsx-to-policies-json.py ../us_renewable_policy_data.xlsx
```

Expected: `src/data/policies.content.json` contains 8 policies, 38 documents, 41 links, and 24 assessments; every policy contains both `policy_area_slug` and `source_policy_area`.

- [ ] **Step 5: Implement the pure seed renderer and generator**

Move the quoting, array, boolean, and insert helpers from `generate-energy-seed.mjs` into `policy-seed-lib.mjs`. `renderPolicySeed` must emit rows in dependency order:

1. truncate evidence tables, policies, and policy areas;
2. insert `policy_areas`;
3. insert `policies` with `policy_area_slug` and `source_policy_area`;
4. insert documents;
5. insert links;
6. insert assessments.

`generate-policy-seed.mjs` reads `policies.content.json` and `policy-areas.content.json`, calls `renderPolicySeed`, and writes `supabase/seed.sql`.

- [ ] **Step 6: Replace the canonical fresh-install schema**

Rewrite `supabase/schema.sql` so table creation order is `policy_areas`, `policies`, `policy_documents`, `policy_document_links`, and `policy_status_assessments`. Use this classification contract:

```sql
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
```

Retain the existing evidence columns, checks, foreign keys, indexes, RLS enablement, and public-read-only policies. Add `policies_area_idx (policy_area_slug, sort_order)`.

- [ ] **Step 7: Create the transactional existing-database migration**

Create `supabase/migrations/20260726_policy_areas.sql`. The policy mapping must be explicit and auditable:

```sql
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
```

After those assertions, set both new columns `not null`, add the foreign key and index, drop `pillar_slug` and `policy_area`, drop `projects` before `pillars`, configure RLS for `policy_areas`, and `commit`. Do not use `cascade` for the legacy table drops; dependency failures must abort rather than remove unexpected objects.

- [ ] **Step 8: Add reproducible data scripts and run them**

Add these scripts to `package.json`:

```json
"data:import": "python supabase/xlsx-to-policies-json.py ../us_renewable_policy_data.xlsx",
"data:seed": "node supabase/generate-policy-seed.mjs"
```

Run:

```powershell
npm run data:import
npm run data:seed
npm test -- src/data/__tests__/policies-content.test.ts supabase/__tests__/policy-seed-lib.test.mjs
git diff --check
```

Expected: both tests pass, the generated counts are 8/38/41/24, and `git diff --check` is silent.

- [ ] **Step 9: Commit the pipeline and SQL**

```powershell
git add package.json src/data/policies.content.json src/data/__tests__/policies-content.test.ts supabase/schema.sql supabase/seed.sql supabase/xlsx-to-policies-json.py supabase/policy-seed-lib.mjs supabase/generate-policy-seed.mjs supabase/__tests__/policy-seed-lib.test.mjs supabase/migrations/20260726_policy_areas.sql
git commit -m "feat(data): normalize renewable policy areas"
```

---

### Task 3: Policy Repository, API, and Isomorphic Loader

**Files:**
- Create: `src/data/policies.ts`
- Create: `src/server/data/policy-repo.ts`
- Test: `src/server/data/policy-repo.test.ts`
- Create: `src/server/api/policies/GET.ts`
- Create: `src/server/api/policies/[policyId]/GET.ts`
- Create: `src/lib/policies-loader.ts`
- Modify: `src/server/entry.ts`

**Interfaces:**
- Consumes: `buildPolicyCatalog(dataset)` and generated `policies.content.json`.
- Produces: `fallbackPolicyCatalog`, `getPolicyCatalog(): Promise<PolicyCatalog>`, `getPolicyById(policyId): Promise<PolicyRecord | null>`, `loadPolicyCatalog(): Promise<PolicyCatalog>`, `GET /api/policies`, and `GET /api/policies/:policyId`.

- [ ] **Step 1: Add failing repository tests**

Create `src/server/data/policy-repo.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('policy repository', () => {
  it('returns the verified fallback when Supabase is unset', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_ANON_KEY', '');
    const { getPolicyCatalog } = await import('./policy-repo');
    const catalog = await getPolicyCatalog();
    expect(catalog.areas).toHaveLength(5);
    expect(catalog.policies).toHaveLength(8);
  });

  it('returns the verified fallback when Supabase fails', async () => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co');
    vi.stubEnv('SUPABASE_ANON_KEY', 'anon');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { getPolicyCatalog } = await import('./policy-repo');
    expect((await getPolicyCatalog()).policies).toHaveLength(8);
  });

  it('finds a policy by ID', async () => {
    vi.stubEnv('SUPABASE_URL', '');
    vi.stubEnv('SUPABASE_ANON_KEY', '');
    const { getPolicyById } = await import('./policy-repo');
    expect((await getPolicyById('POL-001'))?.id).toBe('POL-001');
    expect(await getPolicyById('missing')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the repository test and confirm failure**

Run: `npm test -- src/server/data/policy-repo.test.ts`

Expected: FAIL because `policy-repo.ts` does not exist.

- [ ] **Step 3: Export the bundled fallback catalog**

Create `src/data/policies.ts`:

```ts
import content from './policies.content.json';
import { buildPolicyCatalog, type PolicyDataset } from './policy-domain';

export * from './policy-domain';
export const policyDataset = content as PolicyDataset;
export const fallbackPolicyCatalog = buildPolicyCatalog(policyDataset);
```

- [ ] **Step 4: Implement the Supabase policy repository**

Create `src/server/data/policy-repo.ts` by adapting the safe config/cache/select behavior from `energy-repo.ts`. Fetch these paths in parallel:

```ts
const [areas, policies, documents, links, assessments] = await Promise.all([
  selectAll<PolicyArea>(config, 'policy_areas?select=*&order=sort_order'),
  selectAll<PolicyRow>(config, 'policies?select=*&order=sort_order'),
  selectAll<PolicyDocumentRow>(config, 'policy_documents?select=*&order=document_id'),
  selectAll<PolicyDocumentLinkRow>(config, 'policy_document_links?select=*&order=link_id'),
  selectAll<PolicyAssessmentRow>(config, 'policy_status_assessments?select=*&order=assessment_id'),
]);
```

Construct a `PolicyDataset` from the four policy/evidence arrays, validate it through `buildPolicyCatalog`, and use the database `areas` to verify labels/order match known slugs. If any required table is empty, any request fails, or validation fails, log `[policy-repo] Supabase load failed, using bundled dataset:` and return `fallbackPolicyCatalog`. Cache successful catalogs for 60 seconds.

- [ ] **Step 5: Add policy API handlers**

`src/server/api/policies/GET.ts` returns the catalog as JSON with `Cache-Control: public, max-age=30, stale-while-revalidate=60`.

`src/server/api/policies/[policyId]/GET.ts` reads `req.params.policyId`, returns the record, and returns this 404 payload when absent:

```ts
res.status(404).json({ error: 'Policy not found' });
```

Register both handlers inside the existing marker blocks in `src/server/entry.ts`:

```ts
app.get('/api/policies', policies_get);
app.get('/api/policies/:policyId', policies_policyId_get);
```

Keep the old pillar API registered until Task 6 so existing routes continue to build during the transition.

- [ ] **Step 6: Add the isomorphic loader**

Create `src/lib/policies-loader.ts` with this SSR/client split:

```ts
import type { PolicyCatalog } from '@/data/policy-domain';

export async function loadPolicyCatalog(): Promise<PolicyCatalog> {
  if (import.meta.env.SSR) {
    const { getPolicyCatalog } = await import('@/server/data/policy-repo');
    return getPolicyCatalog();
  }
  const response = await fetch('/api/policies');
  if (!response.ok) throw new Response('Failed to load policies', { status: 502 });
  return response.json() as Promise<PolicyCatalog>;
}
```

- [ ] **Step 7: Run focused tests, type-check, and build**

Run:

```powershell
npm test -- src/server/data/policy-repo.test.ts src/data/__tests__/policy-domain.test.ts src/data/__tests__/policies-content.test.ts
npm run type-check
npm run build
```

Expected: all commands pass and both old and new API registrations compile.

- [ ] **Step 8: Commit the server slice**

```powershell
git add src/data/policies.ts src/server/data/policy-repo.ts src/server/data/policy-repo.test.ts src/server/api/policies src/lib/policies-loader.ts src/server/entry.ts
git commit -m "feat(api): serve policy-native catalog"
```

---

### Task 4: Policy Explorer and Canonical Route

**Files:**
- Create: `src/components/policies/PolicyStatusAxes.tsx`
- Create: `src/components/policies/PolicyEvidencePanel.tsx`
- Create: `src/components/policies/PolicyCard.tsx`
- Create: `src/components/policies/PolicyFilters.tsx`
- Create: `src/components/policies/PolicyExplorer.tsx`
- Test: `src/components/policies/__tests__/PolicyExplorer.test.tsx`
- Create: `src/pages/policies.tsx`
- Modify: `src/routes.tsx`

**Interfaces:**
- Consumes: `PolicyCatalog`, `PolicyRecord`, `PolicyFilters`, `filterPolicies`, and `statusLabel`.
- Produces: canonical `/policies` UI with four filters and no synthesized progress metric; `/energy` returns a 301 redirect response.

- [ ] **Step 1: Write the failing explorer test**

Create `src/components/policies/__tests__/PolicyExplorer.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fallbackPolicyCatalog } from '@/data/policies';
import PolicyExplorer from '../PolicyExplorer';

describe('PolicyExplorer', () => {
  it('filters by Policy Area and retains the three status axes', async () => {
    const user = userEvent.setup();
    render(<PolicyExplorer catalog={fallbackPolicyCatalog} />);
    expect(screen.getAllByRole('article')).toHaveLength(8);
    await user.selectOptions(screen.getByLabelText('Policy Area'), 'grid-transmission');
    expect(screen.getAllByRole('article')).toHaveLength(2);
    expect(screen.getByText(/FERC Order No. 2023/)).toBeInTheDocument();
    expect(screen.getAllByText('Legal').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Implementation').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Litigation').length).toBeGreaterThan(0);
  });

  it('shows official evidence without a completion percentage', () => {
    render(<PolicyExplorer catalog={fallbackPolicyCatalog} />);
    expect(screen.getByText(/official source/i)).toBeInTheDocument();
    expect(screen.queryByText(/status index/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/% complete/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the explorer test and confirm failure**

Run: `npm test -- src/components/policies/__tests__/PolicyExplorer.test.tsx`

Expected: FAIL because `PolicyExplorer` does not exist.

- [ ] **Step 3: Split the policy card into focused components**

Port the evidence UI from `CategoryPage.tsx` into the new components with these contracts:

```ts
export interface PolicyStatusAxesProps { policy: PolicyRecord }
export interface PolicyEvidencePanelProps { policy: PolicyRecord }
export interface PolicyCardProps { policy: PolicyRecord }
```

`PolicyCard` must render `role="article"`, area label, title, agencies, summary, `PolicyStatusAxes`, as-of date, confidence, and `PolicyEvidencePanel`. Remove the legacy single status badge, progress/status-index bar, budget, project category, and generic USASpending fallback URL. Render an official-source item as an anchor only when its URL exists.

- [ ] **Step 4: Implement accessible filters and derived options**

`PolicyFilters` receives `catalog`, `filters`, and `onChange`. Render four labeled `<select>` elements. Derive status options from the loaded policies with unique sorted raw values; use `statusLabel` for display and raw values for `<option value>`.

`PolicyExplorer` owns this initial state and delegates filtering to `filterPolicies`:

```ts
const [filters, setFilters] = useState<PolicyFilters>({
  areaSlug: 'all',
  legalStatus: 'all',
  implementationStatus: 'all',
  litigationStatus: 'all',
});
```

Show the derived result count and render a clear “No policies match these filters.” state when the result is empty.

- [ ] **Step 5: Add the canonical policies page and routes**

Create `src/pages/policies.tsx` using `useLoaderData() as PolicyCatalog`, `PolicyExplorer`, and Helmet. Use:

- title: `U.S. Renewable Energy Policy Tracker — NeuPo`
- canonical: `https://neupo.app/policies`
- description: the approved product sentence

Add routes:

```tsx
{
  path: '/policies',
  element: <PoliciesPage />,
  loader: loadPolicyCatalog,
},
{
  path: '/energy',
  loader: () => redirect('/policies', 301),
},
```

Keep Social, Political, Economic, and Military routes until Task 6; this task establishes the canonical replacement first.

- [ ] **Step 6: Run explorer tests, type-check, and build**

Run:

```powershell
npm test -- src/components/policies/__tests__/PolicyExplorer.test.tsx
npm run type-check
npm run build
```

Expected: PASS; `/policies` is SSR-buildable and the explorer has no percent-complete output.

- [ ] **Step 7: Commit the policy explorer**

```powershell
git add src/components/policies src/pages/policies.tsx src/routes.tsx src/lib/seo-routes.ts
git commit -m "feat(ui): add renewable policy explorer"
```

Include `src/lib/seo-routes.ts` only if the route synchronization hook changed it as a result of editing `routes.tsx`; verify that `/policies` appears and `/energy` is excluded as a redirect.

---

### Task 5: Data-Driven Renewable Policy Homepage

**Files:**
- Modify: `src/pages/index.tsx`
- Modify: `src/components/HeroSection.tsx`
- Create: `src/components/PolicyCoverageSection.tsx`
- Create: `src/components/PolicyStatusOverviewSection.tsx`
- Create: `src/components/MethodologySection.tsx`
- Test: `src/components/__tests__/PolicyHomepage.test.tsx`
- Modify: `src/routes.tsx`

**Interfaces:**
- Consumes: `PolicyCatalog` from the root route loader and `summarizePolicyStatuses`.
- Produces: source-accurate homepage copy, five derived area counts, three-axis status summaries, and methodology content.

- [ ] **Step 1: Write failing homepage tests**

Create `src/components/__tests__/PolicyHomepage.test.tsx` with a memory router whose root loader returns `fallbackPolicyCatalog`:

```tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { fallbackPolicyCatalog } from '@/data/policies';
import HomePage from '@/pages/index';

function renderHome() {
  const router = createMemoryRouter([
    { path: '/', element: <HomePage />, loader: () => fallbackPolicyCatalog },
  ]);
  return render(<RouterProvider router={router} />);
}

describe('renewable policy homepage', () => {
  it('uses the approved product description and real coverage', async () => {
    renderHome();
    expect(await screen.findByText('NeuPo tracks the legal, implementation, and litigation status of U.S. federal renewable-energy policy — every finding traced to official government sources.')).toBeInTheDocument();
    expect(screen.getByText('Tax & Incentives')).toBeInTheDocument();
    expect(screen.getByText('5 Policy Areas')).toBeInTheDocument();
    expect(screen.getByText('8 Policies')).toBeInTheDocument();
  });

  it('does not present the legacy product or fabricated metrics', async () => {
    renderHome();
    await screen.findByText('Policy Coverage');
    expect(screen.queryByText(/Four Pillars/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Live Project Progress/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Social, Political, Economic/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/USASpending|BEA|DoD/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the homepage test and confirm failure**

Run: `npm test -- src/components/__tests__/PolicyHomepage.test.tsx`

Expected: FAIL because the homepage still renders the legacy copy and sections.

- [ ] **Step 3: Make the root route data-driven**

Set the `/` route loader to `loadPolicyCatalog`. In `src/pages/index.tsx`, read `PolicyCatalog` through `useLoaderData` and pass it to the coverage and status components. Update public identity:

- title: `NeuPo — U.S. Renewable Energy Policy Tracker`
- description: approved product sentence
- `dateModified`: `2026-07-26`
- Organization and WebPage JSON-LD descriptions: approved product sentence

- [ ] **Step 4: Replace fake homepage sections**

`PolicyCoverageSection` must calculate counts with:

```ts
const rows = catalog.areas.map((area) => ({
  ...area,
  count: catalog.policies.filter((policy) => policy.area.slug === area.slug).length,
}));
```

Show `5 Policy Areas` and `8 Policies` from array lengths, not constants. Each area card links to `/policies` with a query string such as `/policies?area=tax-incentives`; initialize `PolicyExplorer` from that valid query parameter.

`PolicyStatusOverviewSection` calls `summarizePolicyStatuses` and renders three separate groups headed Legal, Implementation, and Litigation. Show status labels and counts only; do not collapse them into a score or percentage.

`MethodologySection` explains:

- statuses are dated findings;
- legal, implementation, and litigation are independent;
- official statutes, rules, agency documents, and court records support findings;
- analyst inference is explicitly labeled;
- this is research information, not legal advice.

Give the section `id="methodology"`.

- [ ] **Step 5: Rewrite the Hero without decorative progress charts**

Replace the heading with `U.S. Renewable Energy Policy, Traced to the Source.` and use the approved sentence verbatim as its paragraph. Keep the waitlist form and error handling. Remove `decorativeCharts`, all `DonutChart` usage, “Live US Government Data,” “National Strategy. Transparent Progress,” and the nonexistent `/terms` and `/privacy` links.

- [ ] **Step 6: Run homepage tests, type-check, and build**

Run:

```powershell
npm test -- src/components/__tests__/PolicyHomepage.test.tsx src/components/policies/__tests__/PolicyExplorer.test.tsx
npm run type-check
npm run build
```

Expected: PASS; homepage output contains only derived counts and real status categories.

- [ ] **Step 7: Commit the homepage redesign**

```powershell
git add src/pages/index.tsx src/components/HeroSection.tsx src/components/PolicyCoverageSection.tsx src/components/PolicyStatusOverviewSection.tsx src/components/MethodologySection.tsx src/components/__tests__/PolicyHomepage.test.tsx src/routes.tsx
git commit -m "feat(home): present renewable policy coverage"
```

---

### Task 6: Remove Legacy Pillars and Complete Public Identity Migration

**Files:**
- Modify: `src/routes.tsx`
- Modify: `src/layouts/parts/Header.tsx`
- Modify: `src/layouts/parts/Footer.tsx`
- Modify: `src/lib/site-meta.ts`
- Modify: `src/server/entry.ts`
- Modify: `src/server/entry.test.ts`
- Modify: `src/server/llms-tst.test.ts`
- Create: `src/routes.test.tsx`
- Delete: legacy pages, components, data, repositories, APIs, loader, generators, and interim SQL files listed below.

**Interfaces:**
- Consumes: policy-native routes/API/homepage from Tasks 3–5.
- Produces: public navigation and SEO with no legacy sectors; `/energy` redirects and old sector routes 404; old APIs and runtime code no longer exist.

- [ ] **Step 1: Write failing route and public-identity tests**

Create `src/routes.test.tsx`:

```tsx
import { describe, expect, it } from 'vitest';
import { routes } from './routes';

describe('public routes', () => {
  it('publishes policies and removes placeholder sectors', () => {
    const paths = routes.map((route) => route.path);
    expect(paths).toContain('/policies');
    expect(paths).toContain('/energy');
    expect(paths).not.toContain('/social');
    expect(paths).not.toContain('/political');
    expect(paths).not.toContain('/economic');
    expect(paths).not.toContain('/military');
  });

  it('permanently redirects the old energy URL', async () => {
    const route = routes.find((item) => item.path === '/energy');
    const response = await route?.loader?.({ request: new Request('https://neupo.app/energy'), params: {}, context: undefined } as never);
    expect(response).toBeInstanceOf(Response);
    expect((response as Response).status).toBe(301);
    expect((response as Response).headers.get('Location')).toBe('/policies');
  });
});
```

Update server identity tests so `/llms.txt` expects the approved renewable-policy summary and sitemap tests expect `/` plus `/policies`, with no legacy sector URLs.

- [ ] **Step 2: Run focused tests and confirm legacy failures**

Run:

```powershell
npm test -- src/routes.test.tsx src/server/entry.test.ts src/server/llms-tst.test.ts
```

Expected: FAIL while legacy routes, APIs, and metadata remain.

- [ ] **Step 3: Replace header, footer, and machine-readable identity**

Desktop and mobile header entries become:

- Overview → `/`
- Policies → `/policies`
- Methodology → `/#methodology`

Keep the signup CTA. Remove all pillar dropdown state and icons.

Footer quick links use the same three destinations plus Sign Up. Replace its brand paragraph with the approved product sentence and change the newsletter description to `Get updates when NeuPo publishes a new policy assessment or source review.`

Set `siteMeta.summary` to the approved product sentence.

- [ ] **Step 4: Remove legacy routes and API registrations**

Remove imports and routes for Social, Political, Economic, and Military. Keep `/energy` only as the 301 loader redirect. Set the `Path` type to:

```ts
export type Path = '/' | '/policies' | '/register';
```

Remove the two `/api/pillars` imports and registrations from `src/server/entry.ts`. Keep the policy endpoints added in Task 3. Verify the SEO registry contains `/`, `/policies`, and `/register` as appropriate, and contains none of the removed or redirect-only routes.

- [ ] **Step 5: Delete superseded application and data files**

Delete exactly these files/directories after `rg` confirms no remaining imports:

```text
src/pages/social.tsx
src/pages/political.tsx
src/pages/economic.tsx
src/pages/energy.tsx
src/components/CategoryPage.tsx
src/components/PillarsSection.tsx
src/components/ProjectProgressSection.tsx
src/components/MissionSection.tsx
src/components/PolicySection.tsx
src/data/pillars.ts
src/data/pillars.content.json
src/data/energy.ts
src/data/energy.content.json
src/lib/pillars-loader.ts
src/server/data/pillars-repo.ts
src/server/data/energy-repo.ts
src/server/api/pillars/GET.ts
src/server/api/pillars/[slug]/GET.ts
supabase/generate-seed.mjs
supabase/generate-energy-seed.mjs
supabase/xlsx-to-energy-json.py
supabase/schema.energy.sql
supabase/seed.energy.sql
```

Delete `src/components/DonutChart.tsx` only if `rg -n "DonutChart" src` finds no import after the homepage and policy-page changes.

- [ ] **Step 6: Run legacy-reference checks and automated tests**

Run:

```powershell
rg -n "(/social|/political|/economic|/military|api/pillars|Four Pillars|Live Project Progress|Social, Political, Economic|USASpending|BEA|DoD)" src --glob '!data/policies.content.json'
npm test -- src/routes.test.tsx src/server/entry.test.ts src/server/llms-tst.test.ts src/components/__tests__/PolicyHomepage.test.tsx
npm run type-check
npm run build
```

Expected: `rg` returns no matches in public application code; all tests, type-check, and build pass.

- [ ] **Step 7: Commit the legacy removal**

```powershell
git add -A src supabase/generate-seed.mjs supabase/generate-energy-seed.mjs supabase/xlsx-to-energy-json.py supabase/schema.energy.sql supabase/seed.energy.sql
git commit -m "refactor: remove legacy national strategy pillars"
```

---

### Task 7: Documentation, Migration Handoff, and End-to-End Verification

**Files:**
- Modify: `docs/DATABASE-SETUP.md`
- Modify: `README.md`
- Modify: `CLAUDE.md`
- Verify: all changed source, generated data, schema, seed, and migration files.

**Interfaces:**
- Consumes: completed policy-native application and SQL artifacts.
- Produces: exact manual Supabase instructions and evidence that data generation, tests, build, SSR, API, redirect, sitemap, and responsive rendering work.

- [ ] **Step 1: Rewrite operator documentation**

Document two database paths:

**Existing database:**

1. Export or back up current Supabase tables.
2. Open `supabase/migrations/20260726_policy_areas.sql` in Supabase SQL Editor.
3. Run the entire transaction once.
4. Verify 5 Policy Areas, 8 policies, 38 documents, 41 links, and 24 assessments.
5. Confirm `pillars` and `projects` no longer exist.
6. Deploy the matching application commit.

**Fresh database:**

1. Run `supabase/schema.sql`.
2. Run `supabase/seed.sql`.
3. Run `supabase/signups.sql`.
4. Configure `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

Document the refresh commands exactly:

```powershell
npm run data:import
npm run data:seed
```

Update README and CLAUDE architecture, routes, API paths, file tree, data provenance, fallback behavior, and warnings. Remove every statement that calls the content a four-pillar national-strategy platform.

- [ ] **Step 2: Verify generated artifacts are reproducible**

Run:

```powershell
npm run data:import
npm run data:seed
git diff --exit-code -- src/data/policies.content.json supabase/seed.sql
```

Expected: the converter reports 8 policies, 38 documents, 41 links, and 24 assessments; the final diff command exits 0.

- [ ] **Step 3: Run the complete automated verification suite**

Run:

```powershell
npm run type-check
npm test -- --run
npm run lint
npm run build
git diff --check
```

Expected: every command exits 0. If the pre-existing lint baseline has unrelated failures, record the exact failures, prove no changed file introduces a new lint error, and do not claim the full lint command passed.

- [ ] **Step 4: Smoke-test the built SSR server and APIs**

Start the built server hidden on an isolated port, probe it, and always stop it:

```powershell
$env:PORT = '4175'
$server = Start-Process -FilePath 'node' -ArgumentList 'dist/server/entry.js' -WorkingDirectory (Get-Location) -WindowStyle Hidden -PassThru
try {
  $home = Invoke-WebRequest 'http://127.0.0.1:4175/' -UseBasicParsing
  $policies = Invoke-WebRequest 'http://127.0.0.1:4175/policies' -UseBasicParsing
  $catalog = Invoke-RestMethod 'http://127.0.0.1:4175/api/policies'
  $policy = Invoke-RestMethod 'http://127.0.0.1:4175/api/policies/POL-001'
  $sitemap = Invoke-WebRequest 'http://127.0.0.1:4175/sitemap.xml' -Headers @{ Host = 'neupo.app' } -UseBasicParsing
  if ($home.StatusCode -ne 200 -or $policies.StatusCode -ne 200) { throw 'SSR page check failed' }
  if ($catalog.areas.Count -ne 5 -or $catalog.policies.Count -ne 8) { throw 'Catalog count check failed' }
  if ($policy.id -ne 'POL-001') { throw 'Single-policy API check failed' }
  if ($sitemap.Content -notmatch '/policies' -or $sitemap.Content -match '/social|/political|/economic|/military|/energy') { throw 'Sitemap check failed' }
  $redirect = & curl.exe -s -o NUL -w '%{http_code} %{redirect_url}' 'http://127.0.0.1:4175/energy'
  if ($redirect -notmatch '^301 .*\/policies$') { throw "Redirect check failed: $redirect" }
} finally {
  Stop-Process -Id $server.Id -ErrorAction SilentlyContinue
}
```

Expected: both pages return 200, the catalog returns 5/8, `POL-001` resolves, sitemap contains only canonical routes, and `/energy` reports 301 to `/policies`.

- [ ] **Step 5: Perform responsive visual verification**

Open `/` and `/policies` in the local browser and inspect desktop and mobile widths. Confirm:

- the approved sentence is fully visible;
- no clipped Policy Area labels or status values;
- all four filters remain labeled and usable on mobile;
- policy cards expose three distinct axes;
- evidence expands without overlap;
- missing optional source URLs do not create broken anchors;
- Overview, Policies, Methodology, and Sign Up navigation works;
- no percentage donut, project count, four-pillar card, or legacy sector label remains.

- [ ] **Step 6: Commit documentation and final corrections**

```powershell
git add docs/DATABASE-SETUP.md README.md CLAUDE.md
git add -u
git commit -m "docs: document renewable policy tracker migration"
```

- [ ] **Step 7: Confirm the handoff is clean**

Run:

```powershell
git status --short
git log -7 --oneline
```

Expected: working tree is clean and the task commits appear in dependency order.
