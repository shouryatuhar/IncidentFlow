import React from 'react';
import { Service } from '../../types';
import { ServiceStatusBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { Server, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  isAdmin: boolean;
  onEdit: (service: Service) => void;
  onDelete: (service: Service) => void;
  onViewIncidents?: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  isAdmin,
  onEdit,
  onDelete,
  onViewIncidents,
}) => {
  const hasActiveIncidents = (service.activeIncidentsCount || 0) > 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between group">
      <div>
        {/* Top bar with Service Name and Status Badge */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 group-hover:text-indigo-400 transition-colors">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                {service.name}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Owner: {service.owner?.name || 'Platform Team'}
              </p>
            </div>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 my-3 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Footer info & Admin controls */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <div>
          {hasActiveIncidents ? (
            <button
              onClick={() => onViewIncidents?.(service.id)}
              className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-mono text-xs font-semibold cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5 animate-pulse" />
              {service.activeIncidentsCount} active incident{service.activeIncidentsCount! > 1 ? 's' : ''}
            </button>
          ) : (
            <span className="text-slate-500 font-mono text-[11px]">
              {service.totalIncidents || 0} total incidents
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-7 text-slate-400 hover:text-white"
              onClick={() => onEdit(service)}
              title="Edit service"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-7 text-slate-400 hover:text-rose-400"
              onClick={() => onDelete(service)}
              title="Delete service"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
