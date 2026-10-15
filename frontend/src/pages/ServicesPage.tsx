import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { servicesApi } from '../api/services';
import { ServiceModal } from '../components/services/ServiceModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/common/Button';
import { LoadingSpinner, EmptyState } from '../components/common/LoadingAndEmpty';
import { ServiceStatusBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Service } from '../types';
import { Plus, Server, Edit2, Trash2, AlertCircle } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success(`Service deleted successfully`);
      setServiceToDelete(null);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete service');
    },
  });

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleViewIncidents = (serviceId: string) => {
    navigate(`/incidents?serviceId=${serviceId}`);
  };

  // Status breakdown numbers
  const operationalCount = services.filter((s) => s.status === 'OPERATIONAL').length;
  const degradedCount = services.filter((s) => s.status === 'DEGRADED').length;
  const downCount = services.filter((s) => s.status === 'DOWN').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-base font-semibold text-[#f4f4f5] tracking-tight">
            Service Catalog & Health
          </h1>
          <p className="text-xs text-[#71717a] mt-0.5">
            Registered microservices, infrastructure components, and operational statuses
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#5e6ad2]" />}
            onClick={handleCreate}
          >
            Register Service
          </Button>
        )}
      </div>

      {/* Health Overview Strip */}
      <div className="grid grid-cols-3 bg-[#0d0e11] border border-[#1f2127] rounded-[6px] divide-x divide-[#1f2127]">
        <div className="p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
            Operational
          </div>
          <p className="text-lg font-semibold text-[#f4f4f5] font-mono mt-1">
            {operationalCount}
          </p>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" />
            Degraded
          </div>
          <p className="text-lg font-semibold text-[#f4f4f5] font-mono mt-1">
            {degradedCount}
          </p>
        </div>

        <div className="p-3">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" />
            Down
          </div>
          <p className="text-lg font-semibold text-[#f4f4f5] font-mono mt-1">
            {downCount}
          </p>
        </div>
      </div>

      {/* Services Table */}
      {isLoading ? (
        <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-8">
          <LoadingSpinner message="Loading registered service inventory..." />
        </div>
      ) : services.length === 0 ? (
        <EmptyState
          title="No services registered"
          description="Register your first microservice or system component to track operational uptime and link alerts."
          action={
            isAdmin && (
              <Button size="sm" variant="primary" onClick={handleCreate}>
                Register First Service
              </Button>
            )
          }
        />
      ) : (
        <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#a1a1aa]">
              <thead className="bg-[#0d0e11] border-b border-[#1f2127] text-[11px] font-medium text-[#71717a] uppercase tracking-wider font-mono">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5">
                    Service
                  </th>
                  <th scope="col" className="px-3.5 py-2.5 w-32">
                    Health Status
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Owner
                  </th>
                  <th scope="col" className="px-3.5 py-2.5">
                    Active Outages
                  </th>
                  {isAdmin && (
                    <th scope="col" className="px-3.5 py-2.5 text-right w-24">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#17181d]">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-[#121316] transition-colors group">
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-[4px] bg-[#15161a] border border-[#22242a] text-[#71717a] shrink-0">
                          <Server className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-medium text-[#ededed] block">
                            {svc.name}
                          </span>
                          <span className="text-[11px] text-[#71717a] line-clamp-1 max-w-sm">
                            {svc.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      <ServiceStatusBadge status={svc.status} />
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap text-xs text-[#d4d4d8]">
                      {svc.owner?.name || <span className="text-[#71717a] italic">Platform Team</span>}
                    </td>

                    <td className="px-3.5 py-2.5 whitespace-nowrap">
                      {(svc.activeIncidentsCount || 0) > 0 ? (
                        <button
                          onClick={() => handleViewIncidents(svc.id)}
                          className="inline-flex items-center gap-1 text-[#f87171] hover:underline font-mono text-xs cursor-pointer"
                        >
                          <AlertCircle className="w-3 h-3" />
                          {svc.activeIncidentsCount} active
                        </button>
                      ) : (
                        <span className="text-[#71717a] font-mono text-[11px]">
                          0 active
                        </span>
                      )}
                    </td>

                    {isAdmin && (
                      <td className="px-3.5 py-2.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 text-[#71717a] hover:text-[#ededed]"
                            onClick={() => handleEdit(svc)}
                            title="Edit service"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 text-[#71717a] hover:text-[#f87171]"
                            onClick={() => setServiceToDelete(svc)}
                            title="Delete service"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceToEdit={selectedService}
      />

      {/* Confirm Service Deletion Modal */}
      <ConfirmModal
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={() => serviceToDelete && deleteMutation.mutate(serviceToDelete.id)}
        title="Delete Microservice"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? Deleting a service will remove it from the catalog.`}
        confirmText="Delete Service"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
