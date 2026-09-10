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
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      <div className="relative flex flex-col sm:flex-row gap-2.5 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl shadow-purple-950/20 backdrop-blur-xl focus-within:border-purple-500/80 focus-within:ring-2 focus-within:ring-purple-500/20 transition-all">
        <div className="relative flex-1 flex items-center">
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            <svg
              className="w-5 h-5"
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
            className="w-full pl-11 pr-8 py-3.5 sm:py-3 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm sm:text-base font-medium disabled:opacity-50"
            autoComplete="off"
            spellCheck="false"
          />
          {value && (
            <button
              type="button"
              onClick={() => setValue('')}
              disabled={isLoading}
              className="absolute right-3 text-slate-500 hover:text-slate-300 transition-colors p-1"
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
          className="relative inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3 sm:py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-purple-400 hover:to-pink-500 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 cursor-pointer whitespace-nowrap shrink-0"
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

      {/* Helper text with sample profile chips */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-400 px-1.5">
        <span>Enter a username or <code className="text-slate-300 font-mono text-[11px] bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">github.com/profile</code> URL</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Try:</span>
          <button
            type="button"
            onClick={() => handleSampleClick('torvalds')}
            className="text-purple-400 hover:text-purple-300 hover:underline font-mono cursor-pointer"
          >
            torvalds
          </button>
          <span className="text-slate-600">·</span>
          <button
            type="button"
            onClick={() => handleSampleClick('shadcn')}
            className="text-purple-400 hover:text-purple-300 hover:underline font-mono cursor-pointer"
          >
            shadcn
          </button>
        </div>
      </div>
    </form>
  );
}
