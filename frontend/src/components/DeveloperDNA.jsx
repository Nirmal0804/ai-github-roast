export default function DeveloperDNA({ dna }) {
  if (!dna) {
    return (
      <div className="p-6 rounded-2xl glass-panel-subtle text-center text-[#C4B5D4] text-xs">
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
      gradient: 'from-[#3F0D63] via-[#6D28A8] to-[#A855F7]',
    },
    {
      key: 'experimenter',
      label: 'Experimenter',
      icon: '🧪',
      value: Number(dna.experimenter) || 0,
      description: 'Willingness to try new ideas, hacks, and rapid prototypes',
      gradient: 'from-[#6D28A8] via-[#8B5CF6] to-[#C084FC]',
    },
    {
      key: 'documenter',
      label: 'Documenter',
      icon: '📝',
      value: Number(dna.documenter) || 0,
      description: 'README thoroughness, setup guides, and architectural clarity',
      gradient: 'from-[#3F0D63] via-[#7C3AED] to-[#A855F7]',
    },
    {
      key: 'maintainer',
      label: 'Maintainer',
      icon: '🛡️',
      value: Number(dna.maintainer) || 0,
      description: 'Commit consistency, repository updates, and project longevity',
      gradient: 'from-[#4C1D95] via-[#6D28A8] to-[#9333EA]',
    },
    {
      key: 'open_source',
      label: 'Open Source',
      icon: '🌐',
      value: Number(dna.open_source) || 0,
      description: 'Public community contribution, licensing, and collaboration signals',
      gradient: 'from-[#6D28A8] via-[#A855F7] to-[#D8B4FE]',
    },
    {
      key: 'specialist',
      label: 'Specialist',
      icon: '🎯',
      value: Number(dna.specialist) || 0,
      description: 'Deep mastery & concentration in a primary technology stack',
      gradient: 'from-[#581C87] via-[#7E22CE] to-[#A855F7]',
    },
    {
      key: 'explorer',
      label: 'Explorer',
      icon: '🧭',
      value: Number(dna.explorer) || 0,
      description: 'Polyglot versatility across diverse languages and domains',
      gradient: 'from-[#3F0D63] via-[#6D28A8] to-[#C084FC]',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧬</span>
          <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
            Developer DNA
          </h3>
        </div>
        <span className="text-xs text-[#C4B5D4] font-mono">
          Observable behavioral signals from repository data
        </span>
      </div>

      {/* Visual DNA Grid */}
      <div className="p-6 rounded-2xl glass-panel space-y-4.5">
        {dimensions.map((dim) => {
          const clamped = Math.min(100, Math.max(0, dim.value));
          return (
            <div key={dim.key} className="space-y-2 group">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base select-none">{dim.icon}</span>
                  <span className="font-bold text-white tracking-wide">{dim.label}</span>
                  <span className="hidden md:inline text-[11px] text-[#C4B5D4]/70 font-normal">
                    — {dim.description}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-[rgba(63,13,99,0.40)] text-[#A855F7] border border-[rgba(168,85,247,0.25)] shadow-sm">
                    {clamped}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-[rgba(15,5,25,0.75)] border border-[rgba(168,85,247,0.18)] overflow-hidden p-0.5 shadow-inner">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${dim.gradient} transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(168,85,247,0.35)]`}
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
