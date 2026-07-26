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
