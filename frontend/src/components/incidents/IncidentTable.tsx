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
      <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-8">
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
              className="text-xs font-medium text-[#dce1d8] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#a5aea0]">
          <thead className="bg-[#191d19] border-b border-[#30372f] text-[11px] font-medium text-[#818b7e] uppercase tracking-wider font-mono">
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
          <tbody className="divide-y divide-[#252b24]">
            {incidents.map((incident) => (
              <tr
                key={incident.id}
                onClick={() => navigate(`/incidents/${incident.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    navigate(`/incidents/${incident.id}`);
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={`Open ${incident.title}, ${incident.severity.replace('_', '-')}, ${incident.status.toLowerCase()}`}
                className="hover:bg-[#202520] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#a2aa83] cursor-pointer transition-colors group"
              >
                {/* Severity */}
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <SeverityBadge severity={incident.severity} />
                </td>

                {/* Title & Description */}
                <td className="px-3.5 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[#dce1d8] group-hover:text-[#ffffff] transition-colors truncate max-w-md">
                      {incident.title}
                    </span>
                    {incident._count && incident._count.comments > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#818b7e] font-mono shrink-0">
                        <MessageSquare className="w-3 h-3" />
                        {incident._count.comments}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#818b7e] truncate max-w-md mt-0.5">
                    {incident.description}
                  </p>
                </td>

                {/* Service */}
                <td className="px-3.5 py-2.5 whitespace-nowrap">
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-[4px] bg-[#252b25] text-[#c6cdc1] border border-[#2e352d] text-[11px] font-mono">
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
                      <div className="w-4 h-4 rounded-full bg-[#2a3029] border border-[#3b4439] flex items-center justify-center text-[9px] font-bold text-[#dce1d8] font-mono shrink-0">
                        {incident.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs text-[#c6cdc1]">
                        {incident.assignee.name}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-[#818b7e] italic flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-[#667061]" /> Unassigned
                    </span>
                  )}
                </td>

                {/* Started Time */}
                <td className="px-3.5 py-2.5 text-right whitespace-nowrap font-mono text-[11px] text-[#818b7e]">
                  <div className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#667061]" />
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
