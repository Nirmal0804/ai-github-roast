export default function TechStackFingerprint({ techStack }) {
  const languages = techStack?.languages || [];

  if (languages.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel-subtle text-center text-[#C4B5D4] text-xs">
        No detected languages found in public repositories.
      </div>
    );
  }

  // Find maximum score to emphasize dominant technology
  const maxScore = Math.max(...languages.map((l) => l.score || 0));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖨️</span>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Your Tech Stack Fingerprint
          </h3>
        </div>
        <span className="text-xs text-[#C4B5D4] font-mono">
          Derived directly from detected repository language data
        </span>
      </div>

      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {languages.map((lang) => {
            const scoreClamped = Math.min(100, Math.max(0, lang.score));
            const isDominant = lang.score === maxScore && maxScore > 0;
            return (
              <div
                key={lang.name}
                className={`p-4 rounded-xl transition-all duration-300 flex flex-col justify-between gap-3 ${
                  isDominant
                    ? 'bg-[rgba(63,13,99,0.40)] border-2 border-[rgba(168,85,247,0.45)] shadow-[0_0_20px_rgba(168,85,247,0.20)]'
                    : 'glass-panel-subtle hover:border-[rgba(168,85,247,0.35)]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isDominant ? 'bg-[#A855F7] animate-pulse' : 'bg-purple-300'}`} />
                    <span className="text-sm font-bold text-white tracking-wide">{lang.name}</span>
                    {isDominant && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/30">
                        Primary
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[rgba(63,13,99,0.35)] text-[#C4B5D4] border border-[rgba(168,85,247,0.20)]">
                    {lang.repository_count} {lang.repository_count === 1 ? 'repo' : 'repos'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-[#C4B5D4]">
                    <span>Prominence</span>
                    <span className="font-mono font-bold text-white">{scoreClamped}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[rgba(15,5,25,0.70)] overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isDominant
                          ? 'bg-gradient-to-r from-[#6D28A8] via-[#A855F7] to-[#D8B4FE] shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                          : 'bg-gradient-to-r from-[#3F0D63] to-[#A855F7]'
                      }`}
                      style={{ width: `${scoreClamped}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
