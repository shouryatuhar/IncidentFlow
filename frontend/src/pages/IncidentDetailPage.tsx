import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi, UpdateIncidentParams } from '../api/incidents';
import { usersApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { SeverityBadge, StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TimelineView } from '../components/incidents/TimelineView';
import { CommentSection } from '../components/incidents/CommentSection';
import { LoadingSpinner } from '../components/common/LoadingAndEmpty';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Severity, IncidentStatus } from '../types';
import {
  ArrowLeft,
  Clock,
  User as UserIcon,
  Server,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  Check,
  X,
  History,
  MessageSquare,
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'timeline' | 'comments'>('timeline');
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch Incident Details
  const { data: incident, isLoading } = useQuery({
    queryKey: ['incident', id],
    queryFn: () => incidentsApi.getById(id!),
    enabled: Boolean(id),
  });

  // Fetch users for assignee dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  });

  // Incident Update Mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateIncidentParams) => incidentsApi.update(id!, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['incident', id], updated);
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['timeline', id] });
      success('Incident updated successfully');
      setIsEditingDetails(false);
    },
    onError: (err: any) => {
      error(err.message || 'Failed to update incident');
    },
  });

  // Delete Mutation (ADMIN only)
  const deleteMutation = useMutation({
    mutationFn: () => incidentsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      success('Incident removed from platform');
      navigate('/incidents');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to delete incident');
    },
  });

  if (isLoading) {
    return <LoadingSpinner message="Loading incident investigation file..." />;
  }

  if (!incident) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-[#71717a] font-mono">Incident not found.</p>
        <Link to="/incidents" className="text-xs text-[#ededed] hover:underline mt-2 inline-block">
          Return to Incidents list
        </Link>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditTitle(incident.title);
    setEditDescription(incident.description);
    setIsEditingDetails(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim() || !editDescription.trim()) {
      error('Title and description cannot be blank');
      return;
    }
    updateMutation.mutate({
      title: editTitle.trim(),
      description: editDescription.trim(),
    });
  };

  const handleStatusChange = (newStatus: IncidentStatus) => {
    updateMutation.mutate({ status: newStatus });
  };

  const handleSeverityChange = (newSeverity: Severity) => {
    updateMutation.mutate({ severity: newSeverity });
  };

  const handleAssigneeChange = (assigneeId: string) => {
    updateMutation.mutate({ assigneeId: assigneeId ? assigneeId : null });
  };

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const calculateDuration = () => {
    if (!incident.startedAt) return null;
    const start = new Date(incident.startedAt).getTime();
    const end = incident.resolvedAt
      ? new Date(incident.resolvedAt).getTime()
      : Date.now();
    const diffMins = Math.round((end - start) / (1000 * 60));
    if (diffMins < 60) return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      {/* Back Link & Action Bar */}
      <div className="flex items-center justify-between pb-1">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#f4f4f5] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Incidents
        </Link>

        <div className="flex items-center gap-2">
          {incident.status !== 'RESOLVED' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              onClick={() => handleStatusChange('RESOLVED')}
              isLoading={updateMutation.isPending}
            >
              Resolve Incident
            </Button>
          )}

          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3 h-3" />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Left Column: Title, Description, and Activity Feed (66%) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Header & Description Card */}
          <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-4 space-y-3">
            {isEditingDetails ? (
              <div className="space-y-2.5">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-sm font-semibold bg-[#08090a] border border-[#26282f] focus:border-[#5e6ad2] rounded-[5px] px-2.5 py-1.5 text-[#f4f4f5] focus:outline-none"
                />
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs bg-[#08090a] border border-[#26282f] focus:border-[#5e6ad2] rounded-[5px] px-2.5 py-1.5 text-[#d4d4d8] focus:outline-none resize-none leading-relaxed"
                />
                <div className="flex items-center gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveEdit}
                    leftIcon={<Check className="w-3 h-3" />}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditingDetails(false)}
                    leftIcon={<X className="w-3 h-3" />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                  <span className="text-[11px] font-mono text-[#71717a]">
                    ID: {incident.id.slice(0, 8)}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-base font-semibold text-[#f4f4f5] tracking-tight leading-snug">
                    {incident.title}
                  </h1>
                  <button
                    onClick={handleStartEdit}
                    className="text-[#71717a] hover:text-[#ededed] p-1 rounded hover:bg-[#15161a] transition-colors shrink-0"
                    title="Edit incident details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-[#a1a1aa] mt-2 leading-relaxed whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>
            )}
          </div>

          {/* Activity / Investigation Workspace */}
          <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-4">
            {/* Tabs */}
            <div className="flex items-center gap-4 border-b border-[#1f2127] pb-2.5 mb-4">
              <button
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-1.5 text-xs font-medium pb-1 transition-colors cursor-pointer border-b ${
                  activeTab === 'timeline'
                    ? 'border-[#5e6ad2] text-[#f4f4f5]'
                    : 'border-transparent text-[#71717a] hover:text-[#d4d4d8]'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Timeline</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#15161a] text-[#71717a] border border-[#22242a]">
                  {incident.timeline?.length || 0}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`flex items-center gap-1.5 text-xs font-medium pb-1 transition-colors cursor-pointer border-b ${
                  activeTab === 'comments'
                    ? 'border-[#5e6ad2] text-[#f4f4f5]'
                    : 'border-transparent text-[#71717a] hover:text-[#d4d4d8]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Comments</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-[#15161a] text-[#71717a] border border-[#22242a]">
                  {incident.comments?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab Body */}
            {activeTab === 'timeline' ? (
              <TimelineView events={incident.timeline || []} />
            ) : (
              <CommentSection
                incidentId={incident.id}
                comments={incident.comments || []}
              />
            )}
          </div>
        </div>

        {/* Right Column: Compact Metadata Inspector (33%) */}
        <div className="space-y-4">
          <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[6px] p-3.5 space-y-3 text-xs">
            <div className="border-b border-[#1f2127] pb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider text-[#71717a]">
                Incident Properties
              </span>
            </div>

            {/* Status Control */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#71717a] block">Status</span>
              <select
                value={incident.status}
                onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
                className="w-full h-7 px-2 bg-[#08090a] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[4px] text-xs text-[#ededed] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="INVESTIGATING">Investigating</option>
                <option value="IDENTIFIED">Identified</option>
                <option value="MONITORING">Monitoring</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>

            {/* Severity Control */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#71717a] block">Severity</span>
              <select
                value={incident.severity}
                onChange={(e) => handleSeverityChange(e.target.value as Severity)}
                className="w-full h-7 px-2 bg-[#08090a] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[4px] text-xs font-mono text-[#ededed] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="SEV_1">SEV-1 (Critical)</option>
                <option value="SEV_2">SEV-2 (Major)</option>
                <option value="SEV_3">SEV-3 (Minor)</option>
                <option value="SEV_4">SEV-4 (Low)</option>
              </select>
            </div>

            {/* Assignee Control */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#71717a] block">Assignee</span>
              <select
                value={incident.assigneeId || ''}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full h-7 px-2 bg-[#08090a] border border-[#1f2127] hover:border-[#2a2c34] focus:border-[#5e6ad2] rounded-[4px] text-xs text-[#ededed] focus:outline-none transition-colors cursor-pointer"
              >
                <option value="">-- Unassigned --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service */}
            <div className="pt-2 border-t border-[#1f2127] space-y-1">
              <span className="text-[11px] text-[#71717a] block">Affected Service</span>
              <div className="flex items-center gap-1.5 text-xs text-[#ededed]">
                <Server className="w-3.5 h-3.5 text-[#71717a]" />
                <span className="font-mono text-[11px]">{incident.service?.name}</span>
              </div>
            </div>

            {/* Reporter */}
            <div className="pt-2 border-t border-[#1f2127] space-y-1">
              <span className="text-[11px] text-[#71717a] block">Reporter</span>
              <div className="flex items-center gap-1.5 text-xs text-[#a1a1aa]">
                <UserIcon className="w-3.5 h-3.5 text-[#71717a]" />
                <span>{incident.reporter?.name}</span>
              </div>
            </div>

            {/* Started At */}
            <div className="pt-2 border-t border-[#1f2127] space-y-1">
              <span className="text-[11px] text-[#71717a] block">Started At</span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#a1a1aa]">
                <Calendar className="w-3.5 h-3.5 text-[#71717a]" />
                <span>{formatDate(incident.startedAt)}</span>
              </div>
            </div>

            {/* Resolved At */}
            {incident.resolvedAt && (
              <div className="pt-2 border-t border-[#1f2127] space-y-1">
                <span className="text-[11px] text-[#71717a] block">Resolved At</span>
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#34d399]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{formatDate(incident.resolvedAt)}</span>
                </div>
              </div>
            )}

            {/* Duration / MTTR */}
            <div className="pt-2 border-t border-[#1f2127] space-y-1">
              <span className="text-[11px] text-[#71717a] block">Duration</span>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#ededed]">
                <Clock className="w-3.5 h-3.5 text-[#71717a]" />
                <span>{calculateDuration()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete Incident Record"
        message={`Are you sure you want to permanently delete "${incident.title}"? This action cannot be undone and will delete all associated timeline events and comments.`}
        confirmText="Delete Incident"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};
