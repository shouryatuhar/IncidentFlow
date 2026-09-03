import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

const app = createApp();

describe('Security & API Documentation', () => {
  it('should include Helmet security headers on responses', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers['x-dns-prefetch-control']).toBe('off');
  });

  it('should serve Swagger OpenAPI specification at /api/docs.json', async () => {
    const res = await request(app).get('/api/docs.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.3');
    expect(res.body.info.title).toBe('IncidentFlow API');
    expect(res.body.paths['/incidents']).toBeDefined();
    expect(res.body.paths['/webhooks/incidents']).toBeDefined();
  });

  it('should serve interactive Swagger UI HTML at /api/docs/', async () => {
    const res = await request(app).get('/api/docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});
