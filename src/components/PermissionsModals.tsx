import React from 'react';
import { Image as ImageIcon, Download } from 'lucide-react';

interface GalleryPermissionModalProps {
  isOpen: boolean;
  onGrant: () => void;
  onClose: () => void;
}

export const GalleryPermissionModal: React.FC<GalleryPermissionModalProps> = ({
  isOpen,
  onGrant,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
        <div className="w-12 h-12 bg-sky-500/10 border border-sky-500/30 text-sky-400 rounded-full flex items-center justify-center mx-auto mb-3.5">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">Gallery Access Required</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          To insert photos, logos, or figures into your PDF document, Mobile PDF Studio requires permission to access your device photo gallery.
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onGrant}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Allow Gallery Access
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};

interface StoragePermissionModalProps {
  isOpen: boolean;
  onGrant: () => void;
  onClose: () => void;
}

export const StoragePermissionModal: React.FC<StoragePermissionModalProps> = ({
  isOpen,
  onGrant,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl text-center">
        <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3.5">
          <Download className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white mb-1.5">Storage Permission Required</h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-5">
          Mobile PDF Studio requires device storage access to generate and save the rendered PDF file directly to your downloads.
        </p>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onGrant}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            Allow & Save PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
