import React, { useEffect } from 'react';
import { RotateCcw, X } from 'lucide-react';

interface ClearPageModalProps {
  isOpen: boolean;
  pageIndex: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ClearPageModal: React.FC<ClearPageModalProps> = ({
  isOpen,
  pageIndex,
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

  if (!isOpen) return null;

  return (
    <div
      id="clear-page-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        id="clear-page-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clear-modal-title"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <RotateCcw className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 id="clear-modal-title" className="text-base font-bold text-white tracking-tight">
              Clear Page {pageIndex + 1}?
            </h3>
            <p className="text-xs text-amber-300 font-medium">Reset page to blank</p>
          </div>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 mb-4 text-xs text-slate-300 leading-relaxed space-y-1.5">
          <p>
            This will empty all content currently on <strong className="text-white">Page {pageIndex + 1}</strong> and provide a fresh blank canvas.
          </p>
          <p className="text-slate-400 text-[11px]">
            Other pages in your document will not be affected.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            id="cancel-clear-page-btn"
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            id="confirm-clear-page-btn"
            type="button"
            onClick={onConfirm}
            className="py-2.5 px-4 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-semibold rounded-xl shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer text-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
