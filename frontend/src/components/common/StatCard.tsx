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
  const highlightDot = {
    red: 'bg-[#ef4444]',
    amber: 'bg-[#f59e0b]',
    emerald: 'bg-[#10b981]',
    blue: 'bg-[#3b82f6]',
    none: 'hidden',
  }[highlight];

  return (
    <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-3.5 hover:border-[#2a2c34] transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {highlight !== 'none' && (
            <span className={`w-1.5 h-1.5 rounded-full ${highlightDot} shrink-0`} />
          )}
          <span className="text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
            {title}
          </span>
        </div>
        {icon && <div className="text-[#71717a]">{icon}</div>}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-xl font-semibold tracking-tight text-[#f4f4f5] font-mono">
          {value}
        </span>
        {trend && (
          <span
            className={`text-[11px] font-medium font-mono ${
              trend.isPositive ? 'text-[#34d399]' : 'text-[#f87171]'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-[11px] text-[#71717a] truncate">{subtitle}</p>
      )}
    </div>
  );
};
