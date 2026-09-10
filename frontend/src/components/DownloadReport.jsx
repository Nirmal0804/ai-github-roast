import { useState } from 'react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

export default function DownloadReport({
  targetElementId = 'roast-report-export',
  username = 'developer',
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null); // 'PNG' | 'PDF' | null
  const [exportError, setExportError] = useState('');

  const getSafeUsername = () => {
    const safe = (username || 'developer').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return safe || 'developer';
  };

  /**
   * Waits for document fonts to finish loading with a fallback timeout.
   */
  const waitForFonts = async () => {
    if (document.fonts && document.fonts.ready) {
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 2000)),
        ]);
      } catch {
        // Fallback gracefully on font timeout
      }
    }
  };

  /**
   * Waits for all images inside the report element to load with a fallback timeout.
   */
  const waitForImages = async (element) => {
    const images = Array.from(element.querySelectorAll('img'));
    if (images.length === 0) return;

    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve();
        return new Promise((resolve) => {
          const timer = setTimeout(resolve, 2500);
          img.onload = () => {
            clearTimeout(timer);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timer);
            resolve();
          };
        });
      })
    );
  };

  /**
   * Tests whether an image can be drawn to an offscreen canvas without tainting it.
   */
  const isImageSafeForExport = (img) => {
    if (!img || !img.complete || img.naturalWidth === 0) return false;
    try {
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 1;
      testCanvas.height = 1;
      const ctx = testCanvas.getContext('2d');
      if (!ctx) return false;
      ctx.drawImage(img, 0, 0, 1, 1);
      testCanvas.toDataURL('image/png');
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Finds the target report container element.
   */
  const getTargetElement = () => {
    return (
      document.getElementById(targetElementId) ||
      document.getElementById('roast-report-export') ||
      document.getElementById('ai-roast-report-export-area')
    );
  };

  /**
   * Captures the report DOM element into a high-resolution canvas safely.
   */
  const captureReportCanvas = async (targetEl) => {
    if (!targetEl) {
      throw new Error('Report element not found');
    }

    if (targetEl.offsetWidth === 0 || targetEl.offsetHeight === 0) {
      throw new Error('Report element is not visible');
    }

    // 1. Wait for fonts and images to settle
    await waitForFonts();
    await waitForImages(targetEl);

    // 2. Capture using html2canvas with production-safe options
    const canvas = await html2canvas(targetEl, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#09030F',
      logging: false,
      imageTimeout: 15000,
      windowWidth: 1280,
      ignoreElements: (element) => {
        return (
          element?.classList?.contains('no-export') ||
          element?.getAttribute?.('data-no-export') === 'true'
        );
      },
      onclone: (clonedDoc) => {
        const clonedEl =
          clonedDoc.getElementById(targetElementId) ||
          clonedDoc.getElementById('roast-report-export') ||
          clonedDoc.getElementById('ai-roast-report-export-area');

        if (clonedEl) {
          clonedEl.style.width = '1080px';
          clonedEl.style.maxWidth = '1080px';
          clonedEl.style.minWidth = '1080px';
          clonedEl.style.boxSizing = 'border-box';
          clonedEl.style.backgroundColor = '#09030F';
          clonedEl.style.margin = '0 auto';
          clonedEl.style.overflow = 'visible';
        }

        // Safety check on cloned images to guarantee zero canvas tainting
        const clonedImages = Array.from(clonedDoc.querySelectorAll('img'));
        const docImages = Array.from(document.querySelectorAll('img'));

        clonedImages.forEach((clonedImg) => {
          const originalImg = docImages.find((img) => img.src === clonedImg.src);
          let inlined = false;

          if (originalImg && originalImg.complete && originalImg.naturalWidth > 0) {
            try {
              const testCanvas = document.createElement('canvas');
              testCanvas.width = originalImg.naturalWidth;
              testCanvas.height = originalImg.naturalHeight;
              const testCtx = testCanvas.getContext('2d');
              if (testCtx) {
                testCtx.drawImage(originalImg, 0, 0);
                clonedImg.src = testCanvas.toDataURL('image/png');
                inlined = true;
              }
            } catch {
              inlined = false;
            }
          }

          if (!inlined) {
            // Gracefully replace with stylized fallback badge to guarantee canvas is never tainted
            const fallback = clonedDoc.createElement('div');
            fallback.className =
              'w-16 h-16 rounded-2xl bg-[rgba(63,13,99,0.80)] border border-[rgba(168,85,247,0.50)] flex items-center justify-center text-2xl font-black text-[#A855F7] shadow-[0_0_20px_rgba(109,40,168,0.30)]';
            fallback.textContent = (username || 'G').charAt(0).toUpperCase();
            clonedImg.parentNode?.replaceChild(fallback, clonedImg);
          }
        });
      },
    });

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas render yielded empty dimensions');
    }

    return canvas;
  };

  /**
   * Helper to trigger a robust browser download from a Blob object URL.
   */
  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const handleDownloadPNG = async () => {
    if (isExporting) return;

    const el = getTargetElement();
    if (!el) {
      setExportError("Couldn't generate the PNG. Please try again.");
      return;
    }

    setIsExporting(true);
    setExportType('PNG');
    setExportError('');

    try {
      const canvas = await captureReportCanvas(el);

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
          else reject(new Error('Canvas toBlob conversion failed'));
        }, 'image/png');
      });

      downloadBlob(blob, `github-roast-${getSafeUsername()}.png`);
    } catch (err) {
      console.error('Failed to export PNG:', err);
      setExportError("Couldn't generate the PNG. Please try again.");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (isExporting) return;

    const el = getTargetElement();
    if (!el) {
      setExportError("Couldn't generate the PDF. Please try again.");
      return;
    }

    setIsExporting(true);
    setExportType('PDF');
    setExportError('');

    try {
      const canvas = await captureReportCanvas(el);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      // Calculate slice height in pixel units matching A4 portrait aspect ratio
      const pageSliceHeightPx = Math.floor((canvasWidth * pageHeightMm) / pageWidthMm);
      const totalPages = Math.max(1, Math.ceil(canvasHeight / pageSliceHeightPx));

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }

        const srcY = i * pageSliceHeightPx;
        const srcHeight = Math.min(pageSliceHeightPx, canvasHeight - srcY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = pageSliceHeightPx;
        const pageCtx = pageCanvas.getContext('2d');

        if (pageCtx) {
          // Fill background to preserve dark purple theme seamlessly
          pageCtx.fillStyle = '#09030F';
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          // Draw vertical slice
          pageCtx.drawImage(
            canvas,
            0,
            srcY,
            canvasWidth,
            srcHeight,
            0,
            0,
            canvasWidth,
            srcHeight
          );
        }

        const pageImgData = pageCanvas.toDataURL('image/png');
        pdf.addImage(
          pageImgData,
          'PNG',
          0,
          0,
          pageWidthMm,
          pageHeightMm,
          undefined,
          'FAST'
        );
      }

      const pdfBlob = pdf.output('blob');
      downloadBlob(pdfBlob, `github-roast-${getSafeUsername()}.pdf`);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setExportError("Couldn't generate the PDF. Please try again.");
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="no-export flex flex-col gap-2 p-4 sm:p-5 rounded-2xl glass-panel border border-[rgba(168,85,247,0.22)] shadow-[0_15px_40px_rgba(0,0,0,0.30)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">💾</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Download Report
            </h4>
            <p className="text-[11px] text-[#C4B5D4]">
              Export a high-resolution snapshot for sharing or portfolio records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            id="download-report-png-btn"
            disabled={isExporting}
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#C4B5D4] hover:text-white bg-[rgba(63,13,99,0.30)] hover:bg-[rgba(109,40,168,0.40)] border border-[rgba(168,85,247,0.25)] hover:border-[rgba(168,85,247,0.45)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-sm"
          >
            {isExporting && exportType === 'PNG' ? (
              <>
                <span className="w-3 h-3 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
                <span>Generating PNG...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download PNG</span>
              </>
            )}
          </button>

          <button
            type="button"
            id="download-report-pdf-btn"
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="btn-purple-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-lg shadow-[#6D28A8]/30"
          >
            {isExporting && exportType === 'PDF' ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Download PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="w-full text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl px-3 py-2 mt-1 animate-fade-in">
          {exportError}
        </div>
      )}
    </div>
  );
}
