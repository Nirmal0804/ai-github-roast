export default function RecruiterModeView({
  analysis,
  profile,
  repositoryData,
}) {
  const recruiter = analysis?.recruiter_summary;

  if (!recruiter) {
    return (
      <div className="p-8 rounded-3xl bg-slate-950/80 border border-slate-800 text-center space-y-3">
        <span className="text-3xl">💼</span>
        <h3 className="text-lg font-bold text-slate-200">Recruiter Assessment Unavailable</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Recruiter summary data is not present for this analysis snapshot. Run a fresh analysis to generate the full professional assessment.
        </p>
      </div>
    );
  }

  const allRepos = [
    ...(repositoryData?.top_repositories || []),
    ...(repositoryData?.repositories || []),
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/40 border border-blue-500/30 space-y-3 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-300">
              Professional Engineering Evaluation
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
            Source: Observable Public GitHub Repositories Only
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
            Candidate Snapshot
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
            {recruiter.candidate_snapshot}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-xs text-slate-400 font-mono">
          <div>
            <span className="text-slate-500">Overall Technical Score: </span>
            <span className="text-slate-200 font-bold">{analysis.overall_score}/100</span>
          </div>
          <div>
            <span className="text-slate-500">League Tier: </span>
            <span className="text-blue-300 font-bold">{analysis.league || 'Builder'}</span>
          </div>
          <div>
            <span className="text-slate-500">Public Repos Analyzed: </span>
            <span className="text-slate-200 font-bold">{repositoryData?.summary?.public_repository_count || 0}</span>
          </div>
        </div>
      </div>

      {/* Grid: Strengths & Strongest Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Strengths */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>✅</span>
            <span>Verified Technical Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {recruiter.technical_strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-emerald-400 mt-1 shrink-0 font-bold">&bull;</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strongest Projects */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <span>🏆</span>
            <span>Key Project Evidence</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {recruiter.strongest_projects?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-blue-400 mt-1 shrink-0 font-bold">&bull;</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3 Pillars: Tech Breadth, Signals, Docs & Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
            Technology Breadth
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {recruiter.technology_breadth}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Documentation Standard
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {recruiter.documentation_quality}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Activity &amp; Consistency
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            {recruiter.activity_consistency}
          </p>
        </div>
      </div>

      {/* Engineering Signals */}
      <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          Observable Engineering Signals
        </span>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {recruiter.engineering_signals}
        </p>
      </div>

      {/* Areas for Improvement / Concerns */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
          <span>🔍</span>
          <span>Considerations &amp; Areas For Improvement</span>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-rose-200/90">
          {recruiter.concerns?.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-rose-400 mt-1 shrink-0 font-bold">&bull;</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Overall GitHub Impression & Disclaimer */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Summary Evaluation
        </span>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {recruiter.overall_impression}
        </p>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 leading-relaxed">
          Disclaimer: This evaluation is generated by AI strictly from public GitHub repository evidence (commit patterns, README presence, languages, and repo structure). It does not infer education, employment pedigree, salary, location, or personal characteristics, and should be considered as a technical portfolio signal rather than an automated hiring determination.
        </div>
      </div>
    </div>
  );
}
