import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { servicesApi } from '../api/services';
import { ServiceCard } from '../components/services/ServiceCard';
import { ServiceModal } from '../components/services/ServiceModal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Button } from '../components/common/Button';
import { LoadingSpinner, EmptyState } from '../components/common/LoadingAndEmpty';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Service } from '../types';
import { Plus, Server, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight font-mono">
            Service Catalog & Health
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Registered microservices, infrastructure systems, and operational statuses
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleCreate}
          >
            Register Service
          </Button>
        )}
      </div>

      {/* Health Overview Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Operational
              </span>
              <p className="text-xl font-bold text-white font-mono">{operationalCount}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {services.length > 0 ? Math.round((operationalCount / services.length) * 100) : 100}% Healthy
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Degraded
              </span>
              <p className="text-xl font-bold text-white font-mono">{degradedCount}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {degradedCount} Affected
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Outage / Down
              </span>
              <p className="text-xl font-bold text-white font-mono">{downCount}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            {downCount} Critical
          </span>
        </div>
      </div>

      {/* Services Grid */}
      {isLoading ? (
        <LoadingSpinner message="Querying microservices registry..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services registered"
          description="Register your first service to track production components and link incidents."
          icon={<Server className="w-8 h-8 text-slate-500" />}
          action={
            isAdmin && (
              <Button size="sm" onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
                Register Service
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={(svc) => setServiceToDelete(svc)}
              onViewIncidents={handleViewIncidents}
            />
          ))}
        </div>
      )}

      {/* Create / Edit Service Modal */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        serviceToEdit={selectedService}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(serviceToDelete)}
        onClose={() => setServiceToDelete(null)}
        onConfirm={() => serviceToDelete && deleteMutation.mutate(serviceToDelete.id)}
        title="Delete Service"
        message={`Are you sure you want to delete "${serviceToDelete?.name}"? All associated incident records and historical data will be permanently removed.`}
        confirmText="Delete Service"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
