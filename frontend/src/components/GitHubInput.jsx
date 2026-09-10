import { useState } from 'react';

export default function GitHubInput({ onSubmit, isLoading, initialValue = '' }) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleSampleClick = (sample) => {
    setValue(sample);
    if (!isLoading) {
      onSubmit(sample);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3.5">
      <div className="relative flex flex-col sm:flex-row gap-2.5 p-2 rounded-2xl glass-input-container transition-all duration-300 focus-within:border-[rgba(168,85,247,0.6)] focus-within:ring-2 focus-within:ring-[rgba(168,85,247,0.25)] focus-within:shadow-[0_0_30px_rgba(168,85,247,0.2)]">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-4 flex items-center pointer-events-none text-[#C4B5D4]">
            <svg
              className="w-5 h-5 text-[#A855F7]"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isLoading}
            placeholder="Enter GitHub username or profile URL"
            className="w-full pl-12 pr-9 py-3.5 sm:py-3 bg-transparent text-white placeholder-[#8F7D9E] focus:outline-none text-sm sm:text-base font-medium disabled:opacity-50 tracking-wide"
            autoComplete="off"
            spellCheck="false"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              disabled={isLoading}
              className="absolute right-3 text-[#8F7D9E] hover:text-white transition-colors p-1"
              aria-label="Clear input"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !value.trim()}
          className="btn-purple-gradient relative inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 rounded-xl font-bold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none cursor-pointer whitespace-nowrap shrink-0 shadow-lg shadow-[#6D28A8]/30"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <span>Roast My GitHub</span>
              <span>🔥</span>
            </>
          )}
        </button>
      </div>

      {/* Sample username chips in glass styling */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-[#C4B5D4] px-2">
        <span className="text-[#C4B5D4]/80">
          Enter a username or <code className="text-white font-mono text-[11px] bg-[rgba(63,13,99,0.35)] px-2 py-0.5 rounded border border-[rgba(168,85,247,0.2)]">github.com/profile</code>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[#8F7D9E]">Try:</span>
          <button
            type="button"
            onClick={() => handleSampleClick('torvalds')}
            className="px-2.5 py-0.5 rounded-lg text-xs font-mono text-[#A855F7] hover:text-white bg-[rgba(63,13,99,0.30)] hover:bg-[rgba(109,40,168,0.40)] border border-[rgba(168,85,247,0.20)] hover:border-[rgba(168,85,247,0.40)] transition-all cursor-pointer"
          >
            torvalds
          </button>
          <button
            type="button"
            onClick={() => handleSampleClick('shadcn')}
            className="px-2.5 py-0.5 rounded-lg text-xs font-mono text-[#A855F7] hover:text-white bg-[rgba(63,13,99,0.30)] hover:bg-[rgba(109,40,168,0.40)] border border-[rgba(168,85,247,0.20)] hover:border-[rgba(168,85,247,0.40)] transition-all cursor-pointer"
          >
            shadcn
          </button>
        </div>
      </div>
    </form>
  );
}
