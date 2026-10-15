import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';
import { Severity, IncidentStatus, Service } from '../../types';

interface IncidentFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  severity?: Severity;
  onSeverityChange: (val?: Severity) => void;
  status?: IncidentStatus;
  onStatusChange: (val?: IncidentStatus) => void;
  serviceId?: string;
  onServiceIdChange: (val?: string) => void;
  services: Service[];
  onReset: () => void;
}

export const IncidentFilterBar: React.FC<IncidentFilterBarProps> = ({
  search,
  onSearchChange,
  severity,
  onSeverityChange,
  status,
  onStatusChange,
  serviceId,
  onServiceIdChange,
  services,
  onReset,
}) => {
  const hasActiveFilters = Boolean(search || severity || status || serviceId);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px] max-w-md">
        <Search className="w-3.5 h-3.5 text-[#71717a] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter incidents by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-8 pl-8 pr-7 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#f4f4f5] placeholder-[#71717a] focus:outline-none transition-colors font-sans"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#f4f4f5]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Severity Filter */}
      <div className="relative">
        <select
          value={severity || ''}
          onChange={(e) => onSeverityChange(e.target.value ? (e.target.value as Severity) : undefined)}
          className="h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs font-mono text-[#d4d4d8] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Severities</option>
          <option value="SEV_1">SEV-1 Critical</option>
          <option value="SEV_2">SEV-2 Major</option>
          <option value="SEV_3">SEV-3 Minor</option>
          <option value="SEV_4">SEV-4 Low</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="relative">
        <select
          value={status || ''}
          onChange={(e) => onStatusChange(e.target.value ? (e.target.value as IncidentStatus) : undefined)}
          className="h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#d4d4d8] focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="IDENTIFIED">Identified</option>
          <option value="MONITORING">Monitoring</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Service Filter */}
      <div className="relative">
        <select
          value={serviceId || ''}
          onChange={(e) => onServiceIdChange(e.target.value ? e.target.value : undefined)}
          className="h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#d4d4d8] focus:outline-none transition-colors max-w-[160px] truncate cursor-pointer"
        >
          <option value="">All Services</option>
          {services.map((svc) => (
            <option key={svc.id} value={svc.id}>
              {svc.name}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onReset}
          className="h-8 flex items-center gap-1.5 px-2.5 text-xs text-[#a1a1aa] hover:text-[#f4f4f5] bg-[#15161a] hover:bg-[#1f2026] rounded-[5px] border border-[#26282f] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3 text-[#71717a]" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
