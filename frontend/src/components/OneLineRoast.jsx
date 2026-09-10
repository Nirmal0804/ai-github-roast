import { useState } from 'react';

export default function OneLineRoast({ oneLineRoast }) {
  const [copied, setCopied] = useState(false);

  if (!oneLineRoast) return null;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(oneLineRoast);
      } else {
        // Fallback for older browser contexts
        const textarea = document.createElement('textarea');
        textarea.value = oneLineRoast;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy roast to clipboard:', err);
    }
  };

  return (
    <div className="relative p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-pink-950/60 border border-purple-500/50 shadow-lg shadow-purple-950/20 space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
          <span>⚡</span>
          <span>Your GitHub in one sentence</span>
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 border border-purple-700/50 active:scale-95'
          }`}
          title="Copy one-line roast to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <p className="text-base sm:text-lg font-bold text-slate-100 italic leading-relaxed">
        "{oneLineRoast}"
      </p>
    </div>
  );
}
