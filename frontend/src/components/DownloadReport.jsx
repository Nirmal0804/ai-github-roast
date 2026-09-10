import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function DownloadReport({ targetElementId = 'ai-roast-report-export-area', username = 'developer' }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);
  const [exportError, setExportError] = useState('');

  const cleanFilename = (ext) => {
    const safeUser = (username || 'developer').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return `ai-github-roast-${safeUser}.${ext}`;
  };

  const handleDownloadPNG = async () => {
    const el = document.getElementById(targetElementId);
    if (!el || isExporting) return;

    setIsExporting(true);
    setExportType('PNG');
    setExportError('');

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09030F',
        logging: false,
        ignoreElements: (element) => element.classList.contains('no-export'),
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = cleanFilename('png');
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export PNG:', err);
      setExportError('Failed to generate PNG image. Please try again.');
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById(targetElementId);
    if (!el || isExporting) return;

    setIsExporting(true);
    setExportType('PDF');
    setExportError('');

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#09030F',
        logging: false,
        ignoreElements: (element) => element.classList.contains('no-export'),
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(cleanFilename('pdf'));
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setExportError('Failed to generate PDF document. Please try again.');
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
            disabled={isExporting}
            onClick={handleDownloadPNG}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#C4B5D4] hover:text-white bg-[rgba(63,13,99,0.30)] hover:bg-[rgba(109,40,168,0.40)] border border-[rgba(168,85,247,0.25)] hover:border-[rgba(168,85,247,0.45)] transition-all cursor-pointer disabled:opacity-50 select-none shadow-sm"
          >
            {isExporting && exportType === 'PNG' ? (
              <>
                <span className="w-3 h-3 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
                <span>Rendering PNG...</span>
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
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="btn-purple-gradient inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 select-none shadow-lg shadow-[#6D28A8]/30"
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
        <div className="w-full text-xs text-rose-300 bg-rose-950/40 border border-rose-800/40 rounded-xl px-3 py-2 mt-1">
          {exportError}
        </div>
      )}
    </div>
  );
}
