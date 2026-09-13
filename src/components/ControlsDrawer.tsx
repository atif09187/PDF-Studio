import React from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { PageSize, MarginSize, ActiveDrawer } from '../types';
import { FONT_OPTIONS, SIZE_OPTIONS, FORMAT_OPTIONS, MARGIN_OPTIONS, TEMPLATE_OPTIONS } from '../data/templates';

interface ControlsDrawerProps {
  activeDrawer: ActiveDrawer;
  setActiveDrawer: (drawer: ActiveDrawer) => void;
  fontFamily: string;
  fontSize: string;
  pageSize: PageSize;
  marginSize: MarginSize;
  onSelectFont: (font: string) => void;
  onSelectFontSize: (size: string) => void;
  onSelectPageSize: (size: PageSize) => void;
  onSelectMargin: (margin: MarginSize) => void;
  onSelectTemplate: (key: string) => void;
}

export const ControlsDrawer: React.FC<ControlsDrawerProps> = ({
  activeDrawer,
  setActiveDrawer,
  fontFamily,
  fontSize,
  pageSize,
  marginSize,
  onSelectFont,
  onSelectFontSize,
  onSelectPageSize,
  onSelectMargin,
  onSelectTemplate,
}) => {
  const currentFontLabel = FONT_OPTIONS.find((f) => f.value === fontFamily)?.label || 'Font';
  const currentSizeLabel = SIZE_OPTIONS.find((s) => s.value === fontSize)?.label || 'Size';
  const currentFormatLabel = FORMAT_OPTIONS.find((p) => p.value === pageSize)?.label || 'Format';
  const currentMarginLabel = MARGIN_OPTIONS.find((m) => m.value === marginSize)?.label || 'Margin';

  return (
    <div className="shrink-0 z-30 bg-slate-900 border-b border-slate-800 select-none shadow-xs" dir="ltr" style={{ direction: 'ltr' }}>
      {/* Horizontal Button Shelf */}
      <div
        id="doc-controls-bar"
        dir="ltr"
        style={{ direction: 'ltr' }}
        className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar text-xs"
      >
        {/* Font Button */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === 'font' ? null : 'font')}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all shrink-0 cursor-pointer ${
            activeDrawer === 'font'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-semibold'
              : 'bg-slate-850 border-slate-750 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="truncate max-w-[80px]">{currentFontLabel}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDrawer === 'font' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {/* Size Button */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === 'size' ? null : 'size')}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all shrink-0 cursor-pointer ${
            activeDrawer === 'size'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-semibold'
              : 'bg-slate-850 border-slate-750 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="truncate max-w-[70px]">{currentSizeLabel}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDrawer === 'size' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {/* Format Button */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === 'format' ? null : 'format')}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all shrink-0 cursor-pointer ${
            activeDrawer === 'format'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-semibold'
              : 'bg-slate-850 border-slate-750 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="truncate max-w-[80px]">{currentFormatLabel}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDrawer === 'format' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {/* Margin Button */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === 'margin' ? null : 'margin')}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all shrink-0 cursor-pointer ${
            activeDrawer === 'margin'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-semibold'
              : 'bg-slate-850 border-slate-750 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="truncate max-w-[70px]">{currentMarginLabel}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDrawer === 'margin' ? 'rotate-180 text-white' : ''}`} />
        </button>

        {/* Presets Button */}
        <button
          type="button"
          onClick={() => setActiveDrawer(activeDrawer === 'template' ? null : 'template')}
          className={`h-8 flex items-center gap-1.5 px-2.5 rounded-lg border text-xs font-medium transition-all shrink-0 cursor-pointer ${
            activeDrawer === 'template'
              ? 'bg-indigo-600 border-indigo-500 text-white shadow-xs font-semibold'
              : 'bg-slate-850 border-slate-750 text-slate-200 hover:bg-slate-800 hover:border-slate-700'
          }`}
        >
          <span>Presets</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDrawer === 'template' ? 'rotate-180 text-white' : ''}`} />
        </button>
      </div>

      {/* In-App Drawer (Daraz) Panel */}
      {activeDrawer && (
        <div className="bg-slate-950/95 border-t border-slate-800 px-3 py-2.5 shadow-inner transition-all duration-200">
          {/* Font Drawer */}
          {activeDrawer === 'font' && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                <span className="tracking-wider uppercase">Document Font</span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {FONT_OPTIONS.map((f) => (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => onSelectFont(f.value)}
                    className={`h-9 px-3 rounded-lg text-xs flex items-center justify-between border transition-all cursor-pointer ${
                      fontFamily === f.value
                        ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span style={{ fontFamily: f.value }}>{f.label}</span>
                    {fontFamily === f.value && <Check className="w-3.5 h-3.5 ml-1 stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Drawer */}
          {activeDrawer === 'size' && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                <span className="tracking-wider uppercase">Text Size / Heading Level</span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {SIZE_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => onSelectFontSize(s.value)}
                    className={`h-9 px-2 rounded-lg text-xs flex items-center justify-between border transition-all cursor-pointer ${
                      fontSize === s.value
                        ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{s.label}</span>
                    {fontSize === s.value && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Format Drawer */}
          {activeDrawer === 'format' && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                <span className="tracking-wider uppercase">Paper Dimensions</span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {FORMAT_OPTIONS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => onSelectPageSize(p.value)}
                    className={`h-9 px-3 rounded-lg text-xs flex items-center justify-between border transition-all cursor-pointer ${
                      pageSize === p.value
                        ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{p.label}</span>
                    {pageSize === p.value && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Margin Drawer */}
          {activeDrawer === 'margin' && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                <span className="tracking-wider uppercase">Page Margin Padding</span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {MARGIN_OPTIONS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => onSelectMargin(m.value)}
                    className={`py-2 px-2.5 rounded-lg text-xs flex flex-col border transition-all cursor-pointer ${
                      marginSize === m.value
                        ? 'bg-indigo-600 border-indigo-500 text-white font-semibold shadow-xs'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{m.label}</span>
                      {marginSize === m.value && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                    <span className={`text-[10px] mt-0.5 ${marginSize === m.value ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {m.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Presets Drawer */}
          {activeDrawer === 'template' && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                <span className="tracking-wider uppercase">Insert Document Template</span>
                <button
                  type="button"
                  onClick={() => setActiveDrawer(null)}
                  className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {TEMPLATE_OPTIONS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => onSelectTemplate(t.key)}
                    className="px-3 py-2 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all text-left font-medium cursor-pointer"
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
