import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeletePageModalProps {
  isOpen: boolean;
  pageIndex: number | null;
  totalPages: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeletePageModal: React.FC<DeletePageModalProps> = ({
  isOpen,
  pageIndex,
  totalPages,
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || pageIndex === null) return null;

  const pageNumber = pageIndex + 1;

  return (
    <div
      id="delete-page-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        id="delete-page-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
        className="bg-slate-900 border border-slate-750 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-left border-rose-900/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close cross */}
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Badge */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 id="delete-modal-title" className="text-base font-bold text-white tracking-tight">
              Delete Page {pageNumber}?
            </h3>
            <p className="text-xs text-rose-300 font-medium">Permanent page removal</p>
          </div>
        </div>

        {/* Informative text */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4 text-xs text-slate-300 leading-relaxed space-y-1.5">
          <p>
            Are you sure you want to remove <strong className="text-white">Page {pageNumber}</strong> from this document?
          </p>
          <p className="text-slate-400 text-[11px]">
            All text, headings, and images placed on Page {pageNumber} will be erased. The document will have{' '}
            <span className="text-sky-300 font-semibold">{Math.max(1, totalPages - 1)} {totalPages - 1 === 1 ? 'page' : 'pages'}</span> remaining.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="cancel-delete-page-btn"
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-page-btn"
            type="button"
            onClick={onConfirm}
            className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
