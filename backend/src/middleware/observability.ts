import { randomUUID } from 'crypto';
import { metrics as otelMetrics, trace } from '@opentelemetry/api';
import { NextFunction, Request, Response } from 'express';

type HttpMetric = { requests: number; failures: number; serverErrors: number; totalDurationMs: number };
const metrics = new Map<string, HttpMetric>();
const meter = metricsApiMeter();
const requestCounter = meter.createCounter('http.server.request.count', {
  description: 'Completed HTTP server requests',
});
const requestDuration = meter.createHistogram('http.server.request.duration', {
  unit: 'ms',
  description: 'HTTP server request duration',
});

function metricsApiMeter() {
  return otelMetrics.getMeter('incidentflow-api');
}

export const requestObservability = (req: Request, res: Response, next: NextFunction): void => {
  const requestId = randomUUID();
  const startedAt = process.hrtime.bigint();
  const activeSpan = trace.getActiveSpan()?.spanContext();
  res.setHeader('X-Request-ID', requestId);

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : 'unmatched';
    const key = `${req.method} ${route} ${res.statusCode}`;
    const metric = metrics.get(key) ?? { requests: 0, failures: 0, serverErrors: 0, totalDurationMs: 0 };
    metric.requests += 1;
    if (res.statusCode >= 400) metric.failures += 1;
    if (res.statusCode >= 500) metric.serverErrors += 1;
    metric.totalDurationMs += durationMs;
    metrics.set(key, metric);
    const attributes = {
      'http.request.method': req.method,
      'http.route': route,
      'http.response.status_code': res.statusCode,
    };
    requestCounter.add(1, attributes);
    requestDuration.record(durationMs, attributes);

    // Deliberately omit headers, body, query values and credentials from logs.
    console.info(JSON.stringify({
      level: 'info',
      event: 'http_request',
      requestId,
      ...(activeSpan ? { traceId: activeSpan.traceId, spanId: activeSpan.spanId } : {}),
      method: req.method,
      route,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
    }));
  });

  next();
};

export const getHttpMetrics = () => ({
  processUptimeSeconds: Number(process.uptime().toFixed(1)),
  requests: Array.from(metrics, ([route, metric]) => ({
    route,
    ...metric,
    averageDurationMs: Number((metric.totalDurationMs / metric.requests).toFixed(2)),
  })),
});
