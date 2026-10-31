import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';

const otlpConfigured = Boolean(
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
  process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
  process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT
);

const sdk = new NodeSDK({
  serviceName: 'incidentflow-api',
  instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
  ...(otlpConfigured
    ? {
        traceExporter: new OTLPTraceExporter(),
        metricReaders: [
          new PeriodicExportingMetricReader({ exporter: new OTLPMetricExporter() }),
        ],
      }
    : {}),
});

sdk.start();

export const shutdownTelemetry = () => sdk.shutdown();
