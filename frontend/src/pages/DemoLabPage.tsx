import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { Activity, AlertTriangle, ArrowUpRight, Check, Copy, RotateCcw, Zap } from 'lucide-react';
import { servicesApi } from '../api/services';
import { demoApi, DemoRunSummary, isSeededDemoAccount, summarizeDemoRun } from '../api/demo';
import { Service, Severity } from '../types';
import { useAuth } from '../context/AuthContext';

const STORM_SIZE = 50;

const formatLatency = (value: number | null) => value === null ? '—' : `${value.toFixed(1)} ms`;

export const DemoLabPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isDemoAccount = isSeededDemoAccount(user?.email);
  const { data: services = [], isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: servicesApi.list,
  });
  const [service, setService] = useState('');
  const [severity, setSeverity] = useState<Severity>('SEV_2');
  const [lastKey, setLastKey] = useState('');
  const [summary, setSummary] = useState<DemoRunSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!service && services.length) setService(services[0].name);
  }, [service, services]);

  const canFire = Boolean(service) && !busy;
  const serviceOptions = useMemo(() => services as Service[], [services]);

  const run = async (kind: 'fire' | 'duplicate' | 'storm') => {
    if (!service) return;
    const key = kind === 'duplicate' ? lastKey : crypto.randomUUID();
    if (!key) return;

    setBusy(true);
    setError('');
    setMessage('');
    setSummary(null);
    setLastKey(key);
    try {
      const payload = { idempotencyKey: key, service, severity };
      const results = kind === 'storm'
        ? await Promise.all(Array.from({ length: STORM_SIZE }, () => demoApi.fireAlert(payload)))
        : [await demoApi.fireAlert(payload)];
      setSummary(summarizeDemoRun(results));
      if (results.some((result) => result.status === 201)) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['incidents'] }),
          queryClient.invalidateQueries({ queryKey: ['analytics'] }),
        ]);
      }
      if (results.some((result) => result.status === 0)) {
        setError('Some requests could not reach the API. Those calls are counted under other.');
      }
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : 'The demo request failed.');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const deleted = await demoApi.reset();
      setSummary(null);
      setLastKey('');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['incidents'] }),
        queryClient.invalidateQueries({ queryKey: ['analytics'] }),
      ]);
      setMessage(`Demo reset complete. Removed ${deleted} demo incident${deleted === 1 ? '' : 's'}.`);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reset demo data.');
    } finally {
      setBusy(false);
    }
  };

  if (!isDemoAccount) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-[#3f3c32] bg-[#191d19] p-6 text-center">
        <h1 className="text-base font-semibold text-[#e8ebe4]">Demo Lab is locked</h1>
        <p className="mt-2 text-xs text-[#8a9187]">Sign in with one of the seeded IncidentFlow demo accounts to use the simulator.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a5aea0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#9bd46b] shadow-[0_0_12px_#9bd46b]" />
            Safe sandbox · {user?.name || 'Demo account'}
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[#e8ebe4]">Demo Lab</h1>
          <p className="mt-1 max-w-2xl text-xs leading-5 text-[#8a9187]">
            Exercise the real incident webhook path from the browser. Every alert is marked as demo data and can be reset here.
          </p>
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="inline-flex items-center justify-center gap-2 rounded-md border border-[#394137] bg-[#191d19] px-3 py-2 text-xs font-medium text-[#cbd2c6] transition hover:border-[#697663] hover:bg-[#20261f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset demo data
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="overflow-hidden rounded-lg border border-[#30372f] bg-[#191d19]">
          <div className="flex items-center justify-between border-b border-[#30372f] px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#e8ebe4]">
              <Zap className="h-4 w-4 text-[#a3d46c]" /> Alert simulator
            </div>
            <span className="rounded border border-[#384333] bg-[#22291f] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[#a3d46c]">Webhook path</span>
          </div>
          <div className="space-y-4 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-[10px] font-medium uppercase tracking-wider text-[#8a9187]">
                Service
                <select
                  aria-label="Service"
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  disabled={servicesLoading || busy || !serviceOptions.length}
                  className="w-full rounded-md border border-[#3a4038] bg-[#111411] px-3 py-2.5 text-xs normal-case tracking-normal text-[#e8ebe4] outline-none transition focus:border-[#91b56c]"
                >
                  {servicesLoading && <option value="">Loading services…</option>}
                  {!servicesLoading && !serviceOptions.length && <option value="">No services available</option>}
                  {serviceOptions.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
                </select>
              </label>
              <label className="space-y-1.5 text-[10px] font-medium uppercase tracking-wider text-[#8a9187]">
                Severity
                <select
                  aria-label="Severity"
                  value={severity}
                  onChange={(event) => setSeverity(event.target.value as Severity)}
                  disabled={busy}
                  className="w-full rounded-md border border-[#3a4038] bg-[#111411] px-3 py-2.5 text-xs normal-case tracking-normal text-[#e8ebe4] outline-none transition focus:border-[#91b56c]"
                >
                  <option value="SEV_1">SEV-1 · Critical</option>
                  <option value="SEV_2">SEV-2 · High</option>
                  <option value="SEV_3">SEV-3 · Moderate</option>
                  <option value="SEV_4">SEV-4 · Low</option>
                </select>
              </label>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => run('fire')} disabled={!canFire} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#9bd46b] px-3 py-2.5 text-xs font-semibold text-[#12170f] transition hover:bg-[#ace47f] disabled:cursor-not-allowed disabled:opacity-50">
                <Zap className="h-3.5 w-3.5" /> {busy ? 'Sending…' : 'Fire alert'}
              </button>
              <button type="button" onClick={() => run('duplicate')} disabled={!canFire || !lastKey} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#394137] bg-[#20251f] px-3 py-2.5 text-xs font-medium text-[#d8dfd2] transition hover:border-[#66755e] disabled:cursor-not-allowed disabled:opacity-40">
                <Copy className="h-3.5 w-3.5" /> Send duplicate
              </button>
              <button type="button" onClick={() => run('storm')} disabled={!canFire} className="inline-flex items-center justify-center gap-2 rounded-md border border-[#394137] bg-[#20251f] px-3 py-2.5 text-xs font-medium text-[#d8dfd2] transition hover:border-[#66755e] disabled:cursor-not-allowed disabled:opacity-50">
                <Activity className="h-3.5 w-3.5" /> Retry storm · 50
              </button>
            </div>
            <p className="text-[10px] leading-4 text-[#737c70]">
              Duplicate and storm calls reuse one idempotency key. The API’s unique event constraint decides the winner.
            </p>
          </div>
        </section>

        <aside className="rounded-lg border border-[#30372f] bg-[#151915] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#dce1d8]">
            <AlertTriangle className="h-3.5 w-3.5 text-[#d3a45c]" /> What this proves
          </div>
          <ul className="mt-3 space-y-3 text-[11px] leading-4 text-[#8a9187]">
            <li className="flex gap-2"><span className="text-[#a3d46c]">01</span><span>Browser requests use the same server webhook handler.</span></li>
            <li className="flex gap-2"><span className="text-[#a3d46c]">02</span><span>Concurrent retries share one event key; the database enforces uniqueness.</span></li>
            <li className="flex gap-2"><span className="text-[#a3d46c]">03</span><span>Webhook credentials stay on the server and never enter browser code.</span></li>
          </ul>
        </aside>
      </div>

      {error && <div role="alert" className="rounded-md border border-[#693e3e] bg-[#2b1d1d] px-3 py-2 text-xs text-[#ffaaa5]">{error}</div>}
      {message && <div role="status" className="rounded-md border border-[#384b34] bg-[#20291e] px-3 py-2 text-xs text-[#c1dfa8]">{message}</div>}

      {summary && (
        <section aria-label="Demo results" className="overflow-hidden rounded-lg border border-[#30372f] bg-[#191d19]">
          <div className="flex flex-col gap-2 border-b border-[#30372f] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xs font-semibold text-[#e8ebe4]">Run results</h2>
              <p className="mt-0.5 text-[10px] text-[#818b7e]">Measured from the responses received by this browser.</p>
            </div>
            {summary.incidentId && (
              <Link to={`/incidents/${summary.incidentId}`} className="inline-flex items-center gap-1 text-[10px] font-medium text-[#b8d995] hover:text-[#d2edb1]">
                Open incident <ArrowUpRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 divide-x divide-y divide-[#30372f] sm:grid-cols-3 sm:divide-y-0 xl:grid-cols-6">
            <Metric label="Sent" value={summary.sent.toString()} />
            <Metric label="Created" value={summary.created.toString()} accent />
            <Metric label="Duplicate" value={summary.duplicate.toString()} />
            <Metric label="Other" value={summary.other.toString()} warn={summary.other > 0} />
            <Metric label="p50 latency" value={formatLatency(summary.p50)} compact />
            <Metric label="p95 latency" value={formatLatency(summary.p95)} compact />
          </div>
          <div className="flex flex-col gap-3 border-t border-[#30372f] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2 text-[10px] text-[#818b7e]">
              <span className="shrink-0">Last X-Request-ID</span>
              <code className="truncate rounded bg-[#101310] px-2 py-1 font-mono text-[#c3cbbd]">{summary.lastRequestId || 'No HTTP response'}</code>
            </div>
            <div className="flex flex-wrap gap-1" aria-label="Individual request statuses">
              {summary.results.map((result, index) => (
                <span key={`${index}-${result.status}`} title={result.error || `HTTP ${result.status}`} className={`flex h-5 min-w-5 items-center justify-center rounded px-1 font-mono text-[9px] ${result.status === 201 ? 'bg-[#2d4427] text-[#b8e69b]' : result.status === 200 ? 'bg-[#26342b] text-[#a9cda0]' : 'bg-[#4a2929] text-[#ffaaa5]'}`}>
                  {result.status === 201 ? <Check className="h-3 w-3" /> : result.status === 200 ? '↻' : result.status || '!' }
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      <p className="text-center text-[9px] uppercase tracking-[0.16em] text-[#646d60]">Demo data only · no real monitoring alerts</p>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; accent?: boolean; warn?: boolean; compact?: boolean }> = ({ label, value, accent, warn, compact }) => (
  <div className="min-w-0 p-3.5">
    <p className="text-[9px] font-medium uppercase tracking-wider text-[#818b7e]">{label}</p>
    <p className={`mt-1 truncate font-mono font-semibold ${compact ? 'text-[10px]' : 'text-lg'} ${accent ? 'text-[#b8e69b]' : warn ? 'text-[#ffaaa5]' : 'text-[#e8ebe4]'}`}>{value}</p>
  </div>
);
