import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Image as ImageIcon,
  List,
  ListOrdered,
  RotateCcw,
  Trash2,
  Check,
  Loader2,
  ChevronDown,
  Plus,
  X,
  FileDown,
  Sparkles,
  Layers,
  Smartphone,
  FolderArchive,
} from 'lucide-react';

declare global {
  interface Window {
    html2pdf?: any;
  }
}

type PageSize = 'a4' | 'letter' | 'legal';
type MarginSize = '12px' | '24px' | '36px';

interface PageItem {
  id: string;
  content: string;
}

interface FontOption {
  label: string;
  value: string;
}

interface SizeOption {
  label: string;
  value: string;
}

interface FormatOption {
  label: string;
  value: PageSize;
}

interface MarginOption {
  label: string;
  value: MarginSize;
  description: string;
}

interface TemplateOption {
  label: string;
  key: string;
}

const FONT_OPTIONS: FontOption[] = [
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Monospace', value: 'Courier New' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Trebuchet', value: 'Trebuchet MS' },
];

const SIZE_OPTIONS: SizeOption[] = [
  { label: 'Small', value: '2' },
  { label: 'Normal', value: '3' },
  { label: 'Medium', value: '4' },
  { label: 'Large', value: '5' },
  { label: 'Heading', value: '6' },
];

const FORMAT_OPTIONS: FormatOption[] = [
  { label: 'A4 Size', value: 'a4' },
  { label: 'US Letter', value: 'letter' },
  { label: 'US Legal', value: 'legal' },
];

const MARGIN_OPTIONS: MarginOption[] = [
  { label: 'Narrow', value: '12px', description: '12px (Compact)' },
  { label: 'Normal', value: '24px', description: '24px (Standard)' },
  { label: 'Wide', value: '36px', description: '36px (Spacious)' },
];

const TEMPLATE_OPTIONS: TemplateOption[] = [
  { label: 'Project Summary', key: 'default' },
  { label: 'Business Letter', key: 'letter' },
  { label: 'Client Invoice', key: 'invoice' },
  { label: 'Blank Sheet', key: 'blank' },
];

const TEMPLATES: Record<string, string> = {
  default: `
    <h1 style="margin-bottom: 6px; font-weight: 700; color: #0f172a; font-size: 22px;">Executive Document Summary</h1>
    <p style="color: #64748b; font-size: 13px; margin-bottom: 14px;">Mobile PDF Studio &bull; Prepared by Ch Atif Gondal</p>
    
    <p style="margin-bottom: 10px;">This live preview document can be edited directly. Tap anywhere on the page to customize your text, modify styles, and insert media.</p>
    
    <h2 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 14px; margin-bottom: 8px;">Key Capabilities</h2>
    <ul style="margin-left: 20px; list-style-type: disc; margin-bottom: 12px; color: #334155;">
      <li><b>Multi-Page Architecture:</b> Add extra pages easily and review everything live.</li>
      <li><b>Custom Layouts:</b> Configure paper dimensions, margins, and custom typography.</li>
      <li><b>Photo & Media Integration:</b> Import images from your device gallery with permission safeguards.</li>
      <li><b>Accurate Export:</b> Only active, populated pages are rendered into your PDF file.</li>
    </ul>

    <p style="color: #475569; font-size: 14px;">Tap <b>Export PDF</b> in the header above to compile and save this document to your device.</p>
  `,
  letter: `
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 20px;">
      <div>
        <h2 style="margin: 0; font-size: 20px; color: #1e293b; font-weight: 700;">Acme Corporation</h2>
        <p style="margin: 2px 0 0; color: #64748b; font-size: 13px;">123 Innovation Way, Suite 400</p>
      </div>
      <div style="text-align: right; color: #64748b; font-size: 13px;">
        <p style="margin: 0;">Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p style="margin: 2px 0 0;">Ref: #DOC-2026</p>
      </div>
    </div>
    <p style="margin-bottom: 14px;"><b>Dear Valued Partner,</b></p>
    <p style="margin-bottom: 12px;">We are pleased to share our project proposal with your organization. Our team is committed to delivering quality solutions tailored to your operational goals.</p>
    <p style="margin-bottom: 12px;">Please review the attached project schedule and milestone delivery dates. If you have any inquiries or require further adjustments, please contact us anytime.</p>
    <br/>
    <p style="margin: 0;">Sincerely,</p>
    <p style="margin: 4px 0 0; font-weight: 600;">Executive Director</p>
  `,
  invoice: `
    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 2px solid #3b82f6; padding-bottom: 14px;">
      <div>
        <h1 style="margin: 0; color: #1e3a8a; font-size: 24px; font-weight: 800;">INVOICE</h1>
        <p style="margin: 4px 0 0; color: #6b7280; font-size: 13px;">Invoice #: INV-${new Date().getFullYear()}-001</p>
      </div>
      <div style="text-align: right; font-size: 13px; color: #4b5563;">
        <p style="margin: 0; font-weight: 600; color: #111827;">Studio Productions</p>
        <p style="margin: 2px 0 0;">billing@company.com</p>
      </div>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: left;">
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1;">Description</th>
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align: center;">Qty</th>
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align: right;">Rate</th>
          <th style="padding: 8px; border-bottom: 1px solid #cbd5e1; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Document & PDF Architecture</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">1</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$450.00</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$450.00</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Mobile Application Optimization</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">1</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$950.00</td>
          <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$950.00</td>
        </tr>
      </tbody>
    </table>
    <div style="text-align: right; margin-top: 14px;">
      <p style="font-size: 15px; margin: 0; font-weight: 700; color: #111827;">Total Due: $1,400.00</p>
      <p style="font-size: 12px; color: #64748b; margin: 4px 0 0;">Payment terms: 15 Days</p>
    </div>
  `,
  blank: `<p><br/></p>`,
};

