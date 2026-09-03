import React from 'react';
import { Loader2, FolderOpen } from 'lucide-react';

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading...',
  className = 'py-12',
}) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
    <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
    <span className="text-sm text-slate-400 font-medium">{message}</span>
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
  icon = <FolderOpen className="w-8 h-8 text-slate-500" />,
}) => (
  <div className="flex flex-col items-center justify-center text-center p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 my-4">
    <div className="p-3 rounded-full bg-slate-800/80 mb-3">{icon}</div>
    <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
    <p className="text-xs text-slate-400 mt-1 max-w-sm mb-4 leading-relaxed">
      {description}
    </p>
    {action}
  </div>
);
