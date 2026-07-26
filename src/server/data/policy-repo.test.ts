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
