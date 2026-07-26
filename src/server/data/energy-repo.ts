/**
 * Server-only data access for the energy policy dataset.
 *
 * Mirrors the contract of `pillars-repo.ts`: reads Supabase over PostgREST when
 * SUPABASE_URL / SUPABASE_ANON_KEY are set, falls back to the bundled JSON
 * otherwise or on any failure, and caches briefly so SSR renders and API calls
 * don't hit the database on every request.
 *
 * The four energy tables are read separately and joined in memory. At this size
 * (single-digit policies, tens of documents) that is cheaper and far easier to
 * reason about than a nested PostgREST embed, and it keeps the fallback path
 * identical to the database path — both end up calling `toPillarContent()` on
 * the same in-memory dataset shape.
 *
 * This module must never be imported from client code.
 */
import type { PillarContent } from '../../data/pillars';
import {
  energyDataset,
  toPillarContent,
  type EnergyDataset,
  type EnergyDocument,
  type EnergyPolicy,
  type EnergyPolicyDocumentLink,
  type EnergyStatusAssessment,
} from '../../data/energy';

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const isDbConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

const CACHE_TTL_MS = 60_000;
let cache: { at: number; data: PillarContent } | null = null;

async function selectAll<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY as string,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase responded ${res.status} for ${path}`);
  }
  return (await res.json()) as T[];
}

async function fetchFromSupabase(): Promise<EnergyDataset> {
  const [policies, documents, links, assessments] = await Promise.all([
    selectAll<EnergyPolicy>('policies?select=*&pillar_slug=eq.energy&order=sort_order'),
    selectAll<EnergyDocument>('policy_documents?select=*&order=document_id'),
    selectAll<EnergyPolicyDocumentLink>('policy_document_links?select=*&order=link_id'),
    selectAll<EnergyStatusAssessment>('policy_status_assessments?select=*&order=assessment_id'),
  ]);

  return {
    // The stored rows carry no dataset-level metadata; reuse the bundled meta
    // and let the policies' own `status_as_of` state how current they are.
    meta: { ...energyDataset.meta, statusAsOf: policies[0]?.status_as_of ?? null },
    policies,
    documents,
    links,
    assessments,
  };
}

/**
 * Returns the energy pillar in the shared `PillarContent` shape.
 * Never throws — falls back to the bundled dataset.
 */
export async function getEnergyPillar(): Promise<PillarContent> {
  if (!isDbConfigured) return toPillarContent(energyDataset);

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  try {
    const dataset = await fetchFromSupabase();
    // A configured-but-unseeded DB (schema.energy.sql run, seed not yet) must
    // not blank the pillar — fall back to the bundled dataset in that case.
    if (dataset.policies.length === 0) return toPillarContent(energyDataset);
    const data = toPillarContent(dataset);
    cache = { at: Date.now(), data };
    return data;
  } catch (err) {
    console.error('[energy-repo] Supabase load failed, using bundled dataset:', err);
    return toPillarContent(energyDataset);
  }
}
