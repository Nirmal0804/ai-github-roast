import { useState } from 'react';

export default function OneLineRoast({ oneLineRoast }) {
  const [copied, setCopied] = useState(false);

  if (!oneLineRoast) return null;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(oneLineRoast);
      } else {
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
    <div className="relative p-6 sm:p-7 rounded-2xl glass-panel border border-[rgba(168,85,247,0.30)] shadow-[0_15px_45px_rgba(63,13,99,0.35)] space-y-3 overflow-hidden group">
      {/* Subtle purple gradient glow in background */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#6D28A8]/20 blur-3xl rounded-full pointer-events-none" />

      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#A855F7] flex items-center gap-2">
          <span>⚡</span>
          <span>Your GitHub In One Sentence</span>
        </span>

        <button
          type="button"
          onClick={handleCopy}
          className={`no-export inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer select-none ${
            copied
              ? 'bg-[rgba(168,85,247,0.35)] text-white border border-[#A855F7]'
              : 'bg-[rgba(63,13,99,0.35)] hover:bg-[rgba(109,40,168,0.50)] text-[#C4B5D4] hover:text-white border border-[rgba(168,85,247,0.25)] hover:border-[rgba(168,85,247,0.45)] active:scale-95'
          }`}
          title="Copy one-line roast to clipboard"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="relative pl-3 border-l-2 border-[#A855F7]">
        <p className="text-lg sm:text-xl font-bold text-white italic leading-relaxed tracking-tight">
          "{oneLineRoast}"
        </p>
      </div>
    </div>
  );
}
