import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        ref={modalRef}
        className={`relative z-10 w-full ${maxWidthStyles} bg-[#111215] border border-[#26282f] rounded-[6px] shadow-modal overflow-hidden flex flex-col max-h-[90vh]`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#1f2127] flex items-center justify-between bg-[#111215]">
          <div>
            <h3 className="text-[13px] font-semibold text-[#f4f4f5] tracking-tight">{title}</h3>
            {subtitle && <p className="text-[11px] text-[#71717a] mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[4px] text-[#71717a] hover:text-[#f4f4f5] hover:bg-[#18191e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
