export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="w-full p-6 rounded-2xl glass-panel border border-[rgba(168,85,247,0.30)] text-white shadow-[0_15px_40px_rgba(63,13,99,0.30)] animate-fade-in space-y-3.5"
    >
      <div className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-[rgba(63,13,99,0.70)] border border-[rgba(168,85,247,0.35)] flex items-center justify-center shrink-0 mt-0.5 text-[#A855F7] shadow-sm">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white tracking-wide">
            Analysis Halted
          </h4>
          <p className="text-xs sm:text-sm text-[#C4B5D4] mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <div className="pt-2 border-t border-[rgba(168,85,247,0.18)] flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="btn-purple-gradient px-4 py-1.5 rounded-xl text-xs font-bold text-white cursor-pointer shadow-md"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
