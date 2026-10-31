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
    <div className="bg-[#191d19] border border-[#30372f] rounded-[6px] p-3.5 hover:border-[#3c453a] transition-colors flex flex-col justify-between group">
      <div>
        {/* Top bar with Service Name and Status Badge */}
        <div className="flex items-start justify-between gap-2.5 mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-[4px] bg-[#252b25] border border-[#2e352d] text-[#818b7e] group-hover:text-[#dce1d8] transition-colors">
              <Server className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#dce1d8] tracking-tight">
                {service.name}
              </h3>
              <p className="text-[10px] font-mono text-[#818b7e]">
                {service.owner?.name || 'Platform Team'}
              </p>
            </div>
          </div>
          <ServiceStatusBadge status={service.status} />
        </div>

        {/* Description */}
        <p className="text-[11px] text-[#818b7e] line-clamp-2 my-2 leading-relaxed">
          {service.description}
        </p>
      </div>

      {/* Footer info & Admin controls */}
      <div className="pt-2.5 border-t border-[#30372f] flex items-center justify-between text-xs">
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
            <span className="text-[#667061] font-mono text-[10px]">
              {service.totalIncidents || 0} total incidents
            </span>
          )}
        </div>

        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 text-[#818b7e] hover:text-[#dce1d8]"
              onClick={() => onEdit(service)}
              title="Edit service"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 text-[#818b7e] hover:text-[#f87171]"
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
