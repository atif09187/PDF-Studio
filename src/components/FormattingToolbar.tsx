import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  List,
  ListOrdered,
  Minus,
  RotateCcw,
  Trash2,
  Infinity as InfinityIcon,
} from 'lucide-react';

interface FormattingToolbarProps {
  onFormat: (command: string, value?: string | null) => void;
  onAddImage: () => void;
  onClearPage: () => void;
  onOpenLifetimeModal: () => void;
  activePageIndex: number;
  totalPages: number;
  wordCount: number;
  charCount: number;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onFormat,
  onAddImage,
  onClearPage,
  onOpenLifetimeModal,
  activePageIndex,
  totalPages,
  wordCount,
  charCount,
}) => {
  return (
    <footer
      id="toolbar-footer"
      className="bg-slate-900 border-t border-slate-800 p-2.5 flex flex-col gap-2 shrink-0 select-none z-20 shadow-lg"
    >
      {/* Row 1: Text Styling & Alignment (8 Perfectly Aligned Symmetrical Buttons) */}
      <div className="grid grid-cols-8 gap-1.5 w-full">
        {/* Bold */}
        <button
          id="btn-bold"
          type="button"
          onClick={() => onFormat('bold')}
          title="Bold (Ctrl+B)"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Bold className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>

        {/* Italic */}
        <button
          id="btn-italic"
          type="button"
          onClick={() => onFormat('italic')}
          title="Italic (Ctrl+I)"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Italic className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>

        {/* Underline */}
        <button
          id="btn-underline"
          type="button"
          onClick={() => onFormat('underline')}
          title="Underline (Ctrl+U)"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Underline className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>

        {/* Strikethrough */}
        <button
          id="btn-strike"
          type="button"
          onClick={() => onFormat('strikeThrough')}
          title="Strikethrough"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Strikethrough className="w-3.5 h-3.5 stroke-[2.4]" />
        </button>

        {/* Align Left */}
        <button
          id="btn-align-left"
          type="button"
          onClick={() => onFormat('justifyLeft')}
          title="Align Left"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <AlignLeft className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>

        {/* Align Center */}
        <button
          id="btn-align-center"
          type="button"
          onClick={() => onFormat('justifyCenter')}
          title="Align Center"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <AlignCenter className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>

        {/* Align Right */}
        <button
          id="btn-align-right"
          type="button"
          onClick={() => onFormat('justifyRight')}
          title="Align Right"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <AlignRight className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>

        {/* Justify */}
        <button
          id="btn-align-justify"
          type="button"
          onClick={() => onFormat('justifyFull')}
          title="Justify Full"
          className="h-9 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <AlignJustify className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Row 2: Media, Lists, Dividers & Actions */}
      <div className="flex gap-1.5 items-center w-full">
        {/* Insert Image */}
        <button
          id="btn-insert-image"
          type="button"
          onClick={onAddImage}
          title="Insert Image from Device Gallery"
          className="flex-2 min-w-0 h-8.5 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-all shadow-xs"
        >
          <ImageIcon className="w-3.5 h-3.5 text-sky-400 stroke-[2.2] shrink-0" />
          <span className="truncate">+ Image</span>
        </button>

        {/* Bullet List */}
        <button
          id="btn-bullet-list"
          type="button"
          onClick={() => onFormat('insertUnorderedList')}
          title="Bullet List"
          className="flex-1 min-w-0 h-8.5 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <List className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>

        {/* Numbered List */}
        <button
          id="btn-numbered-list"
          type="button"
          onClick={() => onFormat('insertOrderedList')}
          title="Numbered List"
          className="flex-1 min-w-0 h-8.5 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <ListOrdered className="w-3.5 h-3.5 stroke-[2.2]" />
        </button>

        {/* Horizontal Divider Line */}
        <button
          id="btn-insert-divider"
          type="button"
          onClick={() => onFormat('insertHorizontalRule')}
          title="Insert Horizontal Divider Line"
          className="flex-1 min-w-0 h-8.5 bg-slate-850 hover:bg-slate-800 active:bg-indigo-600 active:scale-95 border border-slate-750 hover:border-slate-700 text-slate-200 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-xs"
        >
          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>

        {/* Reset Formatting */}
        <button
          id="btn-reset-format"
          type="button"
          onClick={() => onFormat('removeFormat')}
          title="Reset Text Formatting"
          className="flex-1.2 min-w-0 h-8.5 bg-slate-850 hover:bg-slate-800 active:bg-slate-750 border border-slate-750 hover:border-slate-700 text-slate-300 rounded-lg flex items-center justify-center gap-1 text-[11px] font-medium transition-all cursor-pointer shadow-xs"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden xs:inline">Reset</span>
        </button>

        {/* Empty / Clear Page */}
        <button
          id="btn-clear-page"
          type="button"
          onClick={onClearPage}
          title="Clear content on this page"
          className="flex-1.2 min-w-0 h-8.5 bg-amber-950/40 hover:bg-amber-900/50 active:bg-amber-850 border border-amber-800/60 text-amber-300 rounded-lg flex items-center justify-center gap-1 text-[11px] font-semibold transition-all cursor-pointer shadow-xs"
        >
          <Trash2 className="w-3 h-3 text-amber-400" />
          <span className="hidden xs:inline">Clear</span>
        </button>
      </div>

      {/* Row 3: Live Document Stats & Lifetime Unlimited Badge */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/80 px-0.5">
        <div className="flex items-center gap-2 font-medium">
          <span className="text-slate-300">
            Page {activePageIndex + 1} of {totalPages}
          </span>
          <span className="text-slate-600">&bull;</span>
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span className="text-slate-600">&bull;</span>
          <span>{charCount} chars</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenLifetimeModal}
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer transition-colors"
          >
            <InfinityIcon className="w-3 h-3 stroke-[2.5]" />
            <span>100-Year Lifetime</span>
          </button>
          <span className="text-slate-600 hidden sm:inline">&bull;</span>
          <span className="text-slate-500 hidden sm:inline">
            By <strong className="text-slate-400 font-medium">Ch Atif Gondal</strong>
          </span>
        </div>
      </div>
    </footer>
  );
};
