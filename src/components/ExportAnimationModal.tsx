import React from 'react';
import { FileDown, CheckCircle2, Loader2, Sparkles, HardDrive } from 'lucide-react';

interface ExportAnimationModalProps {
  isOpen: boolean;
  projectName: string;
  fileSizeFormatted: string;
  statusText: string;
  progress: number;
  isComplete: boolean;
}

export const ExportAnimationModal: React.FC<ExportAnimationModalProps> = ({
  isOpen,
  projectName,
  fileSizeFormatted,
  statusText,
  progress,
  isComplete,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="export-animation-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="export-animation-panel"
        className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/80 flex flex-col items-center text-center text-slate-100 relative overflow-hidden"
      >
        {/* Subtle background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Dynamic Status Icon with Pulse */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-inner relative">
            {isComplete ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 stroke-[2.2] animate-in zoom-in-50 duration-200" />
            ) : (
              <FileDown className="w-8 h-8 text-sky-400 stroke-[2.2] animate-pulse" />
            )}
          </div>
          {!isComplete && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md">
              <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Title & Document Info */}
        <h3 className="text-lg font-bold text-white tracking-tight mb-1">
          {isComplete ? 'Export Complete' : 'Exporting PDF'}
        </h3>
        <p className="text-xs text-slate-300 font-medium truncate max-w-[260px] mb-3">
          {projectName || 'Document'}
        </p>

        {/* Dynamic File Size & Storage Location Badge */}
        <div className="flex items-center gap-2 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>Size: {fileSizeFormatted || 'Calculating...'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 border border-slate-800 text-slate-400 text-[11px] font-medium">
            <HardDrive className="w-3 h-3 text-slate-400" />
            <span>PDF Studio/</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/90 rounded-full h-2 p-0.5 border border-slate-800 mb-2">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${Math.min(Math.max(progress, 5), 100)}%` }}
          />
        </div>

        {/* Dynamic Status Text */}
        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 mt-1">
          <span className="truncate">{statusText}</span>
          <span className="font-semibold text-slate-300 shrink-0 ml-2">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  );
};
