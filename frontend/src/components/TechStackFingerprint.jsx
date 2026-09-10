export default function TechStackFingerprint({ techStack }) {
  const languages = techStack?.languages || [];

  if (languages.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center text-slate-400 text-xs">
        No detected languages found in public repositories.
      </div>
    );
  }

  // Palette generator for languages
  const getLanguageColor = (index) => {
    const colors = [
      { bar: 'from-purple-500 to-indigo-500', badge: 'bg-purple-950/40 text-purple-300 border-purple-800/40' },
      { bar: 'from-blue-500 to-cyan-500', badge: 'bg-blue-950/40 text-blue-300 border-blue-800/40' },
      { bar: 'from-emerald-500 to-teal-400', badge: 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40' },
      { bar: 'from-amber-500 to-orange-500', badge: 'bg-amber-950/40 text-amber-300 border-amber-800/40' },
      { bar: 'from-pink-500 to-rose-500', badge: 'bg-pink-950/40 text-pink-300 border-pink-800/40' },
      { bar: 'from-violet-500 to-fuchsia-500', badge: 'bg-violet-950/40 text-violet-300 border-violet-800/40' },
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🖨️</span>
          <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
            Your Tech Stack Fingerprint
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Strictly derived from detected repository language data
        </span>
      </div>

      <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {languages.map((lang, idx) => {
            const color = getLanguageColor(idx);
            const scoreClamped = Math.min(100, Math.max(0, lang.score));
            return (
              <div
                key={lang.name}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/70 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400" />
                    <span className="text-sm font-bold text-slate-100">{lang.name}</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${color.badge}`}>
                    {lang.repository_count} {lang.repository_count === 1 ? 'repo' : 'repos'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] text-slate-400">
                    <span>Relative Prominence</span>
                    <span className="font-mono font-bold text-slate-300">{scoreClamped}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${color.bar} transition-all duration-700 ease-out`}
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
