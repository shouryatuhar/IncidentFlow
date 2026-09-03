import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Incident } from '../../types';
import { SeverityBadge, StatusBadge } from '../common/Badge';
import { MessageSquare, Clock, User as UserIcon } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '../common/LoadingAndEmpty';

interface IncidentTableProps {
  incidents: Incident[];
  isLoading: boolean;
  onResetFilters?: () => void;
}

export const IncidentTable: React.FC<IncidentTableProps> = ({
  incidents,
  isLoading,
  onResetFilters,
}) => {
  const navigate = useNavigate();

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-sm">
        <LoadingSpinner message="Fetching incidents from database..." />
      </div>
    );
  }

  if (incidents.length === 0) {
    return (
      <EmptyState
        title="No incidents found"
        description="No incidents match the active search or filter criteria. Try resetting filters or declaring a new incident."
        action={
          onResetFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline"
            >
              Reset all filters
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            <tr>
              <th scope="col" className="px-5 py-3.5 w-36">
                Severity
              </th>
              <th scope="col" className="px-5 py-3.5 min-w-[280px]">
                Incident
              </th>
              <th scope="col" className="px-5 py-3.5">
                Service
              </th>
              <th scope="col" className="px-5 py-3.5">
                Status
              </th>
              <th scope="col" className="px-5 py-3.5">
                Assignee
              </th>
              <th scope="col" className="px-5 py-3.5 text-right whitespace-nowrap">
                Started
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
              >
                {/* Severity */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <SeverityBadge severity={incident.severity} />
                </td>

                {/* Title & Metadata */}
                <td className="px-5 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                      {incident.title}
                    </span>
                    {incident._count && incident._count.comments > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <MessageSquare className="w-3 h-3" />
                        {incident._count.comments}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-md mt-0.5">
                    {incident.description}
                  </p>
                </td>

                {/* Service */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 text-xs font-mono">
                    {incident.service?.name}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4 whitespace-nowrap">
                  <StatusBadge status={incident.status} />
                </td>

                {/* Assignee */}
                <td className="px-5 py-4 whitespace-nowrap">
                  {incident.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-300 font-mono">
                        {incident.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-slate-200">
                        {incident.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic flex items-center gap-1">
                      <UserIcon className="w-3 h-3" /> Unassigned
                    </span>
                  )}
                </td>

                {/* Created / Started Time */}
                <td className="px-5 py-4 text-right whitespace-nowrap font-mono text-xs text-slate-400">
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {formatDate(incident.startedAt || incident.createdAt)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
