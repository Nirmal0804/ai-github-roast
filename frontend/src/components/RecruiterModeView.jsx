export default function RecruiterModeView({
  analysis,
  profile,
  repositoryData,
}) {
  const recruiter = analysis?.recruiter_summary;

  if (!recruiter) {
    return (
      <div className="p-8 rounded-3xl glass-panel-subtle text-center space-y-3">
        <span className="text-3xl">💼</span>
        <h3 className="text-lg font-bold text-white">Recruiter Assessment Unavailable</h3>
        <p className="text-xs text-[#C4B5D4] max-w-md mx-auto">
          Recruiter summary data is not present for this analysis snapshot. Run a fresh analysis to generate the full professional assessment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-[rgba(168,85,247,0.30)] shadow-[0_20px_50px_rgba(63,13,99,0.35)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#A855F7] animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#A855F7]">
              Professional Engineering Evaluation
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#C4B5D4] bg-[rgba(63,13,99,0.40)] px-3 py-1 rounded-full border border-[rgba(168,85,247,0.20)]">
            Source: Observable Public GitHub Repositories Only
          </span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Candidate Snapshot
          </h3>
          <p className="text-sm text-[#C4B5D4] leading-relaxed max-w-3xl">
            {recruiter.candidate_snapshot}
          </p>
        </div>

        <div className="pt-3 border-t border-[rgba(168,85,247,0.18)] flex flex-wrap gap-5 text-xs text-[#C4B5D4] font-mono">
          <div>
            <span className="text-[#C4B5D4]/70">Overall Technical Score: </span>
            <span className="text-white font-bold">{analysis.overall_score}/100</span>
          </div>
          <div>
            <span className="text-[#C4B5D4]/70">League Tier: </span>
            <span className="text-[#A855F7] font-bold">{analysis.league || 'Builder'}</span>
          </div>
          <div>
            <span className="text-[#C4B5D4]/70">Public Repos Analyzed: </span>
            <span className="text-white font-bold">
              {repositoryData?.summary?.total_public_repositories ?? repositoryData?.summary?.public_repository_count ?? repositoryData?.repositories?.length ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Strengths & Strongest Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Strengths */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
            <span className="text-[#A855F7]">✅</span>
            <span>Verified Technical Strengths</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#C4B5D4]">
            {recruiter.technical_strengths?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#A855F7] mt-1 shrink-0 font-bold">&bull;</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Strongest Projects */}
        <div className="p-6 rounded-2xl glass-panel space-y-4">
          <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
            <span className="text-[#A855F7]">🏆</span>
            <span>Key Project Evidence</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#C4B5D4]">
            {recruiter.strongest_projects?.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-[#A855F7] mt-1 shrink-0 font-bold">&bull;</span>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3 Pillars: Tech Breadth, Docs & Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl glass-panel-subtle space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A855F7] block">
            Technology Breadth
          </span>
          <p className="text-xs text-[#C4B5D4] leading-relaxed">
            {recruiter.technology_breadth}
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-subtle space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white block">
            Documentation Standard
          </span>
          <p className="text-xs text-[#C4B5D4] leading-relaxed">
            {recruiter.documentation_quality}
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel-subtle space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] block">
            Activity &amp; Consistency
          </span>
          <p className="text-xs text-[#C4B5D4] leading-relaxed">
            {recruiter.activity_consistency}
          </p>
        </div>
      </div>

      {/* Engineering Signals */}
      <div className="p-6 rounded-2xl glass-panel space-y-2.5">
        <span className="text-xs font-bold uppercase tracking-wider text-white block">
          Observable Engineering Signals
        </span>
        <div className="text-xs sm:text-sm text-[#C4B5D4] leading-relaxed">
          {Array.isArray(recruiter.engineering_signals)
            ? recruiter.engineering_signals.join(' • ')
            : recruiter.engineering_signals}
        </div>
      </div>

      {/* Areas for Improvement / Considerations */}
      <div className="p-6 rounded-2xl glass-panel border border-[rgba(168,85,247,0.25)] space-y-3">
        <div className="flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider">
          <span className="text-[#A855F7]">🔍</span>
          <span>Considerations &amp; Areas For Improvement</span>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-[#C4B5D4]">
          {(recruiter.areas_to_improve || recruiter.concerns || []).map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="text-[#A855F7] mt-1 shrink-0 font-bold">&bull;</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Overall GitHub Impression & Disclaimer */}
      <div className="p-6 rounded-2xl glass-panel space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-white block">
          Summary Evaluation
        </span>
        <p className="text-xs sm:text-sm text-[#C4B5D4] leading-relaxed">
          {recruiter.overall_impression}
        </p>

        <div className="pt-3 border-t border-[rgba(168,85,247,0.15)] text-[11px] text-[#C4B5D4]/70 leading-relaxed font-mono">
          Disclaimer: This evaluation is generated by AI strictly from public GitHub repository evidence (commit patterns, README presence, languages, and repo structure). It does not infer education, employment pedigree, salary, location, or personal characteristics, and represents portfolio metrics rather than automated hiring determination.
        </div>
      </div>
    </div>
  );
}
