export default function RepositorySummary({ repositoryData }) {
  if (!repositoryData) return null;

  const { summary, top_repositories = [] } = repositoryData;

  const docRatePercent = summary?.documentation_rate != null
    ? Math.round(summary.documentation_rate * 100)
    : 0;

  const licenseRatePercent = summary?.license_rate != null
    ? Math.round(summary.license_rate * 100)
    : 0;

  // Common language dot colors
  const getLanguageColor = (lang) => {
    const colors = {
      javascript: 'bg-yellow-400',
      typescript: 'bg-blue-400',
      python: 'bg-emerald-400',
      html: 'bg-orange-500',
      css: 'bg-indigo-400',
      rust: 'bg-amber-600',
      go: 'bg-cyan-400',
      java: 'bg-red-400',
      c: 'bg-slate-400',
      'c++': 'bg-pink-400',
      ruby: 'bg-rose-500',
      php: 'bg-indigo-300',
      shell: 'bg-teal-400',
    };
    return colors[lang?.toLowerCase()] || 'bg-purple-400';
  };

  return (
    <div className="w-full p-6 sm:p-7 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl shadow-purple-950/10 space-y-6 animate-fade-in transition-all">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-800/80 flex-wrap">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            <span>Your GitHub Snapshot</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Public engineering activity &amp; repository signals
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">
            {summary.active_repositories} active / {summary.total_public_repositories} total
          </span>
        </div>
      </div>

      {/* Primary Metrics Hierarchy (4 Hero Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Repos
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100">
              {summary.total_public_repositories}
            </span>
            <span className="text-xs text-slate-500">repos</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Original Projects
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-purple-400">
              {summary.total_original_repositories}
            </span>
            <span className="text-xs text-slate-500">non-forks</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Stars
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              ★ {summary.total_stars}
            </span>
            <span className="text-xs text-slate-500">earned</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-purple-500/30 transition-all">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Recently Active
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {summary.recently_active_repositories}
            </span>
            <span className="text-xs text-slate-500">last 180d</span>
          </div>
        </div>
      </div>

      {/* Secondary Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Documentation Coverage */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">README Coverage</span>
            <span className="font-mono font-bold text-indigo-400">{docRatePercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${docRatePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {summary.repositories_with_readme} of {summary.total_public_repositories} repositories documented
          </p>
        </div>

        {/* License Coverage */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-400 uppercase tracking-wider">License Coverage</span>
            <span className="font-mono font-bold text-emerald-400">{licenseRatePercent}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${licenseRatePercent}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            {summary.repositories_with_license} with explicit open-source license
          </p>
        </div>

        {/* Forks & Tech Variety */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Languages Detected
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {summary.languages_used?.length > 0 ? (
              summary.languages_used.slice(0, 5).map((lang) => (
                <span
                  key={lang}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${getLanguageColor(lang)}`} />
                  <span>{lang}</span>
                  <span className="text-slate-400 text-[10px]">({summary.language_counts[lang] || 0})</span>
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">None detected</span>
            )}
          </div>
        </div>
      </div>

      {/* Top Repositories List */}
      <div className="space-y-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Standout Public Repositories ({top_repositories.length})
          </h4>
          <span className="text-[11px] text-slate-400">Ranked by stars, forks &amp; activity</span>
        </div>

        {top_repositories.length === 0 ? (
          <p className="text-sm text-slate-500 italic p-4 text-center bg-slate-950/40 rounded-xl border border-slate-800">
            No public repositories found for this account.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {top_repositories.map((repo) => (
              <div
                key={repo.id || repo.name}
                className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 hover:border-purple-500/40 hover:bg-slate-900/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="font-bold text-sm text-slate-100 hover:text-purple-300 transition-colors inline-flex items-center gap-1 font-mono"
                      >
                        <span className="truncate max-w-[220px]">{repo.name}</span>
                        <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>

                      {repo.is_fork && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          Fork
                        </span>
                      )}
                      {repo.is_archived && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-400 border border-amber-800/40 font-mono">
                          Archived
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-mono shrink-0">
                      <span className="text-amber-300">★ {repo.stars}</span>
                      <span className="text-slate-400">⑂ {repo.forks}</span>
                    </div>
                  </div>

                  {repo.description && (
                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {repo.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-900 text-[11px] text-slate-500 font-mono">
                  {repo.language ? (
                    <span className="inline-flex items-center gap-1 text-slate-300">
                      <span className={`w-1.5 h-1.5 rounded-full ${getLanguageColor(repo.language)}`} />
                      {repo.language}
                    </span>
                  ) : (
                    <span>No language specified</span>
                  )}
                  {repo.has_readme && (
                    <span className="text-indigo-400 font-semibold">README ✓</span>
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
