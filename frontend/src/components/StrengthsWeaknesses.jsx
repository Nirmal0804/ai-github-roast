export default function StrengthsWeaknesses({ strengths = [], weaknesses = [] }) {
  const safeStrengths = Array.isArray(strengths) ? strengths : [];
  const safeWeaknesses = Array.isArray(weaknesses) ? weaknesses : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Strengths Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💪</span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Your Strengths
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#A855F7] bg-[rgba(63,13,99,0.40)] px-2.5 py-0.5 rounded-lg border border-[rgba(168,85,247,0.25)]">
            {safeStrengths.length} Verified Signals
          </span>
        </div>

        <div className="space-y-3">
          {safeStrengths.map((item, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl glass-panel-interactive flex items-start gap-4"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl bg-[rgba(63,13,99,0.60)] border border-[rgba(168,85,247,0.40)] flex items-center justify-center text-xs font-mono font-black text-white shadow-sm">
                0{idx + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {item.title}
                </h4>
                <p className="text-xs text-[#C4B5D4] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {safeStrengths.length === 0 && (
            <div className="p-4 rounded-xl glass-panel-subtle text-xs text-[#C4B5D4]">
              No distinct strengths identified from repository dataset.
            </div>
          )}
        </div>
      </div>

      {/* Weaknesses Section */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
              Your Weaknesses
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-[#C4B5D4] bg-[rgba(63,13,99,0.40)] px-2.5 py-0.5 rounded-lg border border-[rgba(168,85,247,0.25)]">
            {safeWeaknesses.length} Critical Areas
          </span>
        </div>

        <div className="space-y-3">
          {safeWeaknesses.map((item, idx) => (
            <div
              key={idx}
              className="p-4 sm:p-5 rounded-2xl glass-panel-interactive flex items-start gap-4"
            >
              <div className="shrink-0 w-8 h-8 rounded-xl bg-[rgba(109,40,168,0.30)] border border-[rgba(168,85,247,0.35)] flex items-center justify-center text-xs font-mono font-black text-[#C4B5D4] shadow-sm">
                0{idx + 1}
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {item.title}
                </h4>
                <p className="text-xs text-[#C4B5D4] leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}

          {safeWeaknesses.length === 0 && (
            <div className="p-4 rounded-xl glass-panel-subtle text-xs text-[#C4B5D4]">
              No distinct weaknesses identified from repository dataset.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
