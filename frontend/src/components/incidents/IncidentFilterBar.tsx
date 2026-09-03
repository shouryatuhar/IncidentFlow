import React from 'react';
import { Search, X, Filter } from 'lucide-react';
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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 mb-5 shadow-sm space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search incidents by title or description..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Severity Filter */}
      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        <select
          value={severity || ''}
          onChange={(e) => onSeverityChange(e.target.value ? (e.target.value as Severity) : undefined)}
          className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          <option value="">All Severities</option>
          <option value="SEV_1">SEV-1 Critical</option>
          <option value="SEV_2">SEV-2 Major</option>
          <option value="SEV_3">SEV-3 Minor</option>
          <option value="SEV_4">SEV-4 Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={status || ''}
          onChange={(e) => onStatusChange(e.target.value ? (e.target.value as IncidentStatus) : undefined)}
          className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          <option value="">All Statuses</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="IDENTIFIED">Identified</option>
          <option value="MONITORING">Monitoring</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        {/* Service Filter */}
        <select
          value={serviceId || ''}
          onChange={(e) => onServiceIdChange(e.target.value ? e.target.value : undefined)}
          className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all max-w-[170px] truncate"
        >
          <option value="">All Services</option>
          {services.map((svc) => (
            <option key={svc.id} value={svc.id}>
              {svc.name}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition-colors"
          >
            <Filter className="w-3.5 h-3.5" />
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
