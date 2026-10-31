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
          <div className="text-center py-5 text-xs text-[#818b7e] font-mono bg-[#191d19] rounded-[5px] border border-[#30372f]">
            No investigation notes posted yet.
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#191d19] border border-[#30372f] rounded-[5px] p-3 space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#2a3029] border border-[#3b4439] flex items-center justify-center font-bold text-[9px] text-[#dce1d8] font-mono shrink-0">
                    {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-[#dce1d8]">
                    {comment.author?.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#818b7e]">
                    {comment.author?.role}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#818b7e]">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-xs text-[#c6cdc1] whitespace-pre-wrap leading-relaxed pl-6">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>

      {/* New Comment Input */}
      <form onSubmit={handleSubmit} className="pt-1">
        <div className="bg-[#191d19] border border-[#30372f] rounded-[5px] p-2.5 focus-within:border-[#a2aa83] transition-colors">
          <textarea
            rows={3}
            placeholder="Add investigation findings, runbook steps taken, or RCA notes..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-transparent text-xs text-[#dce1d8] placeholder-[#818b7e] focus:outline-none resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[#1a1b20]">
            <span className="text-[11px] text-[#818b7e] font-mono">
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
