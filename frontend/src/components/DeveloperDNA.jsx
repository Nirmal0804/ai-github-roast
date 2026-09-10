export default function DeveloperDNA({ dna }) {
  if (!dna) {
    return (
      <div className="p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center text-slate-400 text-xs">
        Developer DNA not available for this analysis.
      </div>
    );
  }

  const dimensions = [
    {
      key: 'builder',
      label: 'Builder',
      icon: '🔨',
      value: Number(dna.builder) || 0,
      description: 'Project creation velocity & execution momentum',
      gradient: 'from-purple-500 via-indigo-500 to-blue-500',
      badgeBg: 'bg-purple-950/50 text-purple-300 border-purple-800/40',
    },
    {
      key: 'experimenter',
      label: 'Experimenter',
      icon: '🧪',
      value: Number(dna.experimenter) || 0,
      description: 'Willingness to try new ideas, hacks, and rapid prototypes',
      gradient: 'from-pink-500 via-rose-500 to-amber-500',
      badgeBg: 'bg-pink-950/50 text-pink-300 border-pink-800/40',
    },
    {
      key: 'documenter',
      label: 'Documenter',
      icon: '📝',
      value: Number(dna.documenter) || 0,
      description: 'README thoroughness, setup guides, and architectural clarity',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      badgeBg: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40',
    },
    {
      key: 'maintainer',
      label: 'Maintainer',
      icon: '🛡️',
      value: Number(dna.maintainer) || 0,
      description: 'Commit consistency, repository updates, and project longevity',
      gradient: 'from-blue-500 via-cyan-500 to-teal-400',
      badgeBg: 'bg-blue-950/50 text-blue-300 border-blue-800/40',
    },
    {
      key: 'open_source',
      label: 'Open Source',
      icon: '🌐',
      value: Number(dna.open_source) || 0,
      description: 'Public community contribution, licensing, and collaboration signals',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      badgeBg: 'bg-amber-950/50 text-amber-300 border-amber-800/40',
    },
    {
      key: 'specialist',
      label: 'Specialist',
      icon: '🎯',
      value: Number(dna.specialist) || 0,
      description: 'Deep mastery & concentration in a primary technology stack',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      badgeBg: 'bg-violet-950/50 text-violet-300 border-violet-800/40',
    },
    {
      key: 'explorer',
      label: 'Explorer',
      icon: '🧭',
      value: Number(dna.explorer) || 0,
      description: 'Polyglot versatility across diverse languages and domains',
      gradient: 'from-teal-400 via-emerald-500 to-green-500',
      badgeBg: 'bg-teal-950/50 text-teal-300 border-teal-800/40',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧬</span>
          <h3 className="text-base sm:text-lg font-black text-slate-100 tracking-tight">
            Developer DNA
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          Behavioral signals inferred from observable repository evidence
        </span>
      </div>

      {/* Visual DNA Grid */}
      <div className="p-6 rounded-2xl bg-slate-950/70 border border-purple-900/40 shadow-inner space-y-4">
        {dimensions.map((dim) => {
          const clamped = Math.min(100, Math.max(0, dim.value));
          return (
            <div key={dim.key} className="space-y-1.5 group">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{dim.icon}</span>
                  <span className="font-bold text-slate-200">{dim.label}</span>
                  <span className="hidden md:inline text-[11px] text-slate-500 font-normal">
                    — {dim.description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${dim.badgeBg}`}>
                    {clamped}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-900/90 border border-slate-800/80 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${dim.gradient} transition-all duration-1000 ease-out`}
                  style={{ width: `${clamped}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
