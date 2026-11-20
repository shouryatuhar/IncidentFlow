import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const developmentJwtSecret = 'development-jwt-secret-incidentflow-2026';

describe('Production configuration', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('WEBHOOK_SECRET', 'a-strong-webhook-secret-for-config-tests');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([
    ['unset', ''],
    ['the development default', developmentJwtSecret],
  ])('refuses to start in production when JWT_SECRET is %s', async (_description, secret) => {
    vi.stubEnv('JWT_SECRET', secret);

    await expect(import('../src/config/env')).rejects.toThrow(
      'JWT_SECRET must be explicitly set to a non-development value in production.'
    );
  });

  it('accepts an explicitly configured production JWT secret', async () => {
    vi.stubEnv('JWT_SECRET', 'a-unique-production-jwt-secret-value-123456');

    const { ENV } = await import('../src/config/env');

    expect(ENV.JWT_SECRET).toBe('a-unique-production-jwt-secret-value-123456');
  });
});
