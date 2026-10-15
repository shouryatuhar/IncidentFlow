import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { servicesApi } from '../../api/services';
import { usersApi } from '../../api/auth';
import { incidentsApi, CreateIncidentParams } from '../../api/incidents';
import { Severity } from '../../types';
import { useToast } from '../../context/ToastContext';
import { AlertCircle } from 'lucide-react';

interface CreateIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedServiceId?: string;
}

export const CreateIncidentModal: React.FC<CreateIncidentModalProps> = ({
  isOpen,
  onClose,
  preselectedServiceId,
}) => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('SEV_2');
  const [serviceId, setServiceId] = useState(preselectedServiceId || '');
  const [assigneeId, setAssigneeId] = useState<string>('');

  // Fetch available services
  const { data: services = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => servicesApi.list(),
    enabled: isOpen,
  });

  // Fetch users for assignment
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: isOpen,
  });

  // Set default service when services load
  React.useEffect(() => {
    if (!serviceId && services.length > 0) {
      setServiceId(preselectedServiceId || services[0].id);
    }
  }, [services, preselectedServiceId, serviceId]);

  const createMutation = useMutation({
    mutationFn: (data: CreateIncidentParams) => incidentsApi.create(data),
    onSuccess: (newIncident) => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      success(`Incident "${newIncident.title}" declared successfully`);
      resetForm();
      onClose();
    },
    onError: (err: any) => {
      error(err.message || 'Failed to create incident');
    },
  });

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSeverity('SEV_2');
    setAssigneeId('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !serviceId) {
      error('Please fill in all required fields');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      severity,
      serviceId,
      assigneeId: assigneeId ? assigneeId : null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Declare Production Incident"
      subtitle="Report an outage, degradation, or operational anomaly"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Title */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
            Incident Title <span className="text-[#f87171]">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Auth API 504 gateway timeout on login"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors"
          />
        </div>

        {/* Severity & Affected Service row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Severity Level <span className="text-[#f87171]">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] focus:outline-none transition-colors font-mono cursor-pointer"
            >
              <option value="SEV_1">SEV-1 (Critical Outage)</option>
              <option value="SEV_2">SEV-2 (Major Impact)</option>
              <option value="SEV_3">SEV-3 (Minor / Degraded)</option>
              <option value="SEV_4">SEV-4 (Low / Cosmetic)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
              Affected Service <span className="text-[#f87171]">*</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] focus:outline-none transition-colors cursor-pointer"
              required
            >
              {services.map((svc) => (
                <option key={svc.id} value={svc.id}>
                  {svc.name} ({svc.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
            Initial Assignee
          </label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full h-8 px-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] focus:outline-none transition-colors cursor-pointer"
          >
            <option value="">-- Unassigned --</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[#71717a] mb-1">
            Description & Impact <span className="text-[#f87171]">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Describe what symptoms are being observed, error rates, regions affected, and initial mitigation steps..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2.5 bg-[#0d0e11] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[5px] text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none transition-colors resize-none leading-relaxed"
          />
        </div>

        {/* Modal Actions */}
        <div className="mt-4 flex items-center justify-end gap-2 pt-3 border-t border-[#1f2127]">
          <Button variant="secondary" size="sm" type="button" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            type="submit"
            isLoading={createMutation.isPending}
            leftIcon={<AlertCircle className="w-3.5 h-3.5" />}
          >
            Declare Incident
          </Button>
        </div>
      </form>
    </Modal>
  );
};
