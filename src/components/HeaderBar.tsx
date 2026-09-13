import React from 'react';
import { FileText, FileDown, Loader2 } from 'lucide-react';

interface HeaderBarProps {
  logoSrc: string;
  logoLoadFailed: boolean;
  onLogoError: () => void;
  totalPages: number;
  isGenerating: boolean;
  onOpenLifetimeModal?: () => void;
  onExportPdf: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  logoSrc,
  logoLoadFailed,
  onLogoError,
  totalPages: _totalPages,
  isGenerating,
  onOpenLifetimeModal: _onOpenLifetimeModal,
  onExportPdf,
}) => {
  return (
    <header
      id="app-header"
      className="h-14 flex items-center justify-between px-3 sm:px-5 bg-slate-900 border-b border-slate-800 shrink-0 z-20 select-none shadow-sm"
    >
      {/* App Logo & Branding */}
      <div className="flex items-center gap-3 min-w-0">
        {!logoLoadFailed ? (
          <img
            src={logoSrc}
            alt="PDF Studio Logo"
            onError={onLogoError}
            className="w-8 h-8 rounded-lg object-contain bg-slate-950 border border-slate-750 p-0.5 shrink-0 shadow-inner"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-sky-400 stroke-[2.2]" />
          </div>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <span className="font-bold text-base tracking-tight text-white shrink-0">
            PDF Studio
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Export PDF Button */}
        <button
          id="exportBtn"
          type="button"
          onClick={onExportPdf}
          disabled={isGenerating}
          title="Compile and Export Document"
          className="h-9 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium border-0 px-3.5 sm:px-4 text-xs sm:text-sm rounded-lg cursor-pointer flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <FileDown className="w-4 h-4 stroke-[2.2]" />
              <span>Export PDF</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
