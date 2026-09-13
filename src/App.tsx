import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Trash2,
  Check,
  Loader2,
  Plus,
  Copy,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Infinity as InfinityIcon,
} from 'lucide-react';

import { PageSize, MarginSize, PageItem, ActiveDrawer } from './types';
import { TEMPLATES } from './data/templates';
import { HeaderBar } from './components/HeaderBar';
import { ControlsDrawer } from './components/ControlsDrawer';
import { FormattingToolbar } from './components/FormattingToolbar';
import { DeletePageModal } from './components/DeletePageModal';
import { ClearPageModal } from './components/ClearPageModal';
import { LifetimeModal } from './components/LifetimeModal';
import { FirstLaunchPermissionModal } from './components/FirstLaunchPermissionModal';

export default function App() {
  // Splash Screen State
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [splashProgress, setSplashProgress] = useState<number>(0);
  const [logoSrc, setLogoSrc] = useState<string>('/logo.png');
  const [logoLoadFailed, setLogoLoadFailed] = useState<boolean>(false);

  const handleLogoError = () => {
    if (logoSrc === '/logo.png') {
      setLogoSrc('/Logo.png');
    } else {
      setLogoLoadFailed(true);
    }
  };

  // Multi-page State
  const [pages, setPages] = useState<PageItem[]>([
    { id: 'page-1', content: TEMPLATES.default },
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Document Styling Configuration
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [marginSize, setMarginSize] = useState<MarginSize>('24px');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [fontSize, setFontSize] = useState<string>('3');

  // Active Drawer State
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null);

  // Export & Progress State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [exportCount, setExportCount] = useState<number>(() => {
    const saved = localStorage.getItem('pdf_studio_export_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Modal States
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [pageToDeleteIndex, setPageToDeleteIndex] = useState<number | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState<boolean>(false);
  const [showLifetimeModal, setShowLifetimeModal] = useState<boolean>(false);

  // One-time required permission state (persisted in localStorage)
  const [permissionsGranted, setPermissionsGranted] = useState<boolean>(() => {
    return localStorage.getItem('pdf_studio_permissions_granted') === 'true';
  });
  const [showFirstLaunchPermissionModal, setShowFirstLaunchPermissionModal] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Helper
  const showNotification = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Splash Screen Timer & Animation
  useEffect(() => {
    const duration = 2500;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setSplashProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setShowSplash(false);
            if (!permissionsGranted) {
              setShowFirstLaunchPermissionModal(true);
            }
          }, 180);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [permissionsGranted]);

  // Helper: Synchronize all DOM editable elements back into pages state
  const syncDomToState = useCallback(() => {
    setPages((prevPages) =>
      prevPages.map((page, index) => {
        const el = document.getElementById(`page-content-${index}`);
        if (el) {
          return { ...page, content: el.innerHTML };
        }
        return page;
      })
    );
  }, []);

  // Compute live word and character counts from current document
  const { wordCount, charCount } = useMemo(() => {
    let totalWords = 0;
    let totalChars = 0;
    pages.forEach((p) => {
      // Strip HTML tags for clean word extraction
      const text = p.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 0) {
        totalWords += text.split(' ').filter(Boolean).length;
        totalChars += text.length;
      }
    });
    return { wordCount: totalWords, charCount: totalChars };
  }, [pages]);

  // Rich Text Formatting Command
  const formatDoc = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    const el = document.getElementById(`page-content-${activePageIndex}`);
    if (el) {
      el.focus();
      // Synchronize changes to active page
      setPages((prev) => {
        const updated = [...prev];
        if (updated[activePageIndex]) {
          updated[activePageIndex] = {
            ...updated[activePageIndex],
            content: el.innerHTML,
          };
        }
        return updated;
      });
    }
  };

  // Drawer Actions
  const handleSelectFont = (fontVal: string) => {
    setFontFamily(fontVal);
    formatDoc('fontName', fontVal);
    setActiveDrawer(null);
  };

  const handleSelectFontSize = (sizeVal: string) => {
    setFontSize(sizeVal);
    formatDoc('fontSize', sizeVal);
    setActiveDrawer(null);
  };

  const handleSelectPageSize = (size: PageSize) => {
    setPageSize(size);
    setActiveDrawer(null);
    showNotification(`Format set to ${size.toUpperCase()}`);
  };

  const handleSelectMargin = (margin: MarginSize) => {
    setMarginSize(margin);
    setActiveDrawer(null);
    showNotification(`Margin set to ${margin}`);
  };

  const handleSelectTemplate = (key: string) => {
    if (TEMPLATES[key] !== undefined) {
      setPages((prev) => {
        const updated = [...prev];
        updated[activePageIndex] = {
          ...updated[activePageIndex],
          content: TEMPLATES[key],
        };
        return updated;
      });
      const el = document.getElementById(`page-content-${activePageIndex}`);
      if (el) {
        el.innerHTML = TEMPLATES[key];
        el.focus();
      }
      setActiveDrawer(null);
      showNotification('Preset template applied');
    }
  };

  // Add a new blank page
  const handleAddNewPage = () => {
    syncDomToState();
    const newPageId = `page-${Date.now()}`;
    setPages((prev) => [...prev, { id: newPageId, content: '<p><br></p>' }]);
    const newIndex = pages.length;
    setActivePageIndex(newIndex);
    showNotification(`Page ${newIndex + 1} added`);

    setTimeout(() => {
      const newPageEl = document.getElementById(`page-container-${newIndex}`);
      newPageEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const contentEl = document.getElementById(`page-content-${newIndex}`);
      contentEl?.focus();
    }, 120);
  };

  // Duplicate an existing page
  const handleDuplicatePage = (index: number) => {
    syncDomToState();
    const targetPage = pages[index];
    if (!targetPage) return;

    const newPageId = `page-${Date.now()}`;
    const duplicatedPage: PageItem = {
      id: newPageId,
      content: targetPage.content,
    };

    setPages((prev) => {
      const updated = [...prev];
      updated.splice(index + 1, 0, duplicatedPage);
      return updated;
    });

    const newIndex = index + 1;
    setActivePageIndex(newIndex);
    showNotification(`Page ${index + 1} duplicated to Page ${newIndex + 1}`);

    setTimeout(() => {
      const newPageEl = document.getElementById(`page-container-${newIndex}`);
      newPageEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  };

  // Move Page Up
  const handleMovePageUp = (index: number) => {
    if (index <= 0) return;
    syncDomToState();
    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
    setActivePageIndex(index - 1);
    showNotification(`Page moved up to #${index}`);
  };

  // Move Page Down
  const handleMovePageDown = (index: number) => {
    if (index >= pages.length - 1) return;
    syncDomToState();
    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
    setActivePageIndex(index + 1);
    showNotification(`Page moved down to #${index + 2}`);
  };

  // Page Delete Flow: Click handler
  const handleRequestDeletePage = (index: number) => {
    if (pages.length <= 1) {
      showNotification('Document must have at least 1 page. Use Clear to empty it.');
      setShowClearConfirmModal(true);
      return;
    }
    setPageToDeleteIndex(index);
    setShowDeleteConfirmModal(true);
  };

  // Page Delete Flow: Confirmation Execution
  const handleConfirmDeletePage = () => {
    if (pageToDeleteIndex === null) return;
    const targetNumber = pageToDeleteIndex + 1;

    // First collect all current DOM innerHTML values
    const currentDomContents = pages.map((page, idx) => {
      const el = document.getElementById(`page-content-${idx}`);
      return el ? el.innerHTML : page.content;
    });

    // Remove the target page from array
    const remainingPages = pages
      .map((p, idx) => ({ ...p, content: currentDomContents[idx] }))
      .filter((_, idx) => idx !== pageToDeleteIndex);

    setPages(remainingPages);

    // Adjust active page index gracefully
    let nextActiveIndex = activePageIndex;
    if (activePageIndex >= pageToDeleteIndex) {
      nextActiveIndex = Math.max(0, activePageIndex - 1);
    }
    if (nextActiveIndex >= remainingPages.length) {
      nextActiveIndex = Math.max(0, remainingPages.length - 1);
    }
    setActivePageIndex(nextActiveIndex);

    // Close modal and notify user
    setShowDeleteConfirmModal(false);
    setPageToDeleteIndex(null);
    showNotification(`Page ${targetNumber} deleted successfully`);
  };

  // Page Clear Flow
  const handleConfirmClearPage = () => {
    const el = document.getElementById(`page-content-${activePageIndex}`);
    if (el) {
      el.innerHTML = '<p><br></p>';
      el.focus();
    }
    setPages((prev) => {
      const updated = [...prev];
      if (updated[activePageIndex]) {
        updated[activePageIndex] = {
          ...updated[activePageIndex],
          content: '<p><br></p>',
        };
      }
      return updated;
    });
    setShowClearConfirmModal(false);
    showNotification(`Page ${activePageIndex + 1} cleared`);
  };

  // One-time Permission Handlers
  const handleGrantFirstLaunchPermissions = () => {
    localStorage.setItem('pdf_studio_permissions_granted', 'true');
    setPermissionsGranted(true);
    setShowFirstLaunchPermissionModal(false);
    showNotification('Permissions granted! Ready for lifetime use.');
  };

  // Image Insertion Trigger
  const handleImageButtonClick = () => {
    if (!permissionsGranted) {
      setShowFirstLaunchPermissionModal(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  // Image Upload handler
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const targetEl = document.getElementById(`page-content-${activePageIndex}`);
    if (!targetEl) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'doc-image-wrapper';
      wrapper.contentEditable = 'false';

      const img = document.createElement('img');
      img.src = result;
      img.alt = 'Uploaded image';

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-img-btn';
      delBtn.type = 'button';
      delBtn.innerHTML = '✕';
      delBtn.title = 'Remove Image';
      delBtn.onclick = () => {
        wrapper.remove();
        syncDomToState();
      };

      wrapper.appendChild(img);
      wrapper.appendChild(delBtn);
      targetEl.appendChild(wrapper);

      // Append typing paragraph
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      targetEl.appendChild(p);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      syncDomToState();
      showNotification('Image inserted into page');
    };
    reader.readAsDataURL(file);
  };

  // Storage & PDF Export Flow
  const handleExportClick = () => {
    if (!permissionsGranted) {
      setShowFirstLaunchPermissionModal(true);
    } else {
      executeGeneratePDF();
    }
  };

  // Execute High-Quality Multi-Page PDF Generation
  const executeGeneratePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // Gather active HTML content from each page
      const renderedPagesHtml: string[] = [];

      pages.forEach((page, idx) => {
        const pageEl = document.getElementById(`page-content-${idx}`);
        const html = pageEl ? pageEl.innerHTML : page.content;
        const textContent = pageEl ? pageEl.innerText.trim() : page.content.replace(/<[^>]*>/g, '').trim();
        const hasImages = pageEl ? pageEl.querySelector('img') !== null : page.content.includes('<img');

        if (textContent.length > 0 || hasImages || idx === 0) {
          if (pageEl) {
            const clone = pageEl.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('.delete-img-btn').forEach((b) => ((b as HTMLElement).style.display = 'none'));
            renderedPagesHtml.push(clone.innerHTML);
          } else {
            renderedPagesHtml.push(html);
          }
        }
      });

      if (renderedPagesHtml.length === 0) {
        renderedPagesHtml.push('<p><br></p>');
      }

      // Initialize jsPDF document with selected format
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const sheetWidthPx = pageSize === 'letter' ? 816 : pageSize === 'legal' ? 816 : 794;
      const sheetMinHeightPx = pageSize === 'letter' ? 1056 : pageSize === 'legal' ? 1344 : 1123;

      let isFirstPdfPage = true;

      for (let i = 0; i < renderedPagesHtml.length; i++) {
        const pageHtml = renderedPagesHtml[i];

        // Create temporary offscreen sheet container
        const tempPage = document.createElement('div');
        tempPage.className = 'pdf-render-temp-sheet';
        tempPage.style.width = `${sheetWidthPx}px`;
        tempPage.style.minHeight = `${sheetMinHeightPx}px`;
        tempPage.style.padding = marginSize;
        tempPage.style.boxSizing = 'border-box';
        tempPage.style.backgroundColor = '#ffffff';
        tempPage.style.color = '#111827';
        tempPage.style.fontFamily = fontFamily;
        tempPage.style.fontSize = '15px';
        tempPage.style.lineHeight = '1.6';
        tempPage.style.wordBreak = 'break-word';
        tempPage.style.position = 'fixed';
        tempPage.style.top = '0';
        tempPage.style.left = '-10000px';
        tempPage.style.zIndex = '-9999';
        tempPage.innerHTML = pageHtml;

        document.body.appendChild(tempPage);

        const canvas = await html2canvas(tempPage, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        document.body.removeChild(tempPage);

        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const canvasImgHeightInPdf = (canvas.height * pdfWidth) / canvas.width;

        if (canvasImgHeightInPdf <= pdfHeight * 1.05) {
          if (!isFirstPdfPage) {
            pdf.addPage(pageSize, 'portrait');
          }
          isFirstPdfPage = false;
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        } else {
          // Slice overflow smoothly
          let heightLeft = canvasImgHeightInPdf;
          let position = 0;

          while (heightLeft > 0) {
            if (!isFirstPdfPage) {
              pdf.addPage(pageSize, 'portrait');
            }
            isFirstPdfPage = false;
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, canvasImgHeightInPdf, undefined, 'FAST');
            heightLeft -= pdfHeight;
            position -= pdfHeight;
          }
        }
      }

      // Save the generated multi-page PDF
      const fileName = `PDF_Studio_Doc_${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);

      // Increment unlimited lifetime export counter
      setExportCount((prev) => {
        const next = prev + 1;
        localStorage.setItem('pdf_studio_export_count', next.toString());
        return next;
      });

      showNotification('PDF exported successfully! (Unlimited Lifetime Model)');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showNotification('Export completed with native download fallback');
    } finally {
      setIsGenerating(false);
    }
  };

  const getMaxWidth = () => {
    switch (pageSize) {
      case 'letter':
        return '460px';
      case 'legal':
        return '490px';
      case 'a4':
      default:
        return '100%';
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[640px] mx-auto bg-slate-950 text-slate-100 shadow-2xl relative overflow-hidden select-none border-x border-slate-900">
      {/* ============================================================ */}
      {/* 1. SPLASH SCREEN (Polished Startup View)                    */}
      {/* ============================================================ */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-8 text-center select-none">
          <div className="w-full flex justify-end">
            <button
              type="button"
              onClick={() => {
                setShowSplash(false);
                if (!permissionsGranted) {
                  setShowFirstLaunchPermissionModal(true);
                }
              }}
              className="text-xs text-slate-400 hover:text-white px-3 py-1 rounded-full bg-slate-900 border border-slate-800 transition-colors cursor-pointer"
            >
              Skip
            </button>
          </div>

          <div className="flex flex-col items-center max-w-xs">
            <div className="relative mb-5">
              {!logoLoadFailed ? (
                <img
                  src={logoSrc}
                  alt="PDF Studio Logo"
                  onError={handleLogoError}
                  className="w-24 h-24 rounded-2xl object-contain shadow-2xl border border-slate-800 p-2 bg-slate-900"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-indigo-800 flex items-center justify-center shadow-2xl border border-indigo-400/40">
                  <FileText className="w-12 h-12 text-white stroke-[2.2]" />
                </div>
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mb-1">
              PDF Studio
            </h1>

            {/* Developer Credit & Lifetime Badge */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ch Atif Gondal &bull; Lifetime Edition</span>
            </div>

            {/* Spinning Indicator */}
            <div className="relative flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-56 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-100 ease-out"
                style={{ width: `${splashProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-medium tracking-wide">
              Loading Studio &bull; {Math.round(splashProgress)}%
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Developed by <span className="text-slate-400 font-semibold">Ch Atif Gondal</span>
          </div>
        </div>
      )}

      {/* Floating Toast Feedback Banner */}
      {showToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-600/80 text-emerald-300 text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 pointer-events-none transition-all animate-in fade-in duration-200">
          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Hidden File Input for Device Gallery Images */}
      <input
        id="imageInput"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* ============================================================ */}
      {/* 2. HEADER BAR                                               */}
      {/* ============================================================ */}
      <HeaderBar
        logoSrc={logoSrc}
        logoLoadFailed={logoLoadFailed}
        onLogoError={handleLogoError}
        totalPages={pages.length}
        isGenerating={isGenerating}
        onOpenLifetimeModal={() => setShowLifetimeModal(true)}
        onExportPdf={handleExportClick}
      />

      {/* ============================================================ */}
      {/* 3. DOCUMENT CONTROLS & IN-APP DRAWER                        */}
      {/* ============================================================ */}
      <ControlsDrawer
        activeDrawer={activeDrawer}
        setActiveDrawer={setActiveDrawer}
        fontFamily={fontFamily}
        fontSize={fontSize}
        pageSize={pageSize}
        marginSize={marginSize}
        onSelectFont={handleSelectFont}
        onSelectFontSize={handleSelectFontSize}
        onSelectPageSize={handleSelectPageSize}
        onSelectMargin={handleSelectMargin}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* ============================================================ */}
      {/* 4. LIVE PREVIEW VIEWPORT WITH MULTI-PAGE CARDS              */}
      {/* ============================================================ */}
      <main
        id="preview-viewport"
        className="flex-1 overflow-y-auto bg-slate-950 p-3 sm:p-4 flex flex-col items-center gap-6 relative select-text"
      >
        {pages.map((page, index) => {
          const isCurrentActive = activePageIndex === index;
          return (
            <div
              key={page.id}
              id={`page-container-${index}`}
              className="w-full flex flex-col items-center"
              onClick={() => setActivePageIndex(index)}
            >
              {/* Page Control & Indicator Header */}
              <div
                style={{ maxWidth: getMaxWidth() }}
                className="w-full flex items-center justify-between px-1.5 py-1 text-slate-400 text-[11px] font-semibold select-none mb-1.5"
              >
                {/* Left Side: Page Badge & Active Status */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                      isCurrentActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                        : 'bg-slate-850 text-slate-300 border border-slate-750'
                    }`}
                  >
                    Page {index + 1} of {pages.length}
                  </span>
                  {isCurrentActive && (
                    <span className="text-[10px] text-sky-400 font-medium hidden xs:inline">
                      Editing Active
                    </span>
                  )}
                </div>

                {/* Right Side: Page Actions (Reorder, Duplicate, Clear, Delete) */}
                <div className="flex items-center gap-1">
                  {/* Move Up */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePageUp(index);
                      }}
                      title="Move page up"
                      className="p-1 rounded bg-slate-850 border border-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  )}

                  {/* Move Down */}
                  {index < pages.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMovePageDown(index);
                      }}
                      title="Move page down"
                      className="p-1 rounded bg-slate-850 border border-slate-750 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}

                  {/* Duplicate Page */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicatePage(index);
                    }}
                    title="Duplicate this page"
                    className="p-1 rounded bg-slate-850 border border-slate-750 text-slate-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {/* Delete Page Button (With Confirmation Popup) */}
                  <button
                    id={`delete-page-btn-${index}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRequestDeletePage(index);
                    }}
                    title={pages.length > 1 ? `Delete Page ${index + 1}` : 'Clear Page (Document requires at least 1 page)'}
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/60 hover:bg-rose-900/80 active:bg-rose-800 border border-rose-800/80 text-rose-300 hover:text-rose-100 transition-all cursor-pointer shadow-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              {/* Editable Paper Sheet */}
              <div
                id={`page-content-${index}`}
                contentEditable
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement;
                  const deleteBtn = target.closest('[data-action="delete-image"], .delete-img-btn');
                  if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const wrapper = deleteBtn.closest('.doc-image-wrapper');
                    if (wrapper) {
                      wrapper.remove();
                      syncDomToState();
                      showNotification('Image removed');
                    }
                  }
                }}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  const deleteBtn = target.closest('[data-action="delete-image"], .delete-img-btn');
                  if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const wrapper = deleteBtn.closest('.doc-image-wrapper');
                    if (wrapper) {
                      wrapper.remove();
                      syncDomToState();
                      showNotification('Image removed');
                    }
                  }
                }}
                suppressContentEditableWarning
                spellCheck={false}
                dangerouslySetInnerHTML={{ __html: page.content }}
                style={{
                  padding: marginSize,
                  maxWidth: getMaxWidth(),
                  fontFamily: fontFamily,
                }}
                onFocus={() => setActivePageIndex(index)}
                onInput={(e) => {
                  const target = e.currentTarget;
                  setPages((prev) => {
                    const updated = [...prev];
                    if (updated[index]) {
                      updated[index] = { ...updated[index], content: target.innerHTML };
                    }
                    return updated;
                  });
                }}
                className={`pdf-sheet w-full min-h-[540px] rounded-xl shadow-2xl transition-all duration-150 relative cursor-text outline-none border ${
                  isCurrentActive
                    ? 'border-indigo-500/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-800/60'
                }`}
              />
            </div>
          );
        })}

        {/* Add Page Card */}
        <div
          style={{ maxWidth: getMaxWidth() }}
          className="w-full select-none pb-5"
        >
          <button
            id="add-page-btn"
            type="button"
            onClick={handleAddNewPage}
            className="w-full min-h-[140px] border-2 border-dashed border-slate-800 hover:border-indigo-500/80 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:text-indigo-300 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center mb-2 transition-all shadow-md">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-xs text-slate-200 group-hover:text-white mb-0.5">
              + Add Page {pages.length + 1}
            </span>
            <span className="text-[11px] text-slate-500 group-hover:text-slate-400">
              Tap to append a new blank sheet to this document
            </span>
          </button>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 5. BOTTOM FORMATTING TOOLBAR                                 */}
      {/* ============================================================ */}
      <FormattingToolbar
        onFormat={formatDoc}
        onAddImage={handleImageButtonClick}
        onClearPage={() => setShowClearConfirmModal(true)}
        onOpenLifetimeModal={() => setShowLifetimeModal(true)}
        activePageIndex={activePageIndex}
        totalPages={pages.length}
        wordCount={wordCount}
        charCount={charCount}
      />

      {/* ============================================================ */}
      {/* 6. MODALS & POPUPS                                           */}
      {/* ============================================================ */}

      {/* 1. Page Delete Confirmation Popup */}
      <DeletePageModal
        isOpen={showDeleteConfirmModal}
        pageIndex={pageToDeleteIndex}
        totalPages={pages.length}
        onCancel={() => {
          setShowDeleteConfirmModal(false);
          setPageToDeleteIndex(null);
        }}
        onConfirm={handleConfirmDeletePage}
      />

      {/* 2. Page Clear Confirmation Popup */}
      <ClearPageModal
        isOpen={showClearConfirmModal}
        pageIndex={activePageIndex}
        onCancel={() => setShowClearConfirmModal(false)}
        onConfirm={handleConfirmClearPage}
      />

      {/* 3. Unlimited Lifetime Generation Info Modal */}
      <LifetimeModal
        isOpen={showLifetimeModal}
        exportCount={exportCount}
        onClose={() => setShowLifetimeModal(false)}
      />

      {/* 4. One-Time Required Permission Request on First App Launch */}
      <FirstLaunchPermissionModal
        isOpen={showFirstLaunchPermissionModal}
        onGrantPermissions={handleGrantFirstLaunchPermissions}
      />
    </div>
  );
}
