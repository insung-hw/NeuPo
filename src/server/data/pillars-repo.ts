/**
 * Server-only data access for pillars/projects.
 *
 * Reads from Supabase (via its PostgREST HTTP endpoint) when SUPABASE_URL and
 * SUPABASE_ANON_KEY are set. If they are not — or if a request fails — it falls
 * back to the bundled JSON content so the site keeps working before the
 * database is wired up. Results are cached in-memory for a short window to
 * avoid hitting Supabase on every SSR render / API call.
 *
 * This module must never be imported from client code. It is only reached from
 * the Express API routes and from the isomorphic loader's `import.meta.env.SSR`
 * branch (which Vite strips out of the browser bundle).
 */
import type { PillarContent, Project, ProjectCategory } from '../../data/pillars';
import contentJson from '../../data/pillars.content.json';

const mockPillars = (contentJson as { pillars: PillarContent[] }).pillars;

const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
const isDbConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

const CACHE_TTL_MS = 60_000;
let cache: { at: number; data: PillarContent[] } | null = null;

// Shape of a row in the Supabase `projects` table (snake_case columns).
interface ProjectRow {
  id: string;
  pillar_slug: string;
  category: ProjectCategory;
  title: string;
  agency: string;
  status: Project['status'];
  progress: number;
  budget: string;
  description: string;
  source: string;
  source_url: string | null;
}

interface PillarRow {
  slug: string;
  label: string;
  description: string;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    title: row.title,
    agency: row.agency,
    status: row.status,
    progress: row.progress,
    budget: row.budget,
    description: row.description,
    source: row.source,
    sourceUrl: row.source_url ?? undefined,
    category: row.category,
  };
}

async function fetchFromSupabase(): Promise<PillarContent[]> {
  const headers = {
    apikey: SUPABASE_KEY as string,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };

  const [pillarsRes, projectsRes] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/pillars?select=slug,label,description&order=sort_order`, {
      headers,
    }),
    fetch(
      `${SUPABASE_URL}/rest/v1/projects?select=id,pillar_slug,category,title,agency,status,progress,budget,description,source,source_url&order=sort_order`,
      { headers },
    ),
  ]);

  if (!pillarsRes.ok || !projectsRes.ok) {
    throw new Error(
      `Supabase responded ${pillarsRes.status}/${projectsRes.status} while loading pillars`,
    );
  }

  const pillarRows = (await pillarsRes.json()) as PillarRow[];
  const projectRows = (await projectsRes.json()) as ProjectRow[];

  return pillarRows.map((p) => {
    const forPillar = projectRows.filter((r) => r.pillar_slug === p.slug);
    const byCategory = (category: ProjectCategory) =>
      forPillar.filter((r) => r.category === category).map(rowToProject);
    return {
      slug: p.slug,
      label: p.label,
      description: p.description,
      objectives: byCategory('Objectives'),
      policies: byCategory('Policies'),
      projects: byCategory('Projects'),
    };
  });
}

/** Returns all pillars with their nested projects. Never throws — falls back to mock. */
export async function getAllPillars(): Promise<PillarContent[]> {
  if (!isDbConfigured) return mockPillars;

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;

  try {
    const data = await fetchFromSupabase();
    // A configured-but-empty DB (e.g. schema created, seed not run yet) should
    // not blank the site — fall back to mock content in that case.
    if (data.length === 0) return mockPillars;
    cache = { at: Date.now(), data };
    return data;
  } catch (err) {
    console.error('[pillars-repo] Supabase load failed, using mock content:', err);
    return mockPillars;
  }
}

/** Returns a single pillar by slug, or null if it does not exist. */
export async function getPillarBySlug(slug: string): Promise<PillarContent | null> {
  const all = await getAllPillars();
  return all.find((p) => p.slug === slug) ?? null;
}
