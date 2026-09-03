import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { servicesApi, CreateServiceParams, UpdateServiceParams } from '../../api/services';
import { usersApi } from '../../api/auth';
import { Service, ServiceStatus } from '../../types';
import { useToast } from '../../context/ToastContext';

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceToEdit?: Service | null;
}

export const ServiceModal: React.FC<ServiceModalProps> = ({
  isOpen,
  onClose,
  serviceToEdit,
}) => {
  const isEditing = Boolean(serviceToEdit);
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ServiceStatus>('OPERATIONAL');
  const [ownerId, setOwnerId] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: isOpen,
  });

  useEffect(() => {
    if (serviceToEdit) {
      setName(serviceToEdit.name);
      setDescription(serviceToEdit.description);
      setStatus(serviceToEdit.status);
      setOwnerId(serviceToEdit.ownerId);
    } else {
      setName('');
      setDescription('');
      setStatus('OPERATIONAL');
      setOwnerId(users[0]?.id || '');
    }
  }, [serviceToEdit, isOpen, users]);

  const saveMutation = useMutation({
    mutationFn: (payload: CreateServiceParams | UpdateServiceParams) => {
      if (isEditing && serviceToEdit) {
        return servicesApi.update(serviceToEdit.id, payload);
      }
      return servicesApi.create(payload as CreateServiceParams);
    },
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success(
        isEditing
          ? `Service "${saved.name}" updated successfully`
          : `Service "${saved.name}" registered successfully`
      );
      onClose();
    },
    onError: (err: any) => {
      error(err.message || 'Failed to save service');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      error('Service name and description are required');
      return;
    }

    saveMutation.mutate({
      name: name.trim(),
      description: description.trim(),
      status,
      ownerId: ownerId || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Service: ${serviceToEdit?.name}` : 'Register New Microservice'}
      subtitle={
        isEditing
          ? 'Update system health state or operational description'
          : 'Add a new production component to the monitoring registry'
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Service Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Payment Gateway API"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Service Status <span className="text-rose-400">*</span>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ServiceStatus)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            >
              <option value="OPERATIONAL">Operational</option>
              <option value="DEGRADED">Degraded</option>
              <option value="DOWN">Down / Outage</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Service Owner
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Default Admin</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Description <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Brief overview of component architecture, repository, and SLA..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" isLoading={saveMutation.isPending}>
            {isEditing ? 'Save Changes' : 'Register Service'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
