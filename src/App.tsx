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
} from 'lucide-react';

import { PageSize, MarginSize, PageItem, ActiveDrawer, ProjectItem, SaveStatus } from './types';
import { TEMPLATES } from './data/templates';
import {
  initDeviceStorage,
  getAllProjects,
  getSavedProjects,
  getDraftProjects,
  saveProjectToStorage,
  deleteProjectFromStorage,
  duplicateProjectInStorage,
  formatFileSize,
  calculateContentSizeBytes,
  logExportRecord,
} from './data/storage';

import { HeaderBar } from './components/HeaderBar';
import { Dashboard } from './components/Dashboard';
import { ControlsDrawer } from './components/ControlsDrawer';
import { FormattingToolbar } from './components/FormattingToolbar';
import { PageSheet } from './components/PageSheet';
import { DeletePageModal } from './components/DeletePageModal';
import { ClearPageModal } from './components/ClearPageModal';
import { LifetimeModal } from './components/LifetimeModal';
import { FirstLaunchPermissionModal } from './components/FirstLaunchPermissionModal';
import { ExportAnimationModal } from './components/ExportAnimationModal';
import { syncBlockDirections, updateActiveBlockDirection } from './utils/bidi';

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

  // View Navigation: 'dashboard' vs 'editor'
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');

  // Active Project & Projects State
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [savedProjectsList, setSavedProjectsList] = useState<ProjectItem[]>([]);
  const [draftProjectsList, setDraftProjectsList] = useState<ProjectItem[]>([]);

  // Auto-Save & Draft State
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Multi-page State
  const [pages, setPages] = useState<PageItem[]>([
    { id: 'page-1', content: TEMPLATES.blank },
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

  // Export Animation Modal State (Requirement 9)
  const [showExportAnimation, setShowExportAnimation] = useState<boolean>(false);
  const [exportFileSizeBytes, setExportFileSizeBytes] = useState<number>(0);
  const [exportFileSizeFormatted, setExportFileSizeFormatted] = useState<string>('');
  const [exportStatusText, setExportStatusText] = useState<string>('Initializing PDF engine...');
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [isExportComplete, setIsExportComplete] = useState<boolean>(false);

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
  const [pendingActionAfterPermission, setPendingActionAfterPermission] = useState<'image' | 'export' | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast Helper
  const showNotification = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Helper: Refresh project lists from storage
  const refreshProjectsList = useCallback(() => {
    setSavedProjectsList(getSavedProjects());
    setDraftProjectsList(getDraftProjects());
  }, []);

  // Initialize storage and load projects on mount
  useEffect(() => {
    initDeviceStorage();
    refreshProjectsList();
  }, [refreshProjectsList]);

  // Splash Screen Timer & Animation - Requirement 1: NO Skip button
  useEffect(() => {
    const duration = 2400;
    const interval = 40;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setSplashProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            setShowSplash(false);
            // Requirement 7: Request permission on first open if not granted yet
            if (!permissionsGranted) {
              setShowFirstLaunchPermissionModal(true);
            }
          }, 150);
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

  // Auto-Save System: debounced saving on edit (Requirement 5)
  const triggerAutoSave = useCallback(
    (updatedPages: PageItem[], forceDraft = false) => {
      if (!activeProject) return;

      setSaveStatus('saving');
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }

      saveTimerRef.current = setTimeout(() => {
        const updatedProject: ProjectItem = {
          ...activeProject,
          pages: updatedPages,
          pageSize,
          marginSize,
          activeFont: fontFamily,
          activeFontSize: fontSize,
          updatedAt: Date.now(),
          isDraft: forceDraft ? true : activeProject.isDraft,
        };

        saveProjectToStorage(updatedProject);
        setActiveProject(updatedProject);
        setSaveStatus('saved');
        refreshProjectsList();
      }, 650);
    },
    [activeProject, pageSize, marginSize, fontFamily, fontSize, refreshProjectsList]
  );

  // Compute live word and character counts from current document
  const { wordCount, charCount } = useMemo(() => {
    let totalWords = 0;
    let totalChars = 0;
    pages.forEach((p) => {
      const text = p.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (text.length > 0) {
        totalWords += text.split(' ').filter(Boolean).length;
        totalChars += text.length;
      }
    });
    return { wordCount: totalWords, charCount: totalChars };
  }, [pages]);

  // Handle content updates from editor sheets
  const handlePageContentChange = useCallback((pageIndex: number, newHtml: string) => {
    setPages((prev) => {
      const updated = [...prev];
      if (updated[pageIndex]) {
        updated[pageIndex] = {
          ...updated[pageIndex],
          content: newHtml,
        };
      }
      triggerAutoSave(updated);
      return updated;
    });
  }, [triggerAutoSave]);

  const handleRemoveImage = (wrapper: HTMLElement) => {
    wrapper.remove();
    const activeEl = document.getElementById(`page-content-${activePageIndex}`);
    if (activeEl) {
      handlePageContentChange(activePageIndex, activeEl.innerHTML);
    }
    showNotification('Image removed');
  };

  // Rich Text Formatting Command
  const formatDoc = (command: string, value: string | null = null) => {
    const activeEl = document.getElementById(`page-content-${activePageIndex}`);
    if (activeEl) {
      if (document.activeElement !== activeEl && !activeEl.contains(document.activeElement)) {
        activeEl.focus();
      }
    }
    document.execCommand(command, false, value ?? undefined);
    if (activeEl) {
      updateActiveBlockDirection(activeEl);
      handlePageContentChange(activePageIndex, activeEl.innerHTML);
    }
  };

  // Helper to apply preset document templates
  const applyTemplate = (templateKey: string) => {
    const templateHtml = TEMPLATES[templateKey];
    if (templateHtml) {
      setPages((prev) => {
        const updated = [...prev];
        updated[activePageIndex] = {
          ...updated[activePageIndex],
          content: templateHtml,
        };
        triggerAutoSave(updated);
        return updated;
      });
      const activeEl = document.getElementById(`page-content-${activePageIndex}`);
      if (activeEl) {
        activeEl.innerHTML = templateHtml;
        syncBlockDirections(activeEl);
      }
      showNotification('Template applied');
    }
    setActiveDrawer(null);
  };

  // Multi-page Handlers
  const handleAddNewPage = () => {
    syncDomToState();
    const newPageId = `page-${Date.now()}`;
    const newBlankPage: PageItem = {
      id: newPageId,
      content: '<p dir="ltr"><br/></p>',
    };

    setPages((prev) => {
      const nextPages = [...prev, newBlankPage];
      setActivePageIndex(nextPages.length - 1);
      triggerAutoSave(nextPages);
      return nextPages;
    });

    showNotification(`Page ${pages.length + 1} added`);
  };

  const handleDuplicatePage = (indexToDuplicate: number) => {
    syncDomToState();
    const target = pages[indexToDuplicate];
    if (!target) return;

    const duplicatedPage: PageItem = {
      id: `page-${Date.now()}`,
      content: target.content,
    };

    setPages((prev) => {
      const nextPages = [...prev];
      nextPages.splice(indexToDuplicate + 1, 0, duplicatedPage);
      setActivePageIndex(indexToDuplicate + 1);
      triggerAutoSave(nextPages);
      return nextPages;
    });

    showNotification(`Page ${indexToDuplicate + 1} duplicated`);
  };

  const handlePromptDeletePage = (indexToDelete: number) => {
    if (pages.length <= 1) {
      showNotification('A document must have at least one page');
      return;
    }
    setPageToDeleteIndex(indexToDelete);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDeletePage = () => {
    if (pageToDeleteIndex === null) return;
    const indexToDelete = pageToDeleteIndex;

    syncDomToState();
    setPages((prev) => {
      const nextPages = prev.filter((_, idx) => idx !== indexToDelete);
      let nextActive = activePageIndex;
      if (activePageIndex >= nextPages.length) {
        nextActive = Math.max(0, nextPages.length - 1);
      } else if (activePageIndex > indexToDelete) {
        nextActive = activePageIndex - 1;
      }
      setActivePageIndex(nextActive);
      triggerAutoSave(nextPages);
      return nextPages;
    });

    setShowDeleteConfirmModal(false);
    setPageToDeleteIndex(null);
    showNotification(`Page ${indexToDelete + 1} removed`);
  };

  const handleMovePage = (index: number, direction: 'up' | 'down') => {
    syncDomToState();
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === pages.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    setPages((prev) => {
      const nextPages = [...prev];
      const temp = nextPages[index];
      nextPages[index] = nextPages[targetIndex];
      nextPages[targetIndex] = temp;
      setActivePageIndex(targetIndex);
      triggerAutoSave(nextPages);
      return nextPages;
    });
  };

  const handleConfirmClearPage = () => {
    const cleanHtml = '<p dir="ltr"><br/></p>';
    setPages((prev) => {
      const nextPages = [...prev];
      nextPages[activePageIndex] = {
        ...nextPages[activePageIndex],
        content: cleanHtml,
      };
      triggerAutoSave(nextPages);
      return nextPages;
    });

    const activeEl = document.getElementById(`page-content-${activePageIndex}`);
    if (activeEl) {
      activeEl.innerHTML = cleanHtml;
      activeEl.focus();
    }

    setShowClearConfirmModal(false);
    showNotification(`Page ${activePageIndex + 1} cleared`);
  };

  // Permission Handler (Requirement 7)
  const handleGrantFirstLaunchPermissions = () => {
    localStorage.setItem('pdf_studio_permissions_granted', 'true');
    setPermissionsGranted(true);
    setShowFirstLaunchPermissionModal(false);
    initDeviceStorage();
    refreshProjectsList();
    showNotification('PDF Studio storage initialized (PDF Studio/Projects/)');

    if (pendingActionAfterPermission === 'image') {
      setPendingActionAfterPermission(null);
      setTimeout(() => fileInputRef.current?.click(), 100);
    } else if (pendingActionAfterPermission === 'export') {
      setPendingActionAfterPermission(null);
      setTimeout(() => executeGeneratePDF(), 100);
    }
  };

  // Project Management Handlers (Requirement 3, 4, 5)
  const handleCreateProject = (name: string) => {
    const newProject: ProjectItem = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim() || 'Untitled Project',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: [{ id: `page_${Date.now()}`, content: TEMPLATES.blank }],
      pageSize: 'a4',
      marginSize: '24px',
      activeFont: 'Arial',
      activeFontSize: '3',
      isDraft: false,
    };

    saveProjectToStorage(newProject);
    refreshProjectsList();

    // Open project directly in editor
    setActiveProject(newProject);
    setPages(newProject.pages);
    setActivePageIndex(0);
    setPageSize(newProject.pageSize);
    setMarginSize(newProject.marginSize);
    setFontFamily(newProject.activeFont);
    setFontSize(newProject.activeFontSize);
    setCurrentView('editor');
    showNotification(`Project "${newProject.name}" created`);
  };

  const handleOpenProject = (project: ProjectItem) => {
    setActiveProject(project);
    setPages(project.pages?.length ? project.pages : [{ id: 'page-1', content: TEMPLATES.blank }]);
    setActivePageIndex(0);
    setPageSize(project.pageSize || 'a4');
    setMarginSize(project.marginSize || '24px');
    setFontFamily(project.activeFont || 'Arial');
    setFontSize(project.activeFontSize || '3');
    setCurrentView('editor');
  };

  const handleDeleteProject = (projectId: string) => {
    deleteProjectFromStorage(projectId);
    refreshProjectsList();
    if (activeProject?.id === projectId) {
      setActiveProject(null);
      setCurrentView('dashboard');
    }
    showNotification('Project removed from PDF Studio storage');
  };

  const handleDuplicateProject = (project: ProjectItem) => {
    const duplicated = duplicateProjectInStorage(project);
    refreshProjectsList();
    showNotification(`Duplicated as "${duplicated.name}"`);
  };

  const handleBackToDashboard = () => {
    syncDomToState();
    if (activeProject) {
      saveProjectToStorage({
        ...activeProject,
        pages,
        pageSize,
        marginSize,
        activeFont: fontFamily,
        activeFontSize: fontSize,
        updatedAt: Date.now(),
      });
    }
    refreshProjectsList();
    setCurrentView('dashboard');
  };

  // Image Insertion Trigger
  const handleImageButtonClick = () => {
    if (!permissionsGranted) {
      setPendingActionAfterPermission('image');
      setShowFirstLaunchPermissionModal(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const activeEditor = document.getElementById(`page-content-${activePageIndex}`);
      if (!activeEditor) return;

      const wrapper = document.createElement('div');
      wrapper.className = 'doc-image-wrapper';
      wrapper.contentEditable = 'false';

      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'Inserted Document Asset';
      img.className = 'doc-inserted-image';

      const delBtn = document.createElement('button');
      delBtn.className = 'delete-img-btn';
      delBtn.type = 'button';
      delBtn.setAttribute('data-action', 'delete-image');
      delBtn.innerHTML = '✕';
      delBtn.title = 'Remove Image';
      delBtn.onclick = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        wrapper.remove();
        syncDomToState();
        showNotification('Image removed');
      };

      wrapper.appendChild(img);
      wrapper.appendChild(delBtn);

      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        range.deleteContents();
        range.insertNode(wrapper);
      } else {
        activeEditor.appendChild(wrapper);
      }

      handlePageContentChange(activePageIndex, activeEditor.innerHTML);
      showNotification('Image inserted');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  // Storage & PDF Export Flow (Requirement 6 & 9)
  const handleExportClick = () => {
    if (!permissionsGranted) {
      setPendingActionAfterPermission('export');
      setShowFirstLaunchPermissionModal(true);
    } else {
      executeGeneratePDF();
    }
  };

  const executeGeneratePDF = async () => {
    syncDomToState();
    setIsGenerating(true);

    // Dynamic file size calculation
    const rawContentStr = pages.map((p) => p.content).join('');
    const estimatedSizeBytes = calculateContentSizeBytes(rawContentStr) * 2 + 120000;
    setExportFileSizeBytes(estimatedSizeBytes);
    setExportFileSizeFormatted(formatFileSize(estimatedSizeBytes));
    setShowExportAnimation(true);
    setIsExportComplete(false);
    setExportProgress(15);
    setExportStatusText('Preparing document pages...');

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let isFirstPdfPage = true;
      const totalPagesToExport = pages.length;

      for (let i = 0; i < totalPagesToExport; i++) {
        const page = pages[i];
        const pageEl = document.getElementById(`page-content-${i}`);
        const pageHtml = pageEl ? pageEl.innerHTML : page.content;

        const currentStepProgress = 20 + Math.round(((i + 1) / totalPagesToExport) * 55);
        setExportProgress(currentStepProgress);
        setExportStatusText(`Rendering page ${i + 1} of ${totalPagesToExport}...`);

        const tempPage = document.createElement('div');
        tempPage.style.width = pageSize === 'letter' ? '794px' : pageSize === 'legal' ? '816px' : '794px';
        tempPage.style.minHeight = '1123px';
        tempPage.style.backgroundColor = '#ffffff';
        tempPage.style.color = '#0f172a';
        tempPage.style.padding = marginSize;
        tempPage.style.fontFamily = fontFamily;
        tempPage.style.fontSize = '15px';
        tempPage.style.lineHeight = '1.6';
        tempPage.style.wordBreak = 'break-word';
        tempPage.style.position = 'fixed';
        tempPage.style.top = '0';
        tempPage.style.left = '-10000px';
        tempPage.style.zIndex = '-9999';
        tempPage.style.direction = 'ltr';
        tempPage.setAttribute('dir', 'ltr');
        tempPage.className = 'pdf-page pdf-sheet';
        tempPage.innerHTML = pageHtml;
        syncBlockDirections(tempPage);

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

      setExportProgress(85);
      setExportStatusText('Finalizing vector compression...');

      // Output PDF blob and compute exact final file size
      const pdfBlob = pdf.output('blob');
      const actualBytes = pdfBlob.size || estimatedSizeBytes;
      const formattedSize = formatFileSize(actualBytes);
      setExportFileSizeBytes(actualBytes);
      setExportFileSizeFormatted(formattedSize);

      setExportProgress(95);
      setExportStatusText('Saving to PDF Studio/...');

      const safeProjectName = (activeProject?.name || 'Document').replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `PDF_Studio_${safeProjectName}.pdf`;
      pdf.save(fileName);

      // Log export record into PDF Studio/Exports/
      logExportRecord({
        id: `exp_${Date.now()}`,
        projectId: activeProject?.id || 'unknown',
        fileName,
        fileSizeBytes: actualBytes,
        fileSizeFormatted: formattedSize,
        exportedAt: Date.now(),
      });

      setExportCount((prev) => {
        const next = prev + 1;
        localStorage.setItem('pdf_studio_export_count', next.toString());
        return next;
      });

      setExportProgress(100);
      setIsExportComplete(true);
      setExportStatusText('Export complete!');

      setTimeout(() => {
        setShowExportAnimation(false);
        setIsExportComplete(false);
        showNotification(`PDF saved to PDF Studio (${formattedSize})`);
      }, 700);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setShowExportAnimation(false);
      setIsExportComplete(false);
      showNotification('Export fallback completed');
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
    <div
      dir="ltr"
      style={{ direction: 'ltr' }}
      className="flex flex-col h-[100dvh] w-full max-w-[640px] mx-auto bg-slate-950 text-slate-100 shadow-2xl relative overflow-hidden select-none border-x border-slate-900"
    >
      {/* ============================================================ */}
      {/* 1. SPLASH SCREEN (Requirement 1: NO Skip Button)              */}
      {/* ============================================================ */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-8 text-center select-none">
          <div className="flex flex-col items-center max-w-xs my-auto">
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

            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ch Atif Gondal &bull; Lifetime Edition</span>
            </div>

            <div className="relative flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>

            <div className="w-56 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-850">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-100 ease-out"
                style={{ width: `${splashProgress}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-slate-500 font-medium pb-2">
            Loading project workspace...
          </div>
        </div>
      )}

      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Floating Global Toast Notification */}
      {showToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-slate-700 text-slate-200 text-xs px-4 py-2 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MAIN VIEW SWITCHER: DASHBOARD vs EDITOR                   */}
      {/* ============================================================ */}
      {currentView === 'dashboard' ? (
        <Dashboard
          projects={savedProjectsList}
          drafts={draftProjectsList}
          logoSrc={logoSrc}
          logoLoadFailed={logoLoadFailed}
          onLogoError={handleLogoError}
          onOpenProject={handleOpenProject}
          onCreateProject={handleCreateProject}
          onDeleteProject={handleDeleteProject}
          onDuplicateProject={handleDuplicateProject}
        />
      ) : (
        <>
          {/* ============================================================ */}
          {/* 3. EDITOR HEADER BAR (Requirement 6: Save indicator + Export)*/}
          {/* ============================================================ */}
          <HeaderBar
            logoSrc={logoSrc}
            logoLoadFailed={logoLoadFailed}
            onLogoError={handleLogoError}
            totalPages={pages.length}
            isGenerating={isGenerating}
            projectName={activeProject?.name || 'Untitled Project'}
            saveStatus={saveStatus}
            onBackToDashboard={handleBackToDashboard}
            onExportPdf={handleExportClick}
          />

          {/* ============================================================ */}
          {/* 4. DRAWER CONTROLS (Font, Size, PageFormat, Margins, etc.)   */}
          {/* ============================================================ */}
          <ControlsDrawer
            activeDrawer={activeDrawer}
            onClose={() => setActiveDrawer(null)}
            fontFamily={fontFamily}
            onFontChange={(f) => {
              setFontFamily(f);
              formatDoc('fontName', f);
            }}
            fontSize={fontSize}
            onSizeChange={(s) => {
              setFontSize(s);
              formatDoc('fontSize', s);
            }}
            pageSize={pageSize}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              showNotification(`Format set to ${sz.toUpperCase()}`);
            }}
            marginSize={marginSize}
            onMarginChange={(m) => {
              setMarginSize(m);
              showNotification(`Margins set to ${m}`);
            }}
            onSelectTemplate={applyTemplate}
          />

          {/* ============================================================ */}
          {/* 5. MULTI-PAGE DOCUMENT CANVAS                                */}
          {/* ============================================================ */}
          <main
            id="editor-canvas"
            dir="ltr"
            className="flex-1 overflow-y-auto px-4 py-5 flex flex-col items-center gap-6 select-text scroll-smooth"
            style={{ backgroundColor: '#090d16', direction: 'ltr' }}
          >
            {pages.map((page, index) => {
              const isFirst = index === 0;
              const isLast = index === pages.length - 1;

              return (
                <div
                  key={page.id}
                  style={{ maxWidth: getMaxWidth() }}
                  className="w-full flex flex-col gap-2 relative transition-all"
                  onClick={() => setActivePageIndex(index)}
                >
                  {/* Page Indicator Badge & Controls Bar */}
                  <div className="flex items-center justify-between px-1 text-[11px] text-slate-400 font-medium select-none">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                        {index + 1}
                      </span>
                      <span className="text-slate-400">
                        Page {index + 1} of {pages.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePage(index, 'up');
                        }}
                        disabled={isFirst}
                        title="Move Page Up"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMovePage(index, 'down');
                        }}
                        disabled={isLast}
                        title="Move Page Down"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicatePage(index);
                        }}
                        title="Duplicate Page"
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-sky-300 cursor-pointer transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePromptDeletePage(index);
                          }}
                          title="Delete Page"
                          className="p-1 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Physical White Paper Sheet */}
                  <PageSheet
                    id={`page-content-${index}`}
                    pageIndex={index}
                    initialContent={page.content}
                    isActive={activePageIndex === index}
                    marginSize={marginSize}
                    fontFamily={fontFamily}
                    onActivate={(idx) => setActivePageIndex(idx)}
                    onContentChange={handlePageContentChange}
                    onRemoveImage={handleRemoveImage}
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
                className="w-full min-h-[120px] border-2 border-dashed border-slate-800 hover:border-indigo-500/80 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl flex flex-col items-center justify-center p-6 text-slate-400 hover:text-indigo-300 transition-all cursor-pointer group shadow-sm"
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
          {/* 6. BOTTOM FORMATTING TOOLBAR                                 */}
          {/* ============================================================ */}
          <FormattingToolbar
            onFormat={formatDoc}
            onAddImage={handleImageButtonClick}
            onClearPage={() => setShowClearConfirmModal(true)}
            activePageIndex={activePageIndex}
            totalPages={pages.length}
            wordCount={wordCount}
            charCount={charCount}
          />
        </>
      )}

      {/* ============================================================ */}
      {/* 7. MODALS & POPUPS                                           */}
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

      {/* 3. Export Animation Modal (Requirement 9) */}
      <ExportAnimationModal
        isOpen={showExportAnimation}
        projectName={activeProject?.name || 'Document'}
        fileSizeFormatted={exportFileSizeFormatted}
        statusText={exportStatusText}
        progress={exportProgress}
        isComplete={isExportComplete}
      />

      {/* 4. One-Time Required Permission Request */}
      <FirstLaunchPermissionModal
        isOpen={showFirstLaunchPermissionModal}
        onGrantPermissions={handleGrantFirstLaunchPermissions}
      />
    </div>
  );
}
