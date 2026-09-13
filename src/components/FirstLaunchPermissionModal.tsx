import React from 'react';
import { ShieldCheck, FileText, Image as ImageIcon, HardDrive, CheckCircle } from 'lucide-react';

interface FirstLaunchPermissionModalProps {
  isOpen: boolean;
  onGrantPermissions: () => void;
}

export const FirstLaunchPermissionModal: React.FC<FirstLaunchPermissionModalProps> = ({
  isOpen,
  onGrantPermissions,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="first-launch-permission-dialog"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/80 flex flex-col gap-5 text-slate-100 relative"
      >
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-indigo-400 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Permissions Required</h2>
            <p className="text-xs text-slate-400">PDF Studio • Ch Atif Gondal</p>
          </div>
        </div>

        {/* Informative text */}
        <p className="text-sm text-slate-300 leading-relaxed">
          To create, edit, insert images, and save lifetime valid PDF documents on this device, PDF Studio requires one-time permission access:
        </p>

        {/* Feature List */}
        <div className="flex flex-col gap-2.5 bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
          <div className="flex items-center gap-3 text-xs text-slate-200">
            <div className="w-6 h-6 rounded-md bg-sky-500/15 text-sky-400 flex items-center justify-center shrink-0">
              <HardDrive className="w-3.5 h-3.5" />
            </div>
            <span><strong>Storage Access:</strong> Save and export generated PDF files locally</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-200">
            <div className="w-6 h-6 rounded-md bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <span><strong>Media & Photos:</strong> Insert stamps, signatures, and document photos</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-200">
            <div className="w-6 h-6 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <span><strong>Document Engine:</strong> 100-Year lifetime offline PDF rendering</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>This authorization is requested once and remembered permanently.</span>
        </div>

        {/* Grant Button */}
        <button
          id="grantPermissionsBtn"
          type="button"
          onClick={onGrantPermissions}
          className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm rounded-xl cursor-pointer shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Allow Permissions & Continue</span>
        </button>
      </div>
    </div>
  );
};
