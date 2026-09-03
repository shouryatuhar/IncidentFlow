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
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Incident Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Auth API 504 gateway timeout on login"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Severity & Affected Service row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Severity Level <span className="text-rose-400">*</span>
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
            >
              <option value="SEV_1">SEV-1 (Critical Outage)</option>
              <option value="SEV_2">SEV-2 (Major Impact)</option>
              <option value="SEV_3">SEV-3 (Minor / Degraded)</option>
              <option value="SEV_4">SEV-4 (Low / Cosmetic)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Affected Service <span className="text-rose-400">*</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Initial Assignee
          </label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Description & Impact <span className="text-rose-400">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Describe what symptoms are being observed, error rates, regions affected, and initial mitigation steps..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <Button variant="secondary" type="button" onClick={onClose} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            type="submit"
            isLoading={createMutation.isPending}
            leftIcon={<AlertCircle className="w-4 h-4" />}
          >
            Declare Incident
          </Button>
        </div>
      </form>
    </Modal>
  );
};
