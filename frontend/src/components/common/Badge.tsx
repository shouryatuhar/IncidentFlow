import React from 'react';
import { Severity, IncidentStatus, ServiceStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border tracking-wide font-mono ${className}`}
  >
    {children}
  </span>
);

export const SeverityBadge: React.FC<{ severity: Severity; className?: string }> = ({
  severity,
  className = '',
}) => {
  const styles: Record<Severity, { label: string; style: string; dot: string }> = {
    SEV_1: {
      label: 'SEV-1 Critical',
      style: 'bg-red-500/15 text-red-300 border-red-500/40',
      dot: 'bg-red-500',
    },
    SEV_2: {
      label: 'SEV-2 Major',
      style: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
      dot: 'bg-orange-500',
    },
    SEV_3: {
      label: 'SEV-3 Minor',
      style: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
      dot: 'bg-yellow-400',
    },
    SEV_4: {
      label: 'SEV-4 Low',
      style: 'bg-blue-500/15 text-blue-300 border-blue-500/40',
      dot: 'bg-blue-400',
    },
  };

  const item = styles[severity] || styles.SEV_4;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border font-mono tracking-tight ${item.style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot} animate-pulse`} />
      {item.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<IncidentStatus, { label: string; style: string }> = {
    INVESTIGATING: {
      label: 'Investigating',
      style: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    },
    IDENTIFIED: {
      label: 'Identified',
      style: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    },
    MONITORING: {
      label: 'Monitoring',
      style: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    },
    RESOLVED: {
      label: 'Resolved',
      style: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    },
  };

  const item = styles[status] || styles.INVESTIGATING;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${item.style} ${className}`}
    >
      {item.label}
    </span>
  );
};

export const ServiceStatusBadge: React.FC<{ status: ServiceStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const styles: Record<ServiceStatus, { label: string; style: string; dot: string }> = {
    OPERATIONAL: {
      label: 'Operational',
      style: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
    },
    DEGRADED: {
      label: 'Degraded',
      style: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
    },
    DOWN: {
      label: 'Down',
      style: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-500',
    },
  };

  const item = styles[status] || styles.OPERATIONAL;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${item.style} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
};
