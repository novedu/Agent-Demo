import { afterEach, describe, expect, it, vi } from 'vitest';
import { checkAgentServerHealth } from './agent';

describe('Agent Server health client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests the stable health endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: 'ok' }),
    });
    vi.stubGlobal('fetch', fetchMock);

    await expect(checkAgentServerHealth()).resolves.toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:3001/health', {
      method: 'GET',
      cache: 'no-store',
    });
  });

  it('throws when the Agent Server health endpoint is unavailable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    await expect(checkAgentServerHealth()).rejects.toThrow('health check failed: 503');
  });
});
