import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../src/middleware/errorHandler';
import { requestObservability } from '../src/middleware/observability';

describe('Request error observability', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs the request ID generated on the response', async () => {
    const app = express();
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    app.use(requestObservability);
    app.get('/test-error', (_req, _res, next) => next(new Error('test failure')));
    app.use(errorHandler);

    const response = await request(app).get('/test-error');
    const loggedError = JSON.parse(errorLog.mock.calls[0][0] as string);

    expect(response.status).toBe(500);
    expect(response.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/i);
    expect(loggedError.requestId).toBe(response.headers['x-request-id']);
  });
});
