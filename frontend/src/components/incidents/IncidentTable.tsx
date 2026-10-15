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
      <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-8">
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
              className="text-xs font-medium text-[#ededed] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#a1a1aa]">
          <thead className="bg-[#0d0e11] border-b border-[#1f2127] text-[11px] font-medium text-[#71717a] uppercase tracking-wider font-mono">
            <tr>
              <th scope="col" className="px-3.5 py-2.5 w-32">
                Severity
              </th>
              <th scope="col" className="px-3.5 py-2.5 min-w-[280px]">
                Incident
              </th>
              <th scope="col" className="px-3.5 py-2.5">
                Service
              </th>
              <th scope="col" className="px-3.5 py-2.5">
                Status
              </th>
              <th scope="col" className="px-3.5 py-2.5">
                Assignee
              </th>
              <th scope="col" className="px-3.5 py-2.5 text-right whitespace-nowrap">
                Started
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#17181d]">
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => navigate(`/incidents/${incident.id}`)}
                className="hover:bg-[#121316] cursor-pointer transition-colors group"
              >
                {/* Severity */}
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <SeverityBadge severity={incident.severity} />
                </td>

                {/* Title & Description */}
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#ededed] group-hover:text-[#ffffff] transition-colors truncate max-w-md">
                      {incident.title}
                    </span>
                    {incident._count && incident._count.comments > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#71717a] font-mono shrink-0">
                        <MessageSquare className="w-3 h-3" />
                        {incident._count.comments}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#71717a] truncate max-w-md mt-0.5">
                    {incident.description}
                  </p>
                </td>

                {/* Service */}
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-[#15161a] text-[#d4d4d8] border border-[#22242a] text-[11px] font-mono">
                    {incident.service?.name}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <StatusBadge status={incident.status} />
                </td>

                {/* Assignee */}
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  {incident.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-[#1c1d22] border border-[#2b2d35] flex items-center justify-center text-[9px] font-bold text-[#ededed] font-mono shrink-0">
                        {incident.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-[#d4d4d8]">
                        {incident.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#71717a] italic flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-[#52525b]" /> Unassigned
                    </span>
                  )}
                </td>

                {/* Started Time */}
                <td className="px-3.5 py-2.5 text-right whitespace-nowrap font-mono text-[11px] text-[#71717a]">
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#52525b]" />
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
