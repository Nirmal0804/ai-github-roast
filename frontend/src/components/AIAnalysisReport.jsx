import { useState } from 'react';
import DeveloperDNA from './DeveloperDNA.jsx';
import TechStackFingerprint from './TechStackFingerprint.jsx';
import StrengthsWeaknesses from './StrengthsWeaknesses.jsx';
import OneLineRoast from './OneLineRoast.jsx';
import ActionPlan from './ActionPlan.jsx';
import RecruiterModeView from './RecruiterModeView.jsx';
import HistoricalComparison from './HistoricalComparison.jsx';
import DownloadReport from './DownloadReport.jsx';

export default function AIAnalysisReport({
  analysisData,
  profile,
  repositoryData,
  currentSnapshot,
}) {
  const [reportMode, setReportMode] = useState('developer'); // 'developer' | 'recruiter'

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

  // SVG circular gauge calculation
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, analysis.overall_score)) / 100) * circumference;

  // League tier styling
  const getLeagueStyle = (league) => {
    const l = (league || '').toLowerCase();
    if (l.includes('legend')) {
      return 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-yellow-300 border-amber-500/40';
    }
    if (l.includes('elite')) {
      return 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40';
    }
    if (l.includes('strong')) {
      return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
    }
    if (l.includes('builder')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  const leagueName = analysis.league || 'Builder';
  const leagueRange =
    analysis.league_min_score !== undefined && analysis.league_max_score !== undefined
      ? `${analysis.league_min_score}–${analysis.league_max_score} pts`
      : null;

  return (
    <section aria-label="AI Roast Report" className="w-full space-y-6 animate-fade-in">
      {/* Export / Download Controls Bar */}
      <DownloadReport targetElementId="ai-roast-report-export-area" username={username} />

      {/* Mode Switch: Developer Mode vs. Recruiter Mode */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/70 border border-slate-800/90 no-export">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Report Lens:
          </span>
          <span className="text-xs text-slate-300">
            {reportMode === 'developer' ? '🔥 Humorous Developer Roast' : '💼 Professional Recruiter Assessment'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setReportMode('developer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              reportMode === 'developer'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Developer Mode
          </button>

          <button
            type="button"
            onClick={() => setReportMode('recruiter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
              reportMode === 'recruiter'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Recruiter Mode
          </button>
        </div>
      </div>

      {/* Main Exportable Container */}
      <div
        id="ai-roast-report-export-area"
        className="relative rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-purple-950/20 border border-purple-500/40 p-6 sm:p-9 shadow-2xl shadow-purple-950/40 backdrop-blur-2xl space-y-8"
      >
        {/* Ambient Glow accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

        {/* 1. Header & Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || username}
                className="w-16 h-16 rounded-2xl border-2 border-purple-500/40 object-cover shadow-md shadow-purple-950/40"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-2xl font-black text-purple-400">
                {(username || 'G').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  <span>🔥</span>
                  <span>AI Roast Report</span>
                </span>

                {/* Developer League Badge */}
                <span className={`text-[11px] font-extrabold font-mono px-2.5 py-0.5 rounded-full border ${getLeagueStyle(leagueName)}`}>
                  🏆 {leagueName} {leagueRange && `(${leagueRange})`}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight mt-1.5">
                {profile?.name || username}
                <span className="text-sm font-normal text-slate-400 font-mono ml-2">
                  @{username}
                </span>
              </h2>
            </div>
          </div>

          <div className="text-xs text-slate-400 sm:text-right font-mono space-y-0.5">
            <div className="text-slate-300 font-bold">Verified GitHub Signals</div>
            <div className="text-[11px] text-slate-400">Model: Gemini 2.5 Flash</div>
            {analysis.roast_level && (
              <div className="text-[11px] text-purple-400 font-semibold capitalize">
                Roast: {analysis.roast_level}
              </div>
            )}
          </div>
        </div>

        {/* RECRUITER MODE VIEW (When active) */}
        {reportMode === 'recruiter' ? (
          <RecruiterModeView
            analysis={analysis}
            profile={profile}
            repositoryData={repositoryData}
          />
        ) : (
          /* DEVELOPER MODE VIEW */
          <div className="space-y-8">
            {/* 2. Developer Scorecard (Hero Score + 4 Dimensions + Percentile) */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Developer Scorecard
                </span>
                {/* Honest Percentile Display */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-900/80 border border-slate-800 text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Percentile: </span>
                  <span className="text-slate-300 font-bold">
                    {analysis.percentile_status || 'Benchmark data developing'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Circular Overall Score Hero (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-950/80 border border-purple-800/40 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Overall Score
                  </span>
                  
                  <div className="relative flex items-center justify-center">
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-slate-800/80"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        stroke="url(#scoreGradientV3)"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="scoreGradientV3" x1="0%" y1="0%" x2="100%" y2="100%">
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
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-0.5">
                    <span className="text-xs font-mono font-bold text-purple-300">
                      Tier: {leagueName}
                    </span>
                    <p className="text-[11px] text-slate-500 max-w-[220px] leading-relaxed">
                      Determined strictly from observable repository signals.
                    </p>
                  </div>
                </div>

                {/* 4 Scorecard Dimension Bars (7 cols) */}
                <div className="lg:col-span-7 space-y-3.5 p-6 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Core Engineering Metrics
                  </span>
                  <div className="space-y-3">
                    {scoreBars.map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-200 font-medium">{item.label}</span>
                          <span className="font-mono font-bold text-slate-300">{item.score} / 100</span>
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
            </div>

            {/* 3. Developer DNA */}
            <DeveloperDNA dna={analysis.developer_dna} />

            {/* 4. Tech Stack Fingerprint */}
            <TechStackFingerprint techStack={analysis.tech_stack_fingerprint} />

            {/* 5. Your Strengths & 6. Your Weaknesses */}
            <StrengthsWeaknesses
              strengths={analysis.strengths}
              weaknesses={analysis.weaknesses}
            />

            {/* 7. Best Project */}
            {analysis.best_project && (
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                    <span>🏆</span>
                    <span>Best Project</span>
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

            {/* 8. 🔥 YOUR ROAST (One-line roast + Full roast) */}
            <div className="space-y-4">
              {/* One-Line Roast with Copy Button */}
              {analysis.one_line_roast && (
                <OneLineRoast oneLineRoast={analysis.one_line_roast} />
              )}

              {/* Full Roast Container */}
              <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-purple-950/70 via-slate-950 to-pink-950/50 border-2 border-purple-500/50 text-slate-100 shadow-xl shadow-purple-950/30 overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span className="text-xs font-black uppercase tracking-widest text-purple-300">
                      The Full Roast
                    </span>
                  </div>
                  <span className="text-xs font-mono text-purple-400/80">
                    Intensity: {analysis.roast_level || 'Brutal'} &bull; Grounded
                  </span>
                </div>

                <blockquote className="relative text-lg sm:text-xl font-semibold italic text-slate-100 leading-relaxed pl-4 border-l-4 border-purple-500">
                  "{analysis.roast}"
                </blockquote>
              </div>
            </div>

            {/* Developer Personality Archetype */}
            {analysis.developer_personality && (
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
                    Inferred strictly from observable commit cadence, repository naming, and documentation habits.
                  </p>
                </div>
                <span className="text-3xl px-3 py-2 rounded-2xl bg-purple-950/40 border border-purple-800/40">
                  🎯
                </span>
              </div>
            )}

            {/* 9. Your Action Plan (3-5 actions) */}
            <ActionPlan actionPlan={analysis.action_plan} />

            {/* 10. Compare Your Progress & History */}
            <HistoricalComparison currentSnapshot={currentSnapshot} />
          </div>
        )}

      </div>
    </section>
  );
}
