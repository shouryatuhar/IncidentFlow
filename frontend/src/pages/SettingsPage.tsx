import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Shield, Copy, Check, Terminal } from 'lucide-react';

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
    <div className="max-w-4xl space-y-4">
      {/* Header */}
      <div className="pb-1">
        <h1 className="text-base font-semibold text-[#f4f4f5] tracking-tight">
          Platform Settings & Integrations
        </h1>
        <p className="text-xs text-[#71717a] mt-0.5">
          User profile credentials and external automated monitoring webhooks
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-[#1f2127] pb-2">
          <Shield className="w-3.5 h-3.5 text-[#71717a]" />
          <h2 className="text-xs font-semibold text-[#f4f4f5]">
            Operator Profile
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-[#08090a] border border-[#1f2127] rounded-[5px] p-2.5">
            <span className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider block">
              Full Name
            </span>
            <span className="text-xs font-medium text-[#ededed] mt-1 block">
              {user?.name}
            </span>
          </div>

          <div className="bg-[#08090a] border border-[#1f2127] rounded-[5px] p-2.5">
            <span className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider block">
              Email Address
            </span>
            <span className="text-xs font-mono text-[#ededed] mt-1 block truncate">
              {user?.email}
            </span>
          </div>

          <div className="bg-[#08090a] border border-[#1f2127] rounded-[5px] p-2.5">
            <span className="text-[10px] font-medium text-[#71717a] uppercase tracking-wider block">
              Assigned Role
            </span>
            <span className="inline-flex items-center px-1.5 py-0.2 mt-1 rounded-[4px] text-[10px] font-mono font-medium border border-[#22242a] bg-[#15161a] text-[#ededed]">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Webhook Integration Card */}
      <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#1f2127] pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-[#f87171]" />
            <h2 className="text-xs font-semibold text-[#f4f4f5]">
              Inbound Monitoring Webhook
            </h2>
          </div>
          <span className="text-[10px] font-mono text-[#34d399] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-[4px]">
            Ingress Active
          </span>
        </div>

        <p className="text-xs text-[#a1a1aa] leading-relaxed">
          Configure Datadog, Prometheus Alertmanager, Grafana, AWS CloudWatch, or custom SRE scripts
          to declare incidents automatically over HTTPS via the webhook endpoint.
        </p>

        {/* Webhook URL & Secret Display */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="bg-[#08090a] border border-[#1f2127] rounded-[5px] p-2.5">
            <span className="text-[10px] font-mono uppercase text-[#71717a] block mb-1">
              Ingress Target URL
            </span>
            <code className="text-[11px] font-mono text-[#ededed] break-all select-all">
              {webhookUrl}
            </code>
          </div>

          <div className="bg-[#08090a] border border-[#1f2127] rounded-[5px] p-2.5">
            <span className="text-[10px] font-mono uppercase text-[#71717a] block mb-1">
              Shared Header Secret (x-webhook-secret)
            </span>
            <code className="text-[11px] font-mono text-[#f87171] break-all select-all">
              {webhookSecret}
            </code>
          </div>
        </div>

        {/* cURL Snippet Box */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[11px] text-[#71717a]">
            <span>cURL Integration Snippet</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-xs text-[#ededed] hover:underline cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#34d399]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <pre className="p-3 bg-[#08090a] border border-[#1f2127] rounded-[5px] font-mono text-[11px] text-[#a1a1aa] overflow-x-auto leading-relaxed">
            {curlExample}
          </pre>
        </div>
      </div>
    </div>
  );
};
