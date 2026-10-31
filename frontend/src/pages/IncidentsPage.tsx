import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { incidentsApi } from '../api/incidents';
import { servicesApi } from '../api/services';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { IncidentFilterBar } from '../components/incidents/IncidentFilterBar';
import { Button } from '../components/common/Button';
import { Severity, IncidentStatus } from '../types';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { CreateIncidentModal } from '../components/incidents/CreateIncidentModal';

export const IncidentsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<Severity | undefined>(() => searchParams.get('severity') as Severity | undefined);
  const [status, setStatus] = useState<IncidentStatus | undefined>(() => searchParams.get('status') as IncidentStatus | undefined);
  const [serviceId, setServiceId] = useState<string | undefined>(() => searchParams.get('serviceId') || undefined);
  const [startDate, setStartDate] = useState<string | undefined>(() => searchParams.get('startDate') || undefined);
  const [endDate, setEndDate] = useState<string | undefined>(() => searchParams.get('endDate') || undefined);
  const [page, setPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch services for filter dropdown
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list(),
  });

  // Fetch incidents list with live backend query
  const { data, isLoading } = useQuery({
    queryKey: ['incidents', { search, severity, status, serviceId, startDate, endDate, page }],
    queryFn: () =>
      incidentsApi.list({
        search: search || undefined,
        severity,
        status,
        serviceId,
        startDate,
        endDate,
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
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
    setSearchParams({});
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleSeverityChange = (val?: Severity) => {
    setSeverity(val);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    val ? next.set('severity', val) : next.delete('severity');
    setSearchParams(next, { replace: true });
  };

  const handleStatusChange = (val?: IncidentStatus) => {
    setStatus(val);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    val ? next.set('status', val) : next.delete('status');
    setSearchParams(next, { replace: true });
  };

  const handleServiceChange = (val?: string) => {
    setServiceId(val);
    setPage(1);
    const next = new URLSearchParams(searchParams);
    val ? next.set('serviceId', val) : next.delete('serviceId');
    setSearchParams(next, { replace: true });
  };

  const incidents = data?.incidents || [];
  const pagination = data?.pagination || { total: 0, page: 1, limit: 15, totalPages: 1 };

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-base font-semibold text-[#e8ebe4] tracking-tight">
            Incidents
          </h1>
          <p className="text-xs text-[#818b7e] mt-0.5">
            Prioritize, assign, and coordinate engineering triage workflows
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="w-3.5 h-3.5 text-[#f87171]" />}
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

      <p className="text-xs text-[#818b7e]" aria-live="polite">
        {isLoading ? 'Loading incident records…' : `Showing ${incidents.length ? (pagination.page - 1) * (pagination.limit || 15) + 1 : 0}–${Math.min(pagination.page * (pagination.limit || 15), pagination.total)} of ${pagination.total} incidents`}
      </p>
      {(startDate || endDate) && (
        <div className="flex items-center gap-2 text-xs text-[#a5aea0]">
          <span>Date range: {startDate || 'any'} to {endDate || 'any'}</span>
          <button className="underline underline-offset-2" onClick={() => {
            setStartDate(undefined); setEndDate(undefined);
            const next = new URLSearchParams(searchParams); next.delete('startDate'); next.delete('endDate');
            setSearchParams(next, { replace: true }); setPage(1);
          }}>Clear</button>
        </div>
      )}

      {/* Incidents Table */}
      <IncidentTable
        incidents={incidents}
        isLoading={isLoading}
        onResetFilters={handleResetFilters}
      />

      {/* Pagination Bar */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-1 pt-2 text-xs text-[#818b7e]">
          <span>
            Page <span className="font-mono text-[#dce1d8]">{pagination.page}</span> of{' '}
            <span className="font-mono text-[#dce1d8]">{pagination.totalPages}</span>{' '}
            <span className="text-[#667061]">({pagination.total} total)</span>
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="w-3 h-3" />}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              rightIcon={<ChevronRight className="w-3 h-3" />}
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
