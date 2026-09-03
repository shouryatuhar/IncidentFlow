import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Shield, Key, Copy, Check, Terminal } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const webhookSecret = 'incidentflow-whsec-supersecretkey123';
  const webhookUrl = `${window.location.origin}/api/webhooks/incidents`;

  const curlExample = `curl -X POST "${webhookUrl}" \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-secret: ${webhookSecret}" \\
  -d '{
    "service": "Payment API",
    "title": "Payment API latency above threshold",
    "description": "Average latency exceeded 2 seconds across us-east-1 workers",
    "severity": "SEV_2"
  }'`;

  const handleCopy = () => {
    navigator.clipboard.writeText(curlExample);
    setCopied(true);
    success('Webhook cURL snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight font-mono">
          Platform Settings & Integrations
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          User profile credentials and external automated monitoring webhooks
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          Operator Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Full Name
            </span>
            <span className="text-sm font-medium text-slate-200 mt-1 block">
              {user?.name}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Email Address
            </span>
            <span className="text-sm font-mono text-slate-200 mt-1 block">
              {user?.email}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Assigned Role
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 mt-1 rounded text-xs font-mono font-semibold border ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
              }`}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Webhook Integration Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-4 h-4 text-rose-400" />
            Inbound Monitoring Webhook
          </h2>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
            Ingress Active
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Configure Datadog, Prometheus Alertmanager, Grafana, AWS CloudWatch, or custom SRE scripts
          to automatically declare incidents in IncidentFlow by POSTing to the endpoint below.
        </p>

        {/* Webhook Endpoint & Secret */}
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Ingress URL
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300">
              <span className="text-rose-400 font-bold">POST</span>
              <span className="truncate">{webhookUrl}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Webhook Secret Header (x-webhook-secret)
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-300">
              <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{webhookSecret}</span>
            </div>
          </div>
        </div>

        {/* cURL Snippet */}
        <div className="pt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Test Ingestion with cURL
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied' : 'Copy cURL'}
            </Button>
          </div>

          <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 text-xs font-mono text-slate-300 overflow-x-auto selection:bg-indigo-500/40">
            {curlExample}
          </pre>
        </div>
      </div>
    </div>
  );
};
