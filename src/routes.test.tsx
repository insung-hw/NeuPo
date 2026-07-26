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
    expect(typeof route?.loader).toBe('function');
    if (typeof route?.loader !== 'function') throw new Error('Energy redirect loader is missing');
    const response = await route.loader({
      request: new globalThis.Request('https://neupo.app/energy'),
      params: {},
      context: undefined,
    } as never);

    expect(response).toBeInstanceOf(globalThis.Response);
    expect((response as globalThis.Response).status).toBe(301);
    expect((response as globalThis.Response).headers.get('Location')).toBe('/policies');
  });
});
