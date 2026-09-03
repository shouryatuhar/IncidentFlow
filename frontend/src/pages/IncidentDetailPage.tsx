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
        <p className="text-slate-400">Incident not found.</p>
        <Link to="/incidents" className="text-indigo-400 text-sm mt-2 inline-block">
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
    if (diffMins < 60) return `${diffMins} minutes`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Back Link & Action Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/incidents"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Incidents
        </Link>

        <div className="flex items-center gap-2">
          {incident.status !== 'RESOLVED' && (
            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
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
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Incident Card Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-5">
        {/* Title area */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {isEditingDetails ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-lg font-bold bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-white"
                />
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-sm bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 resize-none"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveEdit}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsEditingDetails(false)}
                    leftIcon={<X className="w-3.5 h-3.5" />}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                  <span className="text-xs font-mono text-slate-500">
                    ID: {incident.id.slice(0, 8)}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  {incident.title}
                  <button
                    onClick={handleStartEdit}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    title="Edit incident details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </h1>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                  {incident.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Attribute Toggles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          {/* Status Changer */}
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
              Triage Status
            </span>
            <select
              value={incident.status}
              onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-medium focus:ring-1 focus:ring-indigo-500"
            >
              <option value="INVESTIGATING">Investigating</option>
              <option value="IDENTIFIED">Identified</option>
              <option value="MONITORING">Monitoring</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>

          {/* Severity Changer */}
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
              Severity Level
            </span>
            <select
              value={incident.severity}
              onChange={(e) => handleSeverityChange(e.target.value as Severity)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono focus:ring-1 focus:ring-indigo-500"
            >
              <option value="SEV_1">SEV-1 (Critical)</option>
              <option value="SEV_2">SEV-2 (Major)</option>
              <option value="SEV_3">SEV-3 (Minor)</option>
              <option value="SEV_4">SEV-4 (Low)</option>
            </select>
          </div>

          {/* Assignee Changer */}
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
              Assigned Engineer
            </span>
            <select
              value={incident.assigneeId || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 focus:ring-1 focus:ring-indigo-500"
            >
              <option value="">-- Unassigned --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Affected Service */}
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block text-[10px]">
              Affected Service
            </span>
            <div className="flex items-center gap-1.5 py-1.5 text-slate-200 font-medium">
              <Server className="w-3.5 h-3.5 text-slate-400" />
              <span>{incident.service?.name}</span>
            </div>
          </div>
        </div>

        {/* Metadata Details Row */}
        <div className="flex items-center gap-6 pt-3 border-t border-slate-800/80 text-xs text-slate-400 flex-wrap font-mono">
          <div className="flex items-center gap-1.5">
            <UserIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Reporter: {incident.reporter?.name}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Started: {formatDate(incident.startedAt)}</span>
          </div>

          {incident.resolvedAt && (
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved: {formatDate(incident.resolvedAt)}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Duration: {calculateDuration()}</span>
          </div>
        </div>
      </div>

      {/* Investigation Workspace: Tabs for Timeline & Comments */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        {/* Tab Headers */}
        <div className="flex items-center gap-6 border-b border-slate-800 pb-3 mb-5">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 text-sm font-semibold pb-1 transition-all border-b-2 cursor-pointer ${
              activeTab === 'timeline'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Database Timeline ({incident.timeline?.length || 0})
          </button>

          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center gap-2 text-sm font-semibold pb-1 transition-all border-b-2 cursor-pointer ${
              activeTab === 'comments'
                ? 'border-indigo-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Comments & Investigation ({incident.comments?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'timeline' ? (
          <TimelineView events={incident.timeline || []} />
        ) : (
          <CommentSection
            incidentId={incident.id}
            comments={incident.comments || []}
          />
        )}
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
