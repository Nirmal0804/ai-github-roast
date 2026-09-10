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

  const overallScore = Number(analysis.overall_score) || 0;
  const scoreBars = [
    { label: 'Technical Depth', score: Number(analysis.technical_depth_score) || 0, gradient: 'from-[#3F0D63] via-[#6D28A8] to-[#A855F7]' },
    { label: 'Project Quality', score: Number(analysis.project_quality_score) || 0, gradient: 'from-[#4C1D95] via-[#7C3AED] to-[#C084FC]' },
    { label: 'Documentation', score: Number(analysis.documentation_score) || 0, gradient: 'from-[#6D28A8] via-[#8B5CF6] to-[#D8B4FE]' },
    { label: 'Consistency', score: Number(analysis.consistency_score) || 0, gradient: 'from-[#581C87] via-[#9333EA] to-[#A855F7]' },
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
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, overallScore)) / 100) * circumference;

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl glass-panel border border-[rgba(168,85,247,0.22)] shadow-[0_10px_30px_rgba(0,0,0,0.30)] no-export">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#C4B5D4]">
            Report Lens:
          </span>
          <span className="text-xs text-white font-medium">
            {reportMode === 'developer' ? '🔥 Humorous Developer Roast' : '💼 Professional Recruiter Assessment'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[rgba(15,5,25,0.70)] border border-[rgba(168,85,247,0.20)]">
          <button
            type="button"
            onClick={() => setReportMode('developer')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
              reportMode === 'developer'
                ? 'btn-purple-gradient text-white shadow-md shadow-[#6D28A8]/40'
                : 'text-[#C4B5D4] hover:text-white'
            }`}
          >
            Developer Mode
          </button>

          <button
            type="button"
            onClick={() => setReportMode('recruiter')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer select-none ${
              reportMode === 'recruiter'
                ? 'btn-purple-gradient text-white shadow-md shadow-[#6D28A8]/40'
                : 'text-[#C4B5D4] hover:text-white'
            }`}
          >
            Recruiter Mode
          </button>
        </div>
      </div>

      {/* Main Exportable Container */}
      <div
        id="ai-roast-report-export-area"
        className="relative rounded-3xl glass-panel border border-[rgba(168,85,247,0.28)] p-6 sm:p-9 shadow-[0_25px_70px_rgba(0,0,0,0.45)] space-y-8 overflow-hidden"
      >
        {/* Ambient Glow accent inside report */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[500px] h-36 bg-[#6D28A8]/20 blur-3xl rounded-full pointer-events-none" />

        {/* 1. Header & Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-6 border-b border-[rgba(168,85,247,0.18)]">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name || username}
                className="w-16 h-16 rounded-2xl border-2 border-[rgba(168,85,247,0.40)] object-cover shadow-[0_0_20px_rgba(109,40,168,0.35)]"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[rgba(63,13,99,0.60)] border border-[rgba(168,85,247,0.30)] flex items-center justify-center text-2xl font-black text-[#A855F7] shadow-[0_0_20px_rgba(109,40,168,0.30)]">
                {(username || 'G').charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[rgba(63,13,99,0.50)] text-white border border-[rgba(168,85,247,0.30)] shadow-sm">
                  <span>🔥</span>
                  <span>AI Roast Report</span>
                </span>

                {/* Developer League Badge */}
                <span className="text-[11px] font-extrabold font-mono px-3 py-1 rounded-full bg-gradient-to-r from-[rgba(63,13,99,0.60)] to-[rgba(109,40,168,0.50)] text-white border border-[rgba(168,85,247,0.40)] shadow-[0_0_15px_rgba(168,85,247,0.25)]">
                  🏆 {leagueName} {leagueRange && `(${leagueRange})`}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
                {profile?.name || username}
                <span className="text-sm font-normal text-[#A855F7] font-mono ml-2">
                  @{username}
                </span>
              </h2>
            </div>
          </div>

          <div className="text-xs text-[#C4B5D4] sm:text-right font-mono space-y-0.5">
            <div className="text-white font-bold">Verified GitHub Signals</div>
            <div className="text-[11px] text-[#C4B5D4]/80">Model: Gemini 2.5 Flash</div>
            {analysis.roast_level && (
              <div className="text-[11px] text-[#A855F7] font-semibold capitalize">
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
                <span className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] block">
                  Developer Scorecard
                </span>
                {/* Honest Percentile Display */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-[rgba(63,13,99,0.40)] border border-[rgba(168,85,247,0.22)] text-[#C4B5D4]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse" />
                  <span>Percentile: </span>
                  <span className="text-white font-bold">
                    {analysis.percentile_status || 'Benchmark data developing'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Circular Overall Score Hero (5 cols) */}
                <div className="lg:col-span-5 p-6 rounded-2xl glass-panel border border-[rgba(168,85,247,0.28)] flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[0_15px_40px_rgba(63,13,99,0.30)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] mb-3">
                    Overall Score
                  </span>
                  
                  <div className="relative flex items-center justify-center">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-[rgba(63,13,99,0.40)]"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        stroke="url(#purpleScoreGradient)"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                      />
                      <defs>
                        <linearGradient id="purpleScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3F0D63" />
                          <stop offset="50%" stopColor="#6D28A8" />
                          <stop offset="100%" stopColor="#A855F7" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-4xl font-black font-mono tracking-tight text-white drop-shadow-md">
                        {overallScore}
                      </span>
                      <span className="text-[11px] text-[#C4B5D4] font-bold uppercase tracking-wider">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-0.5">
                    <span className="text-xs font-mono font-bold text-[#A855F7]">
                      Tier: {leagueName}
                    </span>
                    <p className="text-[11px] text-[#C4B5D4]/70 max-w-[220px] leading-relaxed">
                      Determined strictly from observable repository signals.
                    </p>
                  </div>
                </div>

                {/* 4 Scorecard Dimension Bars (7 cols) */}
                <div className="lg:col-span-7 space-y-3.5 p-6 rounded-2xl glass-panel border border-[rgba(168,85,247,0.20)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C4B5D4] block mb-2">
                    Core Engineering Metrics
                  </span>
                  <div className="space-y-3">
                    {scoreBars.map((item) => (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white font-medium">{item.label}</span>
                          <span className="font-mono font-bold text-[#A855F7]">{item.score} / 100</span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-[rgba(15,5,25,0.75)] border border-[rgba(168,85,247,0.15)] overflow-hidden shadow-inner">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${item.gradient} transition-all duration-700 ease-out shadow-[0_0_10px_rgba(168,85,247,0.4)]`}
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
              <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-[rgba(168,85,247,0.22)] space-y-2.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
                    <span className="text-[#A855F7]">🏆</span>
                    <span>Best Project</span>
                  </div>
                  {standoutUrl && (
                    <a
                      href={standoutUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold text-[#A855F7] hover:text-white bg-[rgba(63,13,99,0.40)] hover:bg-[rgba(109,40,168,0.50)] border border-[rgba(168,85,247,0.25)] hover:border-[rgba(168,85,247,0.45)] transition-all"
                    >
                      <span>View repository</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="text-base sm:text-lg font-bold text-white font-mono">
                  {standoutRepoName && standoutRepoName.toLowerCase() !== 'null'
                    ? standoutRepoName
                    : 'Insufficient evidence for standout project'}
                </div>

                <p className="text-xs sm:text-sm text-[#C4B5D4] leading-relaxed">
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
              <div className="relative p-6 sm:p-8 rounded-2xl glass-panel border-2 border-[rgba(168,85,247,0.40)] text-white shadow-[0_20px_50px_rgba(63,13,99,0.40)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <span className="text-xs font-black uppercase tracking-widest text-[#A855F7]">
                      The Full Roast
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#C4B5D4]">
                    Intensity: <strong className="text-white capitalize">{analysis.roast_level || 'Brutal'}</strong> &bull; Grounded
                  </span>
                </div>

                <blockquote className="relative text-lg sm:text-xl font-semibold italic text-white leading-relaxed pl-4 border-l-4 border-[#A855F7]">
                  "{analysis.roast}"
                </blockquote>
              </div>
            </div>

            {/* Developer Personality Archetype */}
            {analysis.developer_personality && (
              <div className="p-5 rounded-2xl glass-panel border border-[rgba(168,85,247,0.22)] flex items-start sm:items-center justify-between gap-4 flex-wrap">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#A855F7]">
                    <span>🧠</span>
                    <span>Developer Personality Archetype</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {analysis.developer_personality}
                  </h3>
                  <p className="text-xs text-[#C4B5D4] leading-relaxed">
                    Inferred strictly from observable commit cadence, repository naming, and documentation habits.
                  </p>
                </div>
                <span className="text-3xl px-3.5 py-2.5 rounded-2xl bg-[rgba(63,13,99,0.50)] border border-[rgba(168,85,247,0.30)] shadow-[0_0_15px_rgba(168,85,247,0.25)]">
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
