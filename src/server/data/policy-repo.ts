import {
  fallbackPolicyCatalog,
  policyDataset,
  buildPolicyCatalog,
  type PolicyArea,
  type PolicyAssessmentRow,
  type PolicyCatalog,
  type PolicyDataset,
  type PolicyDocumentLinkRow,
  type PolicyDocumentRow,
  type PolicyRecord,
  type PolicyRow,
} from '../../data/policies';

interface SupabaseConfig {
  url: string;
  key: string;
}

function supabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const key = process.env.SUPABASE_ANON_KEY;
  return url && key ? { url, key } : null;
}

const CACHE_TTL_MS = 60_000;
let cache: { at: number; data: PolicyCatalog } | null = null;

async function selectAll<T>(config: SupabaseConfig, path: string): Promise<T[]> {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Supabase responded ${response.status} for ${path}`);
  }
  return response.json() as Promise<T[]>;
}

function verifyAreas(areas: PolicyArea[]): void {
  const expected = fallbackPolicyCatalog.areas;
  if (
    areas.length !== expected.length ||
    areas.some((area, index) =>
      area.slug !== expected[index]?.slug ||
      area.label !== expected[index]?.label ||
      area.sort_order !== expected[index]?.sort_order
    )
  ) {
    throw new Error('Supabase policy areas do not match the bundled definitions');
  }
}

async function fetchFromSupabase(config: SupabaseConfig): Promise<PolicyCatalog> {
  const [areas, policies, documents, links, assessments] = await Promise.all([
    selectAll<PolicyArea>(config, 'policy_areas?select=*&order=sort_order'),
    selectAll<PolicyRow>(config, 'policies?select=*&order=sort_order'),
    selectAll<PolicyDocumentRow>(config, 'policy_documents?select=*&order=document_id'),
    selectAll<PolicyDocumentLinkRow>(config, 'policy_document_links?select=*&order=link_id'),
    selectAll<PolicyAssessmentRow>(config, 'policy_status_assessments?select=*&order=assessment_id'),
  ]);

  if ([areas, policies, documents, links, assessments].some((rows) => rows.length === 0)) {
    throw new Error('Supabase policy catalog has an empty required table');
  }
  verifyAreas(areas);

  const dataset: PolicyDataset = {
    meta: { ...policyDataset.meta, statusAsOf: policies[0]?.status_as_of ?? null },
    policies,
    documents,
    links,
    assessments,
  };
  return buildPolicyCatalog(dataset);
}

export async function getPolicyCatalog(): Promise<PolicyCatalog> {
  const config = supabaseConfig();
  if (!config) return fallbackPolicyCatalog;

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  try {
    const data = await fetchFromSupabase(config);
    cache = { at: Date.now(), data };
    return data;
  } catch (error) {
    console.error('[policy-repo] Supabase load failed, using bundled dataset:', error);
    return fallbackPolicyCatalog;
  }
}

export async function getPolicyById(policyId: string): Promise<PolicyRecord | null> {
  const catalog = await getPolicyCatalog();
  return catalog.policies.find((policy) => policy.id === policyId) ?? null;
}
