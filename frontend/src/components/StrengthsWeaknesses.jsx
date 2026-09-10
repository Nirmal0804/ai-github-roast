export default function StrengthsWeaknesses({ strengths = [], weaknesses = [] }) {
  const safeStrengths = Array.isArray(strengths) ? strengths : [];
  const safeWeaknesses = Array.isArray(weaknesses) ? weaknesses : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
              Your Strengths
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            {safeStrengths.length} Verified Signals
          </span>
        </div>

        <div className="space-y-3">
          {safeStrengths.map((item, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-emerald-900/30 hover:border-emerald-700/50 transition-all flex items-start gap-4 shadow-sm"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/50 flex items-center justify-center text-xs font-mono font-bold text-emerald-300">
                0{idx + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-100">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {safeStrengths.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
              No distinct strengths identified from repository dataset.
            </div>
          )}
        </div>
      </div>

      {/* Weaknesses Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
              Your Weaknesses
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
            {safeWeaknesses.length} Critical Areas
          </span>
        </div>

        <div className="space-y-3">
          {safeWeaknesses.map((item, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-rose-900/30 hover:border-rose-700/50 transition-all flex items-start gap-4 shadow-sm"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl bg-rose-950/80 border border-rose-700/50 flex items-center justify-center text-xs font-mono font-bold text-rose-300">
                0{idx + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-100">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {safeWeaknesses.length === 0 && (
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400">
              No distinct weaknesses identified from repository dataset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
