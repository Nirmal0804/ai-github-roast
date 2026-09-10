export default function RepositorySummary({ repositoryData }) {
  if (!repositoryData) return null;

  const { summary, top_repositories = [] } = repositoryData;

  const docRatePercent = summary?.documentation_rate != null
    ? Math.round(summary.documentation_rate * 100)
    : 0;

  const licenseRatePercent = summary?.license_rate != null
    ? Math.round(summary.license_rate * 100)
    : 0;

  // Harmonious purple-tuned language dot colors
  const getLanguageColor = (lang) => {
    const colors = {
      javascript: 'bg-amber-400',
      typescript: 'bg-blue-400',
      python: 'bg-emerald-400',
      html: 'bg-orange-400',
      css: 'bg-purple-300',
      rust: 'bg-amber-500',
      go: 'bg-cyan-400',
      java: 'bg-rose-400',
      c: 'bg-slate-400',
      'c++': 'bg-fuchsia-400',
      ruby: 'bg-rose-500',
      php: 'bg-violet-400',
      shell: 'bg-teal-400',
    };
    return colors[lang?.toLowerCase()] || 'bg-[#A855F7]';
  };

  return (
    <div className="w-full p-6 sm:p-7 glass-panel space-y-6 animate-fade-in transition-all">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-[rgba(168,85,247,0.18)] flex-wrap">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Your GitHub Snapshot</span>
          </h3>
          <p className="text-xs text-[#C4B5D4] mt-0.5">
            Public engineering activity &amp; repository signals
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[rgba(63,13,99,0.35)] border border-[rgba(168,85,247,0.25)] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse" />
          <span className="text-white font-medium">
            {summary.active_repositories} active / {summary.total_public_repositories} total
          </span>
        </div>
      </div>

      {/* Primary Metrics Hierarchy (4 Hero Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl glass-panel-interactive space-y-1">
          <span className="block text-[11px] font-bold text-[#C4B5D4] uppercase tracking-wider">
            Total Repos
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {summary.total_public_repositories}
            </span>
            <span className="text-xs text-[#C4B5D4]/70">repos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel-interactive space-y-1">
          <span className="block text-[11px] font-bold text-[#C4B5D4] uppercase tracking-wider">
            Original Projects
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-[#A855F7]">
              {summary.total_original_repositories}
            </span>
            <span className="text-xs text-[#C4B5D4]/70">non-forks</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel-interactive space-y-1">
          <span className="block text-[11px] font-bold text-[#C4B5D4] uppercase tracking-wider">
            Total Stars
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              ★ {summary.total_stars}
            </span>
            <span className="text-xs text-[#C4B5D4]/70">earned</span>
          </div>
        </div>

        <div className="p-4 rounded-xl glass-panel-interactive space-y-1">
          <span className="block text-[11px] font-bold text-[#C4B5D4] uppercase tracking-wider">
            Recently Active
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {summary.recently_active_repositories}
            </span>
            <span className="text-xs text-[#C4B5D4]/70">last 180d</span>
          </div>
        </div>
      </div>

      {/* Secondary Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Documentation Coverage */}
        <div className="p-4 rounded-xl glass-panel-subtle space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#C4B5D4] uppercase tracking-wider">README Coverage</span>
            <span className="font-mono font-bold text-[#A855F7]">{docRatePercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[rgba(15,5,25,0.70)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#6D28A8] to-[#A855F7] transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
              style={{ width: `${docRatePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#C4B5D4]/80">
            {summary.repositories_with_readme} of {summary.total_public_repositories} repositories documented
          </p>
        </div>

        {/* License Coverage */}
        <div className="p-4 rounded-xl glass-panel-subtle space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-[#C4B5D4] uppercase tracking-wider">License Coverage</span>
            <span className="font-mono font-bold text-[#A855F7]">{licenseRatePercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[rgba(15,5,25,0.70)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#3F0D63] via-[#6D28A8] to-[#A855F7] transition-all duration-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]"
              style={{ width: `${licenseRatePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-[#C4B5D4]/80">
            {summary.repositories_with_license} with explicit open-source license
          </p>
        </div>

        {/* Languages Detected */}
        <div className="p-4 rounded-xl glass-panel-subtle space-y-1.5">
          <span className="block text-xs font-bold text-[#C4B5D4] uppercase tracking-wider">
            Languages Detected
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {summary.languages_used?.length > 0 ? (
              summary.languages_used.slice(0, 5).map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs bg-[rgba(63,13,99,0.35)] border border-[rgba(168,85,247,0.20)] text-white font-mono"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${getLanguageColor(lang)}`} />
                  <span>{lang}</span>
                  <span className="text-[#C4B5D4] text-[10px]">({summary.language_counts[lang] || 0})</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-[#C4B5D4]/60 italic">None detected</span>
            )}
          </div>
        </div>
      </div>

      {/* Top Repositories List */}
      <div className="space-y-3 pt-3 border-t border-[rgba(168,85,247,0.18)]">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#C4B5D4] uppercase tracking-wider">
            Standout Public Repositories ({top_repositories.length})
          </h4>
          <span className="text-[11px] text-[#C4B5D4]/80 font-mono">Ranked by stars, forks &amp; activity</span>
        </div>

        {top_repositories.length === 0 ? (
          <p className="text-sm text-[#C4B5D4] italic p-4 text-center bg-[rgba(15,5,25,0.40)] rounded-xl border border-[rgba(168,85,247,0.15)]">
            No public repositories found for this account.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {top_repositories.map((repo) => (
              <div
                key={repo.id || repo.name}
                className="p-4 rounded-xl glass-panel-interactive flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-bold text-sm text-white hover:text-[#A855F7] transition-colors inline-flex items-center gap-1.5 font-mono"
                      >
                        <span className="truncate max-w-[220px]">{repo.name}</span>
                        <svg className="w-3.5 h-3.5 text-[#C4B5D4] group-hover:text-[#A855F7] transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      {repo.is_fork && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(63,13,99,0.40)] text-[#C4B5D4] border border-[rgba(168,85,247,0.15)] font-mono">
                          Fork
                        </span>
                      )}
                      {repo.is_archived && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 font-mono">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
                      <span className="text-amber-300 font-semibold">★ {repo.stars}</span>
                      <span className="text-[#C4B5D4]">⑂ {repo.forks}</span>
                    </div>
                  </div>

                  {repo.description && (
                    <p className="text-xs text-[#C4B5D4] mt-2 line-clamp-2 leading-relaxed">
                      {repo.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-[rgba(168,85,247,0.15)] text-[11px] text-[#C4B5D4]/70 font-mono">
                  {repo.language ? (
                    <span className="inline-flex items-center gap-1.5 text-white">
                      <span className={`w-1.5 h-1.5 rounded-full ${getLanguageColor(repo.language)}`} />
                      {repo.language}
                    </span>
                  ) : (
                    <span>No language specified</span>
                  )}
                  {repo.has_readme && (
                    <span className="text-[#A855F7] font-semibold">README ✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
