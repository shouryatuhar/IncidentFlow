import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="flex gap-3 items-start">
        {isDangerous && (
          <div className="p-1.5 rounded-[4px] bg-rose-500/10 text-[#f87171] shrink-0 mt-0.5 border border-rose-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
        <div className="flex-1">
          <p className="text-xs text-[#a1a1aa] leading-relaxed">{message}</p>
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2 pt-3 border-t border-[#1f2127]">
        <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button
          variant={isDangerous ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
