export default function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="w-full p-5 rounded-2xl bg-rose-950/40 border border-rose-800/60 text-rose-100 shadow-xl shadow-rose-950/20 backdrop-blur-xl animate-fade-in space-y-3"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-rose-900/60 border border-rose-700/60 flex items-center justify-center shrink-0 mt-0.5 text-rose-300">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-rose-200">
            Analysis Halted
          </h4>
          <p className="text-xs sm:text-sm text-rose-200/90 mt-1 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      {onRetry && (
        <div className="pt-2 border-t border-rose-900/50 flex justify-end">
          <button
            type="button"
            onClick={onRetry}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-800 hover:bg-rose-700 active:scale-[0.98] transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
