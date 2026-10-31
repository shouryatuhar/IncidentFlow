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
        return <AlertCircle className="w-3.5 h-3.5 text-[#f87171]" />;
      case 'ASSIGNED':
      case 'UNASSIGNED':
        return <UserCheck className="w-3.5 h-3.5 text-[#b2bc94]" />;
      case 'STATUS_CHANGED':
        return <RefreshCw className="w-3.5 h-3.5 text-[#fbbf24]" />;
      case 'SEVERITY_CHANGED':
        return <Zap className="w-3.5 h-3.5 text-[#fb923c]" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#34d399]" />;
      case 'COMMENT_ADDED':
        return <MessageSquare className="w-3.5 h-3.5 text-[#38bdf8]" />;
      case 'SERVICE_CHANGED':
        return <Server className="w-3.5 h-3.5 text-[#a2aa83]" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-[#818b7e]" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-xs text-[#818b7e] font-mono">
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div className="relative pl-5 space-y-4 before:absolute before:top-2 before:bottom-2 before:left-[7px] before:w-[1px] before:bg-[#30372f]">
      {events.map((event) => (
        <div key={event.id} className="relative flex items-start gap-2.5">
          {/* Node Icon */}
          <div className="absolute -left-5 mt-0.5 w-4 h-4 rounded-full bg-[#111411] border border-[#343c32] flex items-center justify-center shrink-0">
            {getEventIcon(event.type)}
          </div>

          {/* Event Content */}
          <div className="flex-1 flex items-baseline justify-between gap-3 text-xs">
            <div className="text-[#a5aea0] leading-relaxed">
              <span className="text-[#dce1d8] font-medium mr-1.5">{event.message}</span>
              {event.actor && (
                <span className="text-[#818b7e] text-[11px]">
                  by <span className="text-[#c6cdc1]">{event.actor.name}</span>
                </span>
              )}
            </div>
            <span className="text-[11px] font-mono text-[#818b7e] whitespace-nowrap shrink-0">
              {formatTimestamp(event.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
