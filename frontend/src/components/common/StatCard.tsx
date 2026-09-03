import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  highlight?: 'red' | 'amber' | 'emerald' | 'blue' | 'none';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlight = 'none',
}) => {
  const highlightStyles = {
    red: 'border-l-4 border-l-rose-500',
    amber: 'border-l-4 border-l-amber-500',
    emerald: 'border-l-4 border-l-emerald-500',
    blue: 'border-l-4 border-l-sky-500',
    none: '',
  }[highlight];

  return (
    <div
      className={`bg-slate-900 border border-slate-800/80 rounded-xl p-5 shadow-sm hover:border-slate-700/80 transition-all ${highlightStyles}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
