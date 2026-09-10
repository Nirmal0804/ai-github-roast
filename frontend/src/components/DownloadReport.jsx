import { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function DownloadReport({ targetElementId = 'ai-roast-report-content', username = 'developer' }) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState(null);

  const cleanFilename = (ext) => {
    const safeUser = (username || 'developer').toLowerCase().replace(/[^a-z0-9_-]/g, '');
    return `ai-github-roast-${safeUser}.${ext}`;
  };

  const handleDownloadPNG = async () => {
    const el = document.getElementById(targetElementId);
    if (!el || isExporting) return;

    setIsExporting(true);
    setExportType('PNG');

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#030712',
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

    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#030712',
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
    } finally {
      setIsExporting(false);
      setExportType(null);
    }
  };

  return (
    <div className="no-export flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/80 border border-purple-900/40">
      <div className="flex items-center gap-2">
        <span className="text-lg">💾</span>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Download Report
          </h4>
          <p className="text-[11px] text-slate-400">
            Export a high-resolution snapshot for sharing or portfolio records
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isExporting}
          onClick={handleDownloadPNG}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer disabled:opacity-50 select-none shadow-sm"
        >
          {isExporting && exportType === 'PNG' ? (
            <>
              <span className="w-3 h-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>Rendering PNG...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all cursor-pointer disabled:opacity-50 select-none shadow-sm"
        >
          {isExporting && exportType === 'PDF' ? (
            <>
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating PDF...</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Download PDF</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
