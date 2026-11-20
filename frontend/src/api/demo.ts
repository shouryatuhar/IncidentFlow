import { getToken } from './client';
import { Severity } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export interface DemoAlertPayload {
  idempotencyKey: string;
  service: string;
  severity: Severity;
}

export interface DemoCallResult {
  status: number;
  incidentId?: string;
  duplicate?: boolean;
  latencyMs?: number;
  requestId?: string;
  error?: string;
  completedAt: number;
}

export interface DemoRunSummary {
  sent: number;
  created: number;
  duplicate: number;
  other: number;
  p50: number | null;
  p95: number | null;
  lastRequestId?: string;
  incidentId?: string;
  results: DemoCallResult[];
}

const percentile = (values: number[], point: number): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(point * sorted.length) - 1];
};

export const summarizeDemoRun = (results: DemoCallResult[]): DemoRunSummary => {
  const responded = results.filter((result) => result.status > 0);
  const latest = [...responded].sort((a, b) => b.completedAt - a.completedAt)[0];
  const created = results.filter((result) => result.status === 201 && result.duplicate === false).length;
  const duplicate = results.filter((result) => result.status === 200 && result.duplicate === true).length;
  const latencies = responded.flatMap((result) => result.latencyMs === undefined ? [] : [result.latencyMs]);

  return {
    sent: results.length,
    created,
    duplicate,
    other: results.length - created - duplicate,
    p50: percentile(latencies, 0.5),
    p95: percentile(latencies, 0.95),
    lastRequestId: latest?.requestId,
    incidentId: results.find((result) => result.incidentId)?.incidentId,
    results,
  };
};

export const demoApi = {
  async fireAlert(payload: DemoAlertPayload): Promise<DemoCallResult> {
    const startedAt = performance.now();
    try {
      const response = await fetch(`${API_BASE}/demo/alert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      return {
        status: response.status,
        incidentId: data.incidentId,
        duplicate: data.duplicate,
        latencyMs: Number((performance.now() - startedAt).toFixed(2)),
        requestId: response.headers.get('X-Request-ID') || undefined,
        error: data?.error?.message,
        completedAt: performance.now(),
      };
    } catch (error) {
      return {
        status: 0,
        error: error instanceof Error ? error.message : 'Network request failed',
        completedAt: performance.now(),
      };
    }
  },

  async reset(): Promise<number> {
    const response = await fetch(`${API_BASE}/demo/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Could not reset demo incidents');
    }
    return data.deleted ?? 0;
  },
};

export const isSeededDemoAccount = (email?: string | null): boolean =>
  ['admin@incidentflow.dev', 'engineer@incidentflow.dev', 'sre@incidentflow.dev', 'devops@incidentflow.dev']
    .includes((email || '').toLowerCase());
