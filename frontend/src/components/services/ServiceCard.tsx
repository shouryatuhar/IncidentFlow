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
    <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-3.5 hover:border-[#2a2c34] transition-colors flex flex-col justify-between group">
      <div>
        {/* Top bar with Service Name and Status Badge */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-[4px] bg-[#15161a] border border-[#22242a] text-[#71717a] group-hover:text-[#ededed] transition-colors">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#ededed] tracking-tight">
                {service.name}
              </h3>
              <p className="text-[10px] font-mono text-[#71717a]">
                {service.owner?.name || 'Platform Team'}
              </p>
            </div>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>

        {/* Description */}
        <p className="text-[11px] text-[#71717a] line-clamp-2 my-2 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Footer info & Admin controls */}
      <div className="pt-2.5 border-t border-[#1f2127] flex items-center justify-between text-xs">
        <div>
          {hasActiveIncidents ? (
            <button
              onClick={() => onViewIncidents?.(service.id)}
              className="inline-flex items-center gap-1 text-[#f87171] hover:underline font-mono text-[11px] cursor-pointer"
            >
              <AlertCircle className="w-3 h-3" />
              {service.activeIncidentsCount} active incident{service.activeIncidentsCount! > 1 ? 's' : ''}
            </button>
          ) : (
            <span className="text-[#52525b] font-mono text-[10px]">
              {service.totalIncidents || 0} total incidents
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 text-[#71717a] hover:text-[#ededed]"
              onClick={() => onEdit(service)}
              title="Edit service"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 text-[#71717a] hover:text-[#f87171]"
              onClick={() => onDelete(service)}
              title="Delete service"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
