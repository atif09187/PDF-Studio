import React from 'react';
import { FileText, FileDown, Loader2, ArrowLeft, Check } from 'lucide-react';
import { SaveStatus } from '../types';

interface HeaderBarProps {
  logoSrc: string;
  logoLoadFailed: boolean;
  onLogoError: () => void;
  totalPages?: number;
  isGenerating: boolean;
  projectName?: string;
  saveStatus?: SaveStatus;
  onBackToDashboard?: () => void;
  onExportPdf: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  logoSrc,
  logoLoadFailed,
  onLogoError,
  isGenerating,
  projectName = 'Untitled Project',
  saveStatus = 'saved',
  onBackToDashboard,
  onExportPdf,
}) => {
  return (
    <header
      id="app-header"
      dir="ltr"
      style={{ direction: 'ltr' }}
      className="h-14 flex items-center justify-between px-2.5 sm:px-4 bg-slate-900 border-b border-slate-800 shrink-0 z-20 select-none shadow-sm gap-2"
    >
      {/* Left: Back button & Project Name */}
      <div className="flex items-center gap-2 min-w-0">
        {onBackToDashboard && (
          <button
            id="backToDashboardBtn"
            type="button"
            onClick={onBackToDashboard}
            title="Return to Projects Dashboard"
            className="h-8 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Projects</span>
          </button>
        )}

        {!logoLoadFailed ? (
          <img
            src={logoSrc}
            alt="PDF Studio Logo"
            onError={onLogoError}
            className="w-7 h-7 rounded-lg object-contain bg-slate-950 border border-slate-750 p-0.5 shrink-0 hidden xs:block"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 hidden xs:block">
            <FileText className="w-3.5 h-3.5 text-sky-400 stroke-[2.2]" />
          </div>
        )}

        {/* Permanent Project Name */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold text-sm text-white truncate max-w-[120px] sm:max-w-[200px]">
            {projectName}
          </span>
        </div>
      </div>

      {/* Right: Save Status indicator next to Export PDF Button */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Requirement 6: Save / Save Status Indicator */}
        <div
          id="editor-save-status"
          title={saveStatus === 'saving' ? 'Saving changes to PDF Studio storage...' : 'All changes saved to PDF Studio/Projects/'}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all ${
            saveStatus === 'saving'
              ? 'bg-slate-800/90 text-white border border-slate-600 shadow-xs font-medium'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 font-normal'
          }`}
        >
          {saveStatus === 'saving' ? (
            <>
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
              <span className="text-white text-[11px] sm:text-xs">Saving...</span>
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
              <span className="text-slate-400 text-[11px] sm:text-xs">Saved</span>
            </>
          )}
        </div>

        {/* Existing Export PDF Button (Preserved) */}
        <button
          id="exportBtn"
          type="button"
          onClick={onExportPdf}
          disabled={isGenerating}
          title="Compile and Export Document"
          className="h-9 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-medium border-0 px-3 sm:px-4 text-xs sm:text-sm rounded-lg cursor-pointer flex items-center gap-1.5 sm:gap-2 shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Exporting...</span>
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
