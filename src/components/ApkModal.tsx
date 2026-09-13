import React, { useEffect } from 'react';
import { Smartphone, FolderArchive, Check, X, ShieldCheck, Infinity as InfinityIcon } from 'lucide-react';

interface ApkModalProps {
  isOpen: boolean;
  logoSrc: string;
  onLogoError: () => void;
  onClose: () => void;
}

export const ApkModal: React.FC<ApkModalProps> = ({
  isOpen,
  logoSrc,
  onLogoError,
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
      id="apk-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3.5 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="apk-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apk-modal-title"
        className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-5 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <img
            src={logoSrc}
            alt="Logo"
            onError={onLogoError}
            className="w-11 h-11 rounded-xl object-contain bg-slate-950 border border-slate-700/80 p-1 shadow"
          />
          <div>
            <h3 id="apk-modal-title" className="text-base font-bold text-white tracking-tight">
              PDF Studio — Android Release APK
            </h3>
            <p className="text-xs text-sky-400 font-medium">Developed by Ch Atif Gondal</p>
          </div>
        </div>

        {/* Lifetime and Verification Badge */}
        <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 mb-4 flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Check className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-[11px] text-emerald-200">
            <p className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span>Verified Release Package &bull; Lifetime License</span>
              <InfinityIcon className="w-3.5 h-3.5 inline" />
            </p>
            <p className="text-emerald-400/80 mt-0.5">
              Permanently unrestricted lifetime document generation. APK signature verified for Android 5.0 through Android 15+.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 mb-4">
          {/* Direct APK Download */}
          <a
            href="/PDF_Studio_Release.apk"
            download="PDF_Studio_Release.apk"
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Download Release APK</span>
            </div>
            <span className="text-[11px] bg-emerald-700/80 px-2 py-0.5 rounded-full font-mono">7.28 MB</span>
          </a>

          {/* Complete Packaged Project Zip */}
          <a
            href="/PDF_Studio_Project_Source.zip"
            download="PDF_Studio_Project_Source.zip"
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-750 active:scale-[0.99] text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <FolderArchive className="w-4 h-4 text-sky-400" />
              <span>Download Packaged Project (.ZIP)</span>
            </div>
            <span className="text-[11px] bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 font-mono">47.7 MB</span>
          </a>
        </div>

        {/* Exact file locations in project */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1.5 font-mono">
          <p className="text-slate-300 font-sans font-semibold mb-1">Package Artifacts:</p>
          <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
            <span className="text-slate-400">Release APK:</span>
            <span className="text-emerald-400">/release/PDF_Studio_Release.apk</span>
          </div>
          <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
            <span className="text-slate-400">Source Zip:</span>
            <span className="text-sky-400">/release/PDF_Studio_Project_Source.zip</span>
          </div>
          <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
            <span className="text-slate-400">Keystore:</span>
            <span className="text-amber-400">/release/release.keystore (Lifetime)</span>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
