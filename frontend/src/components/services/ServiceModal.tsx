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
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
            Service Name <span className="text-[#f87171]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Auth Gateway"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
            Description <span className="text-[#f87171]">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Brief overview of functionality, SLA tier, and dependencies..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors resize-none leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Current Health Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ServiceStatus)}
              className="w-full h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] focus:outline-none transition-colors cursor-pointer"
            >
              <option value="OPERATIONAL">Operational</option>
              <option value="DEGRADED">Degraded</option>
              <option value="DOWN">Down</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Owner / Lead Engineer
            </label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] focus:outline-none transition-colors cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-[#1f2127]">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={saveMutation.isPending}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={saveMutation.isPending}>
            {isEditing ? 'Save Changes' : 'Register Service'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
