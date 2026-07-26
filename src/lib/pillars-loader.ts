import type { PillarContent } from '@/data/pillars';

/**
 * Isomorphic data loader used by the React Router route loaders.
 *
 * On the server (SSR) it reads the database directly through the server-only
 * repository. Vite statically replaces `import.meta.env.SSR`, so the dynamic
 * import of the server module is dead-code-eliminated from the browser bundle —
 * DB credentials and server code never ship to the client.
 *
 * On the client it fetches the same data from the public `/api/pillars` routes.
 */
export async function loadPillar(slug: string): Promise<PillarContent | null> {
  if (import.meta.env.SSR) {
    const { getPillarBySlug } = await import('@/server/data/pillars-repo');
    return getPillarBySlug(slug);
  }

  const res = await fetch(`/api/pillars/${slug}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Response('Failed to load pillar', { status: 502 });
  return (await res.json()) as PillarContent;
}

/** Loads a pillar and throws a 404 Response when the slug is unknown. */
export async function loadPillarOrThrow(slug: string): Promise<PillarContent> {
  const pillar = await loadPillar(slug);
  if (!pillar) throw new Response('Not Found', { status: 404 });
  return pillar;
}
