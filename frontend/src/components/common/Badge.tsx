import React from 'react';
import { Severity, IncidentStatus, ServiceStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center px-1.5 py-0.5 rounded-[4px] text-[11px] font-medium border border-[#22242a] bg-[#121316] text-[#a1a1aa] tracking-tight font-mono ${className}`}
  >
    {children}
  </span>
);

export const SeverityBadge: React.FC<{ severity: Severity; className?: string }> = ({
  severity,
  className = '',
}) => {
  const styles: Record<Severity, { label: string; text: string; bg: string; border: string; dot: string }> = {
    SEV_1: {
      label: 'SEV-1 Critical',
      text: 'text-[#f87171]',
      bg: 'bg-rose-500/[0.08]',
      border: 'border-rose-500/25',
      dot: 'bg-[#ef4444]',
    },
    SEV_2: {
      label: 'SEV-2 Major',
      text: 'text-[#fb923c]',
      bg: 'bg-orange-500/[0.08]',
      border: 'border-orange-500/25',
      dot: 'bg-[#f97316]',
    },
    SEV_3: {
      label: 'SEV-3 Minor',
      text: 'text-[#facc15]',
      bg: 'bg-amber-500/[0.08]',
      border: 'border-amber-500/25',
      dot: 'bg-[#eab308]',
    },
    SEV_4: {
      label: 'SEV-4 Low',
      text: 'text-[#94a3b8]',
      bg: 'bg-slate-500/[0.08]',
      border: 'border-slate-500/25',
      dot: 'bg-[#64748b]',
    },
  };

  const item = styles[severity] || styles.SEV_4;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium border font-mono tracking-tight ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
      <span>{item.label}</span>
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<IncidentStatus, { label: string; text: string; bg: string; border: string; dot: string }> = {
    INVESTIGATING: {
      label: 'Investigating',
      text: 'text-[#fbbf24]',
      bg: 'bg-amber-500/[0.08]',
      border: 'border-amber-500/25',
      dot: 'bg-[#f59e0b]',
    },
    IDENTIFIED: {
      label: 'Identified',
      text: 'text-[#818cf8]',
      bg: 'bg-indigo-500/[0.08]',
      border: 'border-indigo-500/25',
      dot: 'bg-[#6366f1]',
    },
    MONITORING: {
      label: 'Monitoring',
      text: 'text-[#c084fc]',
      bg: 'bg-purple-500/[0.08]',
      border: 'border-purple-500/25',
      dot: 'bg-[#a855f7]',
    },
    RESOLVED: {
      label: 'Resolved',
      text: 'text-[#34d399]',
      bg: 'bg-emerald-500/[0.08]',
      border: 'border-emerald-500/25',
      dot: 'bg-[#10b981]',
    },
  };

  const item = styles[status] || styles.INVESTIGATING;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium border tracking-tight ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
      <span>{item.label}</span>
    </span>
  );
};

export const ServiceStatusBadge: React.FC<{ status: ServiceStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<ServiceStatus, { label: string; text: string; bg: string; border: string; dot: string }> = {
    OPERATIONAL: {
      label: 'Operational',
      text: 'text-[#34d399]',
      bg: 'bg-emerald-500/[0.08]',
      border: 'border-emerald-500/25',
      dot: 'bg-[#10b981]',
    },
    DEGRADED: {
      label: 'Degraded',
      text: 'text-[#fbbf24]',
      bg: 'bg-amber-500/[0.08]',
      border: 'border-amber-500/25',
      dot: 'bg-[#f59e0b]',
    },
    DOWN: {
      label: 'Down',
      text: 'text-[#f87171]',
      bg: 'bg-rose-500/[0.08]',
      border: 'border-rose-500/25',
      dot: 'bg-[#ef4444]',
    },
  };

  const item = styles[status] || styles.OPERATIONAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-medium border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
      <span>{item.label}</span>
    </span>
  );
};
