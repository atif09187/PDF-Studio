import React, { useEffect } from 'react';
import { Sparkles, Infinity as InfinityIcon, ShieldCheck, CheckCircle2, Zap, X, FileText } from 'lucide-react';

interface LifetimeModalProps {
  isOpen: boolean;
  exportCount: number;
  onClose: () => void;
}

export const LifetimeModal: React.FC<LifetimeModalProps> = ({
  isOpen,
  exportCount,
  onClose,
}) => {
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

  return (
    <div
      id="lifetime-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="lifetime-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lifetime-modal-title"
        className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-5 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 shrink-0">
            <InfinityIcon className="w-6 h-6 stroke-[2.4]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-full">
                Unlimited Model
              </span>
              <span className="text-[10px] font-semibold text-slate-400">v2026 Lifetime</span>
            </div>
            <h3 id="lifetime-modal-title" className="text-lg font-bold text-white tracking-tight mt-0.5">
              Unlimited Lifetime Document Generation
            </h3>
          </div>
        </div>

        {/* Status Callout Banner */}
        <div className="bg-emerald-950/40 border border-emerald-800/70 rounded-xl p-3.5 mb-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200 leading-relaxed">
            <p className="font-semibold text-emerald-300 mb-0.5">
              Zero Restrictions & No Document Expiration
            </p>
            <p className="text-emerald-300/80 text-[11px]">
              The 10,000 document creation limit has been permanently abolished. You have unlimited, perpetual lifetime document generation with zero quotas, zero watermarks, and no expiration timer.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-sky-400 text-xs font-semibold mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Generation Limit</span>
            </div>
            <div className="text-lg font-black text-white flex items-center gap-1">
              <span>∞</span>
              <span className="text-xs font-normal text-slate-400">Unlimited</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">No 10k ceiling or daily caps</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Document Expiry</span>
            </div>
            <div className="text-base font-black text-emerald-300 flex items-center gap-1">
              <span>100 Years</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">100-year perpetual validity</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-semibold mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Documents Exported</span>
            </div>
            <div className="text-lg font-black text-white">
              {exportCount} <span className="text-xs font-normal text-slate-400">/ ∞</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Compiled in this session</p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-teal-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Device Execution</span>
            </div>
            <div className="text-base font-bold text-white">100% Offline</div>
            <p className="text-[10px] text-slate-500 mt-1">Runs directly on your hardware</p>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="text-center text-xs text-slate-400 mb-4 bg-slate-950/50 py-2 rounded-lg border border-slate-800/60">
          Created & Maintained by <strong className="text-sky-300">Ch Atif Gondal</strong>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-center"
        >
          Got It, Continue Working
        </button>
      </div>
    </div>
  );
};
