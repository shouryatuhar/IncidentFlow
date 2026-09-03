import React from 'react';
import { TimelineEvent } from '../../types';
import {
  AlertCircle,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  MessageSquare,
  Activity,
  Server,
  Zap,
} from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events }) => {
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CREATED':
      case 'WEBHOOK_CREATED':
        return <AlertCircle className="w-4 h-4 text-rose-400" />;
      case 'ASSIGNED':
      case 'UNASSIGNED':
        return <UserCheck className="w-4 h-4 text-indigo-400" />;
      case 'STATUS_CHANGED':
        return <RefreshCw className="w-4 h-4 text-amber-400" />;
      case 'SEVERITY_CHANGED':
        return <Zap className="w-4 h-4 text-orange-400" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-4 h-4 text-sky-400" />;
      case 'SERVICE_CHANGED':
        return <Server className="w-4 h-4 text-purple-400" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-slate-500 italic font-mono">
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-slate-800">
      {events.map((event) => (
        <div key={event.id} className="relative flex items-start gap-3 group">
          {/* Timeline Node Icon */}
          <div className="absolute -left-6 mt-0.5 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-sm">
            {getEventIcon(event.type)}
          </div>

          {/* Event Content */}
          <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-xs shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-slate-200">
                {event.message}
              </span>
              <span className="text-[11px] font-mono text-slate-500 whitespace-nowrap">
                {formatTimestamp(event.createdAt)}
              </span>
            </div>
            {event.actor && (
              <span className="text-slate-400 text-[11px]">
                by <span className="text-slate-300 font-medium">{event.actor.name}</span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
