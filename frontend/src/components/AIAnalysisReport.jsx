export default function AIAnalysisReport({ analysisData, profile, repositoryData }) {
  if (!analysisData || !analysisData.analysis) return null;

  const { analysis, username } = analysisData;

  const scoreBars = [
    { label: 'Technical Depth', score: analysis.technical_depth_score, color: 'from-indigo-500 to-blue-500' },
    { label: 'Project Quality', score: analysis.project_quality_score, color: 'from-purple-500 to-pink-500' },
    { label: 'Documentation', score: analysis.documentation_score, color: 'from-emerald-500 to-teal-400' },
    { label: 'Consistency', score: analysis.consistency_score, color: 'from-amber-500 to-orange-500' },
  ];

  // Match standout project name against verified repository data
  const allRepos = [
    ...(repositoryData?.top_repositories || []),
    ...(repositoryData?.repositories || []),
  ];

  const standoutRepoName = analysis.best_project?.name?.trim();
  const matchedRepo = standoutRepoName && standoutRepoName.toLowerCase() !== 'null'
    ? allRepos.find(
        (r) => r.name?.toLowerCase() === standoutRepoName.toLowerCase()
      )
    : null;

  const standoutUrl = matchedRepo?.html_url || null;

  // Rating archetype tier for the score
  const getScoreVerdict = (score) => {
    if (score >= 85) return { label: 'Elite Engineer', badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    if (score >= 70) return { label: 'Solid Builder', badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (score >= 50) return { label: 'Needs Polish', badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    return { label: 'Critical Condition', badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
  };

  const verdict = getScoreVerdict(analysis.overall_score);

  // SVG circular gauge calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, analysis.overall_score)) / 100) * circumference;

  return (
    <section aria-label="AI Roast Report" className="w-full space-y-6 animate-fade-in">
      {/* Main Report Container */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-purple-950/20 border border-purple-500/40 p-6 sm:p-9 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl space-y-8">
        
        {/* Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* Report Header & Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || username}
                className="w-14 h-14 rounded-2xl border-2 border-purple-500/40 object-cover shadow-md shadow-purple-950/40"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-xl font-black text-purple-400">
                {(username || 'G').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <span>🔥</span>
                  <span>AI Roast Report</span>
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${verdict.badgeClass}`}>
                  {verdict.label}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1">
                {profile?.name || username}
                <span className="text-sm font-normal text-slate-400 font-mono ml-2">
                  @{username}
                </span>
              </h2>
            </div>
          </div>

          <div className="text-xs text-slate-400 sm:text-right font-mono">
            <span>Verified Analysis</span>
            <div className="text-[11px] text-slate-400 mt-0.5">Model: Gemini 2.5 Flash</div>
          </div>
        </div>

        {/* Overall Score & Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Circular Overall Score Hero (5 cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/80 border border-purple-800/40 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Overall Developer Score
            </span>
            
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90">
                {/* Background track */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-slate-800/80"
                />
                {/* Progress track */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-black font-mono tracking-tight text-white">
                  {analysis.overall_score}
                </span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  out of 100
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-3 max-w-[240px] leading-relaxed">
              Holistic rating calculated strictly from observable GitHub repository evidence.
            </p>
          </div>

          {/* 4 Score Bars (7 cols) */}
          <div className="lg:col-span-7 space-y-3.5 p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Engineering Dimension Breakdown
            </span>
            <div className="space-y-3">
              {scoreBars.map((item) => (
                <div key={item.label} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-200 font-medium">{item.label}</span>
                    <span className="font-mono font-bold text-slate-300">{item.score}/100</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-800/90 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all duration-700 ease-out`}
                      style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 🔥 The Roast — Signature Hero Showcase */}
        <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-950 to-pink-950/50 border-2 border-purple-500/50 text-slate-100 shadow-xl shadow-purple-950/30 overflow-hidden">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="text-xs font-black uppercase tracking-widest text-purple-300">
                The Roast
              </span>
            </div>
            <span className="text-xs font-mono text-purple-400/80">Brutally Honest &bull; Grounded</span>
          </div>

          <blockquote className="relative text-lg sm:text-xl font-semibold italic text-slate-100 leading-relaxed pl-4 border-l-4 border-purple-500">
            "{analysis.roast}"
          </blockquote>
        </div>

        {/* Developer Personality Archetype */}
        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start sm:items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
              <span>🧠</span>
              <span>Developer Personality Archetype</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              {analysis.developer_personality}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inferred strictly from visible commit cadence, repository naming, and documentation habits.
            </p>
          </div>
          <span className="text-3xl px-3 py-2 rounded-2xl bg-purple-950/40 border border-purple-800/40">
            🎯
          </span>
        </div>

        {/* Strongest Signal & Biggest Weakness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
              <span>💪</span>
              <span>Strongest Positive Signal</span>
            </div>
            <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
              {analysis.strongest_signal}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
              <span>⚠️</span>
              <span>Primary Area For Improvement</span>
            </div>
            <p className="text-sm text-rose-100/90 leading-relaxed font-medium">
              {analysis.biggest_weakness}
            </p>
          </div>
        </div>

        {/* Standout Project */}
        {analysis.best_project && (
          <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <span>🏆</span>
                <span>Standout Project</span>
              </div>
              {standoutUrl && (
                <a
                  href={standoutUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-purple-300 bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 transition-colors"
                >
                  <span>View repository</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>

            <div className="text-base sm:text-lg font-bold text-slate-100 font-mono">
              {standoutRepoName && standoutRepoName.toLowerCase() !== 'null'
                ? standoutRepoName
                : 'Insufficient evidence for standout project'}
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {analysis.best_project.reason}
            </p>
          </div>
        )}

        {/* Actionable Recommendations (Exactly 3) */}
        <div className="space-y-4 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>📋</span>
              <span>Actionable Recommendations ({analysis.recommendations?.length || 3})</span>
            </h4>
            <span className="text-[11px] text-slate-400">Tailored to detected weaknesses</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {analysis.recommendations?.map((rec, index) => (
              <div
                key={index}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/40">
                    0{index + 1}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Step</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
