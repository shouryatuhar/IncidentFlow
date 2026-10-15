import React from 'react';
import { Loader2, Inbox } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading...',
  className = 'py-12',
}) => (
  <div className={`flex flex-col items-center justify-center gap-2.5 ${className}`}>
    <Loader2 className="w-5 h-5 animate-spin text-[#71717a]" />
    <span className="text-xs text-[#71717a] font-mono">{message}</span>
  </div>
);

export const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}> = ({
  title,
  description,
  action,
  icon = <Inbox className="w-6 h-6 text-[#71717a]" />,
}) => (
  <div className="flex flex-col items-center justify-center text-center p-8 rounded-[6px] border border-[#1f2127] bg-[#0c0d10] my-2">
    <div className="p-2 rounded-[6px] bg-[#15161a] border border-[#22242a] mb-2.5 text-[#71717a]">
      {icon}
    </div>
    <h3 className="text-xs font-semibold text-[#f4f4f5]">{title}</h3>
    <p className="text-[11px] text-[#71717a] mt-1 max-w-sm mb-3 leading-relaxed">
      {description}
    </p>
    {action}
  </div>
);