type ActiveDrawer = 'font' | 'size' | 'format' | 'margin' | 'template' | null;

export default function App() {
  // Splash Screen state (lasts ~4.5 seconds on launch)
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

  // Multi-page state
  const [pages, setPages] = useState<PageItem[]>([
    { id: 'page-1', content: TEMPLATES.default },
  ]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);

  // Document Styling state
  const [pageSize, setPageSize] = useState<PageSize>('a4');
  const [marginSize, setMarginSize] = useState<MarginSize>('24px');
  const [fontFamily, setFontFamily] = useState<string>('Arial');
  const [fontSize, setFontSize] = useState<string>('3');

  // Drawer state (daraz that slides open underneath the top buttons)
  const [activeDrawer, setActiveDrawer] = useState<ActiveDrawer>(null);

  // Export and Toast state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Permission states
  const [galleryPermissionGranted, setGalleryPermissionGranted] = useState<boolean>(() => {
    return localStorage.getItem('gallery_permission_granted') === 'true';
  });
  const [storagePermissionGranted, setStoragePermissionGranted] = useState<boolean>(() => {
    return localStorage.getItem('storage_permission_granted') === 'true';
  });

  // Permission Modals
  const [showGalleryPermissionModal, setShowGalleryPermissionModal] = useState<boolean>(false);
  const [showStoragePermissionModal, setShowStoragePermissionModal] = useState<boolean>(false);
  const [showApkModal, setShowApkModal] = useState<boolean>(false);

  // Hidden print container ref for clean multi-page export
  const printContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Splash Screen Timer & Progress animation (4.5 seconds)
  useEffect(() => {
    const duration = 4200;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setSplashProgress((prev) => {
        const next = prev + step;
        if (next >= 100) {
          clearInterval(timer);
          setTimeout(() => setShowSplash(false), 300);
          return 100;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  const showNotification = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => {
      setShowToast(null);
    }, 3000);
  };

  // Rich Text command formatting
  const formatDoc = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value ?? undefined);
    // Find active page editable ref
    const el = document.getElementById(`page-content-${activePageIndex}`);
    if (el) {
      el.focus();
    }
  };

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
      showNotification('Template applied to current page');
    }
  };

  // Add new page
  const handleAddNewPage = () => {
    const newPageId = `page-${Date.now()}`;
    setPages((prev) => [...prev, { id: newPageId, content: '<p><br></p>' }]);
    const newIndex = pages.length;
    setActivePageIndex(newIndex);
    showNotification(`Page ${newIndex + 1} added`);

    // Auto-scroll to the new page
    setTimeout(() => {
      const newPageEl = document.getElementById(`page-container-${newIndex}`);
      newPageEl?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Remove page
  const handleRemovePage = (indexToRemove: number) => {
    if (pages.length <= 1) {
      showNotification('Document must have at least one page');
      return;
    }
    if (window.confirm(`Are you sure you want to remove Page ${indexToRemove + 1}?`)) {
      setPages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
      if (activePageIndex >= indexToRemove) {
        setActivePageIndex(Math.max(0, activePageIndex - 1));
      }
      showNotification(`Page ${indexToRemove + 1} removed`);
    }
  };

  // Gallery Permission Flow for Image Insertion
  const handleImageButtonClick = () => {
    if (!galleryPermissionGranted) {
      setShowGalleryPermissionModal(true);
    } else {
      fileInputRef.current?.click();
    }
  };

  const grantGalleryPermission = () => {
    localStorage.setItem('gallery_permission_granted', 'true');
    setGalleryPermissionGranted(true);
    setShowGalleryPermissionModal(false);
    showNotification('Gallery permission granted');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 150);
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
      };

      wrapper.appendChild(img);
      wrapper.appendChild(delBtn);

      targetEl.appendChild(wrapper);

      // Add a trailing line for typing
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      targetEl.appendChild(p);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showNotification('Image inserted into page');
    };
    reader.readAsDataURL(file);
  };

  // Storage Permission Flow for PDF Export
  const handleExportClick = () => {
    if (!storagePermissionGranted) {
      setShowStoragePermissionModal(true);
    } else {
      executeGeneratePDF();
    }
  };

  const grantStoragePermission = () => {
    localStorage.setItem('storage_permission_granted', 'true');
    setStoragePermissionGranted(true);
    setShowStoragePermissionModal(false);
    showNotification('Storage permission granted');
    setTimeout(() => {
      executeGeneratePDF();
    }, 150);
  };

  // Clear current document page
  const handleClearCurrentPage = () => {
    if (window.confirm(`Clear content of Page ${activePageIndex + 1}?`)) {
      const el = document.getElementById(`page-content-${activePageIndex}`);
      if (el) {
        el.innerHTML = '<p><br></p>';
        el.focus();
        showNotification('Page content cleared');
      }
    }
  };

  // Execute High-Quality Multi-Page PDF Export using html2canvas-pro & jsPDF (Native oklch support)
  const executeGeneratePDF = async () => {
    if (isGenerating) return;

    setIsGenerating(true);

    try {
      // Gather active content from each page container
      const renderedPagesHtml: string[] = [];

      pages.forEach((_, idx) => {
        const pageEl = document.getElementById(`page-content-${idx}`);
        if (pageEl) {
          const textContent = pageEl.innerText.trim();
          const hasImages = pageEl.querySelector('img') !== null;

          // Only keep pages that have text or images, or keep page 1 if document is blank
          if (textContent.length > 0 || hasImages || idx === 0) {
            // Clone to hide delete buttons on embedded images
            const clone = pageEl.cloneNode(true) as HTMLElement;
            clone.querySelectorAll('.delete-img-btn').forEach((b) => ((b as HTMLElement).style.display = 'none'));
            renderedPagesHtml.push(clone.innerHTML);
          }
        }
      });

      if (renderedPagesHtml.length === 0) {
        renderedPagesHtml.push('<p><br></p>');
      }

      // Initialize jsPDF document with requested format
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

        // Create temporary offscreen sheet container with standard hex colors
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

        // Render to canvas using html2canvas-pro which natively supports oklch, lab, and all modern CSS colors
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
          // If page has lots of vertical overflow, slice across pages smoothly
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
      pdf.save(`document_${new Date().toISOString().slice(0, 10)}.pdf`);
      showNotification('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while exporting the PDF: ' + (error instanceof Error ? error.message : String(error)));
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

  const currentFontLabel = FONT_OPTIONS.find((f) => f.value === fontFamily)?.label || 'Font';
  const currentSizeLabel = SIZE_OPTIONS.find((s) => s.value === fontSize)?.label || 'Size';
  const currentFormatLabel = FORMAT_OPTIONS.find((p) => p.value === pageSize)?.label || 'Format';
  const currentMarginLabel = MARGIN_OPTIONS.find((m) => m.value === marginSize)?.label || 'Margin';

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-[640px] mx-auto bg-slate-900 text-slate-100 shadow-2xl relative overflow-hidden select-none">
      {/* ============================================================ */}
      {/* 1. SPLASH SCREEN (Runs ~4.5 seconds on App launch)           */}
      {/* ============================================================ */}
      {showSplash && (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-8 text-center animate-fade-in select-none">
          <div className="w-full" />

          {/* Center Branding */}
          <div className="flex flex-col items-center max-w-xs">
            <div className="relative mb-5">
              {/* Official Logo with Fallback */}
              {!logoLoadFailed ? (
                <img
                  src={logoSrc}
                  alt="PDF Studio Logo"
                  onError={handleLogoError}
                  className="w-24 h-24 rounded-2xl object-contain shadow-2xl border-2 border-slate-700/60 p-2 bg-slate-900"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 via-sky-600 to-indigo-800 flex items-center justify-center shadow-2xl border-2 border-indigo-400/40">
                  <FileText className="w-12 h-12 text-white stroke-[2.2]" />
                </div>
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white mb-1">
              PDF Studio
            </h1>

            {/* Requested Developer Credit */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ch Atif Gondal</span>
            </div>

            {/* Spinning Circle Indicator */}
            <div className="relative flex items-center justify-center mb-4">
              <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
            </div>

            {/* Smooth Progress Bar */}
            <div className="w-56 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 transition-all duration-100 ease-out"
                style={{ width: `${splashProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-medium tracking-wide">
              Initializing Studio &bull; {Math.round(splashProgress)}%
            </span>
          </div>

          {/* Bottom Footer Credit on Splash */}
          <div className="text-[11px] text-slate-500 font-medium">
            Developed by <span className="text-slate-400 font-semibold">Ch Atif Gondal</span>
          </div>
        </div>
      )}

      {/* Toast feedback banner */}
      {showToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 pointer-events-none transition-all">
          <Check className="w-3.5 h-3.5" />
          <span>{showToast}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. HEADER BAR (Export PDF button, no offline tags)           */}
      {/* ============================================================ */}
      <header
        id="app-header"
        className="h-12 flex items-center justify-between px-3.5 bg-slate-800/95 border-b border-slate-700/80 shrink-0 backdrop-blur z-20"
      >
        <div className="flex items-center gap-2">
          {!logoLoadFailed ? (
            <img
              src={logoSrc}
              alt="Logo"
              onError={handleLogoError}
              className="w-6 h-6 rounded object-contain bg-slate-900 border border-slate-700/60 p-0.5"
            />
          ) : (
            <FileText className="w-4 h-4 text-sky-400 stroke-[2.2]" />
          )}
          <span className="font-bold text-sm text-sky-400 tracking-wide">PDF Studio</span>
          <span className="text-[11px] text-slate-400 font-medium ml-1">
            ({pages.length} {pages.length === 1 ? 'Page' : 'Pages'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Release APK button */}
          <button
            id="apkBtn"
            type="button"
            onClick={() => setShowApkModal(true)}
            title="Download Android Release APK"
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white border-0 px-2.5 py-1.5 text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Release APK</span>
            <span className="sm:hidden">APK</span>
          </button>

          {/* Requested "Export PDF" button */}
          <button
            id="exportBtn"
            type="button"
            onClick={handleExportClick}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white border-0 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileDown className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Export PDF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. TOP DOCUMENT CONTROLS & IN-APP DRAWER (Daraz)             */}
      {/* ============================================================ */}
      <div className="shrink-0 z-30 bg-slate-800/95 border-b border-slate-700/80">
        {/* Horizontal button shelf */}
        <div
          id="doc-controls-bar"
          className="flex items-center gap-1.5 px-2.5 py-2 overflow-x-auto no-scrollbar text-xs"
        >
          {/* Font Button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'font' ? null : 'font')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors shrink-0 ${
              activeDrawer === 'font'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span>{currentFontLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeDrawer === 'font' ? 'rotate-180' : ''}`} />
          </button>

          {/* Size Button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'size' ? null : 'size')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors shrink-0 ${
              activeDrawer === 'size'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span>{currentSizeLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeDrawer === 'size' ? 'rotate-180' : ''}`} />
          </button>

          {/* Format Button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'format' ? null : 'format')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors shrink-0 ${
              activeDrawer === 'format'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span>{currentFormatLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeDrawer === 'format' ? 'rotate-180' : ''}`} />
          </button>

          {/* Margin Button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'margin' ? null : 'margin')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors shrink-0 ${
              activeDrawer === 'margin'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span>{currentMarginLabel}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeDrawer === 'margin' ? 'rotate-180' : ''}`} />
          </button>

          {/* Templates Button */}
          <button
            type="button"
            onClick={() => setActiveDrawer(activeDrawer === 'template' ? null : 'template')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-colors shrink-0 ${
              activeDrawer === 'template'
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            <span>Presets</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${activeDrawer === 'template' ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* IN-APP DRAWER (Daraz) that slides down directly underneath the bar */}
        {activeDrawer && (
          <div className="bg-slate-900/95 border-t border-slate-700/80 px-3 py-2.5 shadow-inner transition-all duration-200">
            {/* Font Drawer */}
            {activeDrawer === 'font' && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <span>SELECT TYPOGRAPHY</span>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => handleSelectFont(f.value)}
                      className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                        fontFamily === f.value
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span style={{ fontFamily: f.value }}>{f.label}</span>
                      {fontFamily === f.value && <Check className="w-3.5 h-3.5 ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Drawer */}
            {activeDrawer === 'size' && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <span>TEXT HIERARCHY / SIZE</span>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {SIZE_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => handleSelectFontSize(s.value)}
                      className={`px-2 py-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                        fontSize === s.value
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span>{s.label}</span>
                      {fontSize === s.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Format Drawer */}
            {activeDrawer === 'format' && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <span>PAPER FORMAT DIMENSIONS</span>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {FORMAT_OPTIONS.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => handleSelectPageSize(p.value)}
                      className={`px-3 py-2 rounded-lg text-xs flex items-center justify-between border transition-all ${
                        pageSize === p.value
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <span>{p.label}</span>
                      {pageSize === p.value && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Margin Drawer */}
            {activeDrawer === 'margin' && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <span>PAGE MARGIN SPACING</span>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MARGIN_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => handleSelectMargin(m.value)}
                      className={`px-3 py-2 rounded-lg text-xs flex flex-col border transition-all ${
                        marginSize === m.value
                          ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow'
                          : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{m.label}</span>
                        {marginSize === m.value && <Check className="w-3 h-3" />}
                      </div>
                      <span className={`text-[10px] mt-0.5 ${marginSize === m.value ? 'text-indigo-100' : 'text-slate-400'}`}>
                        {m.description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Template Drawer */}
            {activeDrawer === 'template' && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <span>INSERT PRESET TEMPLATE</span>
                  <button
                    type="button"
                    onClick={() => setActiveDrawer(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {TEMPLATE_OPTIONS.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => handleSelectTemplate(t.key)}
                      className="px-3 py-2 rounded-lg text-xs bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all text-left font-medium"
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

      {/* ============================================================ */}
      {/* 4. LIVE PREVIEW AREA WITH MULTI-PAGE SHEETS & ADD PAGE BOX   */}
      {/* ============================================================ */}
      <main
        id="preview-viewport"
        className="flex-1 overflow-y-auto bg-slate-950 p-3 sm:p-4 flex flex-col items-center gap-6 relative select-text"
      >
        {pages.map((page, index) => (
          <div
            key={page.id}
            id={`page-container-${index}`}
            className="w-full flex flex-col items-center"
            onClick={() => setActivePageIndex(index)}
          >
            {/* Page Header Indicator */}
            <div
              style={{ maxWidth: getMaxWidth() }}
              className="w-full flex items-center justify-between px-2 py-1 text-slate-400 text-[11px] font-semibold select-none mb-1.5"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`px-2 py-0.5 rounded ${
                    activePageIndex === index
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Page {index + 1} of {pages.length}
                </span>
                {activePageIndex === index && (
                  <span className="text-[10px] text-sky-400 font-normal">Active Editing</span>
                )}
              </div>

              {pages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemovePage(index);
                  }}
                  title="Remove this page"
                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 bg-rose-950/40 border border-rose-900/60 px-2 py-0.5 rounded text-[10px] transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Page</span>
                </button>
              )}
            </div>

            {/* The Actual Editable Paper Sheet */}
            <div
              id={`page-content-${index}`}
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              dangerouslySetInnerHTML={{ __html: page.content }}
              style={{
                padding: marginSize,
                maxWidth: getMaxWidth(),
                fontFamily: fontFamily,
              }}
              onFocus={() => setActivePageIndex(index)}
              className="pdf-sheet w-full min-h-[520px] rounded shadow-2xl transition-all duration-150 relative cursor-text outline-none"
            />
          </div>
        ))}

        {/* ============================================================ */}
        {/* ADD PAGE BOX (Dashed placeholder page with big Plus icon)   */}
        {/* ============================================================ */}
        <div
          style={{ maxWidth: getMaxWidth() }}
          className="w-full select-none pb-4"
        >
          <button
            type="button"
            onClick={handleAddNewPage}
            className="w-full min-h-[160px] border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-slate-900/50 rounded-lg flex flex-col items-center justify-center p-6 text-slate-400 hover:text-indigo-400 transition-all cursor-pointer group shadow-md"
          >
            <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white flex items-center justify-center mb-2.5 transition-all shadow-lg">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="font-bold text-sm text-slate-200 group-hover:text-white mb-0.5">
              + Add Page {pages.length + 1}
            </span>
            <span className="text-xs text-slate-500 group-hover:text-slate-400">
              Tap to append a new blank sheet to this document
            </span>
          </button>
        </div>
      </main>

      {/* ============================================================ */}
      {/* 5. BOTTOM TEXT & MEDIA FORMATTING TOOLBAR                    */}
      {/* ============================================================ */}
      <footer
        id="toolbar-footer"
        className="bg-slate-800 border-t border-slate-700 p-2 flex flex-col gap-1.5 shrink-0 select-none z-20"
      >
        {/* Row 1: Formatting & Text Alignment */}
        <div className="flex gap-1.5 items-center justify-between overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => formatDoc('bold')}
            title="Bold"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center font-bold text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('italic')}
            title="Italic"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center italic text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('underline')}
            title="Underline"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center underline text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('justifyLeft')}
            title="Align Left"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('justifyCenter')}
            title="Align Center"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <AlignCenter className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('justifyRight')}
            title="Align Right"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <AlignRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => formatDoc('justifyFull')}
            title="Justify Text"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <AlignJustify className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Row 2: Media, Lists, Actions, and Developer Credit */}
        <div className="flex gap-1.5 items-center justify-between overflow-x-auto no-scrollbar">
          {/* Insert Image with Gallery Permission */}
          <button
            type="button"
            onClick={handleImageButtonClick}
            title="Add Image from Gallery"
            className="flex-[1.6] min-w-[86px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            <span>+ Image</span>
          </button>

          <input
            id="imageInput"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => formatDoc('insertUnorderedList')}
            title="Bullet List"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => formatDoc('insertOrderedList')}
            title="Numbered List"
            className="flex-1 min-w-[34px] h-8 bg-slate-900/90 border border-slate-700 text-slate-200 rounded flex items-center justify-center text-xs hover:bg-slate-700 active:bg-indigo-600 transition-colors"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>

          {/* Clear Formatting */}
          <button
            type="button"
            onClick={() => formatDoc('removeFormat')}
            title="Reset Formatting"
            className="flex-1 min-w-[48px] h-8 bg-slate-900/90 border border-slate-700 text-slate-300 rounded flex items-center justify-center gap-1 text-[11px] font-medium hover:bg-slate-700 active:bg-slate-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {/* Empty Current Page */}
          <button
            type="button"
            onClick={handleClearCurrentPage}
            title="Clear current page"
            className="flex-1 min-w-[48px] h-8 bg-rose-950/40 border border-rose-800/60 text-rose-400 rounded flex items-center justify-center gap-1 text-[11px] font-semibold hover:bg-rose-900/60 active:bg-rose-800 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Empty</span>
          </button>
        </div>

        {/* Developer Credit Line */}
        <div className="text-center text-[10px] text-slate-500 pt-0.5 select-none">
          Developed by <span className="text-slate-400 font-semibold">Ch Atif Gondal</span>
        </div>
      </footer>

      {/* ============================================================ */}
      {/* 6. PERMISSION MODALS (Gallery & Storage Access)              */}
      {/* ============================================================ */}

      {/* 1. GALLERY PERMISSION MODAL */}
      {showGalleryPermissionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl text-center">
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
                onClick={grantGalleryPermission}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition-colors"
              >
                Allow Gallery Access
              </button>
              <button
                type="button"
                onClick={() => setShowGalleryPermissionModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. STORAGE / EXPORT PERMISSION MODAL */}
      {showStoragePermissionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-sm w-full p-5 shadow-2xl text-center">
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
                onClick={grantStoragePermission}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-md transition-colors"
              >
                Allow & Save PDF
              </button>
              <button
                type="button"
                onClick={() => setShowStoragePermissionModal(false)}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 3. RELEASE APK & SOURCE DOWNLOAD MODAL */}
      {showApkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3.5">
          <div className="bg-slate-900 border border-slate-700/90 rounded-2xl max-w-md w-full p-5 shadow-2xl relative text-left">
            <button
              type="button"
              onClick={() => setShowApkModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoSrc}
                alt="Logo"
                onError={handleLogoError}
                className="w-11 h-11 rounded-xl object-contain bg-slate-950 border border-slate-700/80 p-1 shadow"
              />
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">PDF Studio — Release APK</h3>
                <p className="text-xs text-sky-400 font-medium">Developed by Ch Atif Gondal</p>
              </div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3 mb-4 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="text-[11px] text-emerald-200">
                <p className="font-semibold text-emerald-300">Verified & Signed Release Package</p>
                <p className="text-emerald-400/80">v1, v2 & v3 schemes verified • Works on Android 5.0 to 14+</p>
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
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 active:scale-[0.99] text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-700 flex items-center justify-between transition-all"
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
              <p className="text-slate-300 font-sans font-semibold mb-1">Project File Locations:</p>
              <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                <span className="text-slate-400">APK File:</span>
                <span className="text-emerald-400">/release/PDF_Studio_Release.apk</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                <span className="text-slate-400">Source Zip:</span>
                <span className="text-sky-400">/release/PDF_Studio_Project_Source.zip</span>
              </div>
              <div className="flex justify-between items-center bg-slate-900/80 px-2 py-1 rounded">
                <span className="text-slate-400">Keystore:</span>
                <span className="text-amber-400">/release/release.keystore</span>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowApkModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
