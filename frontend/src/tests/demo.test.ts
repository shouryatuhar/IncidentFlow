import { describe, expect, it } from 'vitest';
import { isSeededDemoAccount, summarizeDemoRun } from '../api/demo';

describe('Demo Lab result summaries', () => {
  it('counts actual create, duplicate, and other responses and calculates response latency percentiles', () => {
    const summary = summarizeDemoRun([
      { status: 201, duplicate: false, incidentId: 'inc-1', latencyMs: 20, requestId: 'req-1', completedAt: 20 },
      { status: 200, duplicate: true, incidentId: 'inc-1', latencyMs: 10, requestId: 'req-2', completedAt: 30 },
      { status: 429, latencyMs: 40, requestId: 'req-3', completedAt: 40 },
      { status: 0, completedAt: 50, error: 'Network request failed' },
    ]);

    expect(summary).toMatchObject({
      sent: 4,
      created: 1,
      duplicate: 1,
      other: 2,
      p50: 20,
      p95: 40,
      lastRequestId: 'req-3',
      incidentId: 'inc-1',
    });
  });

  it('recognizes only the four seeded demo accounts', () => {
    expect(isSeededDemoAccount('admin@incidentflow.dev')).toBe(true);
    expect(isSeededDemoAccount('engineer@incidentflow.dev')).toBe(true);
    expect(isSeededDemoAccount('someone@incidentflow.dev')).toBe(false);
    expect(isSeededDemoAccount('admin@example.com')).toBe(false);
  });
});
