import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IncidentComment } from '../../types';
import { incidentsApi } from '../../api/incidents';
import { Button } from '../common/Button';
import { useToast } from '../../context/ToastContext';
import { Send } from 'lucide-react';

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
    <div className="space-y-3">
      {/* Comments List */}
      <div className="space-y-2.5">
        {comments.length === 0 ? (
          <div className="text-center py-5 text-xs text-[#71717a] font-mono bg-[#0d0e11] rounded-[5px] border border-[#1f2127]">
            No investigation notes posted yet.
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#0d0e11] border border-[#1f2127] rounded-[5px] p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#1c1d22] border border-[#2b2d35] flex items-center justify-center font-bold text-[9px] text-[#ededed] font-mono shrink-0">
                    {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-[#ededed]">
                    {comment.author?.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#71717a]">
                    {comment.author?.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#71717a]">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-xs text-[#d4d4d8] whitespace-pre-wrap leading-relaxed pl-6">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="pt-1">
        <div className="bg-[#0d0e11] border border-[#1f2127] rounded-[5px] p-2.5 focus-within:border-[#5e6ad2] transition-colors">
          <textarea
            rows={3}
            placeholder="Add investigation findings, runbook steps taken, or RCA notes..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-xs text-[#ededed] placeholder-[#71717a] focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[#1a1b20]">
            <span className="text-[11px] text-[#71717a] font-mono">
              Markdown enabled
            </span>
            <Button
              type="submit"
              size="sm"
              variant="primary"
              isLoading={commentMutation.isPending}
              disabled={!content.trim()}
              rightIcon={<Send className="w-3 h-3" />}
            >
              Post Update
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
