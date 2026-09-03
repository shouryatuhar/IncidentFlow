import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { incidentsApi } from '../api/incidents';
import { servicesApi } from '../api/services';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { IncidentFilterBar } from '../components/incidents/IncidentFilterBar';
import { Button } from '../components/common/Button';
import { Severity, IncidentStatus } from '../types';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CreateIncidentModal } from '../components/incidents/CreateIncidentModal';

export const IncidentsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<Severity | undefined>();
  const [status, setStatus] = useState<IncidentStatus | undefined>();
  const [serviceId, setServiceId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch services for filter dropdown
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list(),
  });

  // Fetch incidents list with live backend query
  const { data, isLoading } = useQuery({
    queryKey: ['incidents', { search, severity, status, serviceId, page }],
    queryFn: () =>
      incidentsApi.list({
        search: search || undefined,
        severity,
        status,
        serviceId,
        page,
        limit: 15,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
  });

  const handleResetFilters = () => {
    setSearch('');
    setSeverity(undefined);
    setStatus(undefined);
    setServiceId(undefined);
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleSeverityChange = (val?: Severity) => {
    setSeverity(val);
    setPage(1);
  };

  const handleStatusChange = (val?: IncidentStatus) => {
    setStatus(val);
    setPage(1);
  };

  const handleServiceChange = (val?: string) => {
    setServiceId(val);
    setPage(1);
  };

  const incidents = data?.incidents || [];
  const pagination = data?.pagination || { total: 0, page: 1, totalPages: 1 };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">
            Incidents Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor, prioritize, assign, and coordinate engineering triage workflows
          </p>
        </div>
        <Button
          variant="danger"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Declare Incident
        </Button>
      </div>

      {/* Filter Toolbar */}
      <IncidentFilterBar
        search={search}
        onSearchChange={handleSearchChange}
        severity={severity}
        onSeverityChange={handleSeverityChange}
        status={status}
        onStatusChange={handleStatusChange}
        serviceId={serviceId}
        onServiceIdChange={handleServiceChange}
        services={services}
        onReset={handleResetFilters}
      />

      {/* Incidents Table */}
      <IncidentTable
        incidents={incidents}
        isLoading={isLoading}
        onResetFilters={handleResetFilters}
      />

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-2 pt-2 text-xs text-slate-400">
          <span>
            Showing page <span className="font-semibold text-slate-200">{pagination.page}</span> of{' '}
            <span className="font-semibold text-slate-200">{pagination.totalPages}</span> (
            {pagination.total} total incidents)
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Declare Incident Modal */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
