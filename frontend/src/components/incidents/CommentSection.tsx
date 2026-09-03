import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncidentComment } from '../../types';
import { incidentsApi } from '../../api/incidents';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { MessageSquare, Send } from 'lucide-react';

interface CommentSectionProps {
  incidentId: string;
  comments: IncidentComment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ incidentId, comments }) => {
  const [content, setContent] = useState('');
  const queryClient = useQueryClient();
  const { success, error } = useToast();

  const commentMutation = useMutation({
    mutationFn: (text: string) => incidentsApi.addComment(incidentId, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incident', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['comments', incidentId] });
      queryClient.invalidateQueries({ queryKey: ['timeline', incidentId] });
      setContent('');
      success('Comment added');
    },
    onError: (err: any) => {
      error(err.message || 'Failed to add comment');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    commentMutation.mutate(content.trim());
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-500 italic font-mono bg-slate-900/30 rounded-lg border border-dashed border-slate-800">
            No comments yet. Post an investigation update below.
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-900/70 border border-slate-800 rounded-lg p-3.5 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300 font-mono">
                    {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-semibold text-slate-200">
                    {comment.author?.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 bg-slate-800 rounded text-slate-400 border border-slate-700">
                    {comment.author?.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed pl-8">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="pt-2">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 focus-within:border-indigo-500/80 transition-colors">
          <textarea
            rows={3}
            placeholder="Add investigation findings, runbook steps taken, or RCA notes..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
            <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              Markdown supported
            </span>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={commentMutation.isPending}
              disabled={!content.trim()}
              rightIcon={<Send className="w-3.5 h-3.5" />}
            >
              Post Update
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
