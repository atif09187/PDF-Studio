import React, { useEffect, useRef } from 'react';
import { updateActiveBlockDirection, syncBlockDirections } from '../utils/bidi';

interface PageSheetProps {
  id: string;
  pageIndex: number;
  initialContent: string;
  isActive: boolean;
  marginSize: string;
  fontFamily: string;
  onActivate: (index: number) => void;
  onContentChange: (index: number, newHtml: string) => void;
  onRemoveImage: (wrapper: HTMLElement) => void;
}

export const PageSheet: React.FC<PageSheetProps> = ({
  id,
  pageIndex,
  initialContent,
  isActive,
  marginSize,
  fontFamily,
  onActivate,
  onContentChange,
  onRemoveImage,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef<string>(initialContent);

  // Synchronize content when changed externally (e.g. templates, clear page, project switches)
  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    // Only update innerHTML if it doesn't match and the element is not currently focused by user
    if (el.innerHTML !== initialContent) {
      const isFocused = document.activeElement === el || el.contains(document.activeElement);
      if (!isFocused) {
        el.innerHTML = initialContent || '<p dir="ltr"><br/></p>';
        lastHtmlRef.current = el.innerHTML;
        syncBlockDirections(el);
      }
    }
  }, [initialContent]);

  // Initial mount: set initial content and sync block directions
  useEffect(() => {
    const el = editorRef.current;
    if (el && !el.innerHTML) {
      el.innerHTML = initialContent || '<p dir="ltr"><br/></p>';
      lastHtmlRef.current = el.innerHTML;
      syncBlockDirections(el);
    }
  }, []);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;

    // Dynamically assign LTR or RTL to the active paragraph based on language
    updateActiveBlockDirection(el);

    const currentHtml = el.innerHTML;
    lastHtmlRef.current = currentHtml;
    onContentChange(pageIndex, currentHtml);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    onActivate(pageIndex);
    const target = e.target as HTMLElement;
    const deleteBtn = target.closest('[data-action="delete-image"], .delete-img-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const wrapper = deleteBtn.closest('.doc-image-wrapper') as HTMLElement;
      if (wrapper) {
        onRemoveImage(wrapper);
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const deleteBtn = target.closest('[data-action="delete-image"], .delete-img-btn');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const wrapper = deleteBtn.closest('.doc-image-wrapper') as HTMLElement;
      if (wrapper) {
        onRemoveImage(wrapper);
      }
    }
  };

  return (
    <div
      ref={editorRef}
      id={id}
      contentEditable
      dir="ltr"
      suppressContentEditableWarning
      spellCheck={false}
      onFocus={() => onActivate(pageIndex)}
      onInput={handleInput}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        padding: marginSize,
        fontFamily: fontFamily,
        minHeight: '820px',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        direction: 'ltr',
        textAlign: 'left',
      }}
      className={`pdf-page pdf-sheet w-full rounded-sm shadow-xl focus:outline-none transition-shadow ${
        isActive
          ? 'ring-2 ring-indigo-500/80 shadow-indigo-500/10'
          : 'border border-slate-800'
      }`}
    />
  );
};
