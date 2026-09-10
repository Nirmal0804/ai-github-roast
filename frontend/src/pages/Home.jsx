import { useState } from 'react';
import GitHubInput from '../components/GitHubInput.jsx';
import ProfilePreview from '../components/ProfilePreview.jsx';
import RepositorySummary from '../components/RepositorySummary.jsx';
import AIAnalysisReport from '../components/AIAnalysisReport.jsx';
import RoastLevelSelector from '../components/RoastLevelSelector.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingState from '../components/LoadingState.jsx';
import {
  validateGithubInput,
  getGithubRepositories,
  analyzeGithubUser,
} from '../services/githubApi.js';
import { saveAnalysisSnapshot } from '../utils/historyStorage.js';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Checking GitHub...');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState(null);
  const [repositoryData, setRepositoryData] = useState(null);
  const [lastInput, setLastInput] = useState('');

  // AI Analysis state & V3 controls
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [roastLevel, setRoastLevel] = useState('brutal');
  const [currentSnapshot, setCurrentSnapshot] = useState(null);

  const handleAnalyze = async (input) => {
    const trimmed = input.trim();
    if (trimmed === lastInput && profileData && repositoryData) {
      return;
    }

    setIsLoading(true);
    setLoadingMessage('Validating GitHub profile...');
    setError('');
    setProfileData(null);
    setRepositoryData(null);
    setAnalysisData(null);
    setAnalysisError('');

    try {
      // 1. Validate profile
      const validProfile = await validateGithubInput(trimmed);
      setProfileData(validProfile);

      // 2. Fetch and process repositories
      setLoadingMessage('Analyzing public repositories & signals...');
      const repoDataset = await getGithubRepositories(validProfile.username);
      setRepositoryData(repoDataset);
      setLastInput(trimmed);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunAiRoast = async () => {
    if (!profileData?.username || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError('');
    setAnalysisData(null);
    setCurrentSnapshot(null);

    try {
      const result = await analyzeGithubUser(profileData.username, roastLevel);
      setAnalysisData(result);

      // Save compact snapshot locally for history & comparison
      const snapshot = saveAnalysisSnapshot(
        profileData.username,
        result,
        repositoryData,
        roastLevel
      );
      setCurrentSnapshot(snapshot);
    } catch (err) {
      setAnalysisError(err.message || 'Failed to complete AI roast. Please check your OpenRouter configuration.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setProfileData(null);
    setRepositoryData(null);
    setAnalysisData(null);
    setCurrentSnapshot(null);
    setError('');
    setAnalysisError('');
    setLastInput('');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#09030F] text-white flex flex-col items-center selection:bg-[#A855F7] selection:text-white">
      {/* Layered Dark-Purple Ambient Background */}
      <div className="absolute inset-0 bg-grid-purple opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-dots-purple opacity-30 pointer-events-none" />
      
      {/* Ambient Radial Glowing Orbs */}
      <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-[#3F0D63]/30 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-0 -right-32 w-[600px] h-[600px] bg-[#6D28A8]/25 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#A855F7]/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-[#3F0D63]/20 rounded-full blur-[150px] pointer-events-none" />

      {/* Header / Navbar */}
      <header className="w-full relative z-20 border-b border-[rgba(168,85,247,0.15)] bg-[rgba(9,3,15,0.75)] backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6D28A8] to-[#3F0D63] border border-[rgba(168,85,247,0.30)] flex items-center justify-center text-sm shadow-[0_0_15px_rgba(168,85,247,0.35)]">
              🔥
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
              AI Roast <span className="text-[#A855F7]">My GitHub</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(63,13,99,0.35)] text-[#C4B5D4] border border-[rgba(168,85,247,0.22)] shadow-sm backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] animate-pulse" />
              <span>Bored → Built #01</span>
            </div>

            {(profileData || analysisData) && (
              <button
                onClick={handleReset}
                className="text-xs font-medium text-[#C4B5D4] hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(63,13,99,0.30)] hover:bg-[rgba(109,40,168,0.40)] border border-[rgba(168,85,247,0.20)] hover:border-[rgba(168,85,247,0.40)] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Analyze Another</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Responsive Wrapper */}
      <main className="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        
        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-4xl mx-auto pt-2">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-extrabold tracking-widest text-[#A855F7] uppercase px-3.5 py-1 rounded-full bg-[rgba(63,13,99,0.35)] border border-[rgba(168,85,247,0.25)] backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.20)]">
              ✦ AI-POWERED GITHUB ANALYSIS
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight whitespace-nowrap">
            <span className="text-white">AI ROAST </span>
            <span className="bg-gradient-to-r from-white via-[#C4B5D4] to-[#A855F7] bg-clip-text text-transparent">
              MY GITHUB
            </span>
          </h1>

          <p className="text-[#C4B5D4] text-base sm:text-lg font-normal leading-relaxed">
            Your GitHub deserves an honest review.
          </p>
        </section>

        {/* Search & Input Container */}
        <section aria-label="GitHub username search" className="max-w-2xl mx-auto">
          <GitHubInput
            onSubmit={handleAnalyze}
            isLoading={isLoading || isAnalyzing}
            initialValue={lastInput}
          />
        </section>

        {/* Interactive Feedback & Content Area */}
        <section aria-live="polite" className="space-y-8">
          {/* Loading validation / repositories */}
          {isLoading && <LoadingState message={loadingMessage} />}

          {/* Errors */}
          {error && <ErrorMessage message={error} onRetry={() => lastInput && handleAnalyze(lastInput)} />}

          {/* Profile & Repository Snapshot */}
          {profileData?.profile && (
            <div className="space-y-6">
              <ProfilePreview
                profile={profileData.profile}
                username={profileData.username}
              />

              {repositoryData && (
                <RepositorySummary repositoryData={repositoryData} />
              )}

              {/* Ready for AI Roast Banner Callout */}
              {!analysisData && !isAnalyzing && (
                <div className="relative p-6 sm:p-7 rounded-2xl glass-panel space-y-6 border border-[rgba(168,85,247,0.28)] shadow-[0_20px_50px_rgba(63,13,99,0.35)]">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#A855F7]">
                      <span>⚡</span>
                      <span>Next Step: Select Roast Level &amp; Launch</span>
                    </span>
                    <h4 className="text-lg font-black text-white">
                      Ready to face the AI Reviewer?
                    </h4>
                    <p className="text-xs sm:text-sm text-[#C4B5D4] max-w-xl">
                      We'll pass your verified repository dataset to Gemini 2.5 on OpenRouter to craft an evidence-grounded roast, developer scorecard, and practical action plan.
                    </p>
                  </div>

                  {/* Roast Level Selector */}
                  <RoastLevelSelector
                    value={roastLevel}
                    onChange={setRoastLevel}
                    disabled={isAnalyzing}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[rgba(168,85,247,0.18)]">
                    <span className="text-xs text-[#C4B5D4] font-mono">
                      Selected: <strong className="text-[#A855F7] uppercase">{roastLevel}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={handleRunAiRoast}
                      disabled={isAnalyzing}
                      className="btn-purple-gradient w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white cursor-pointer shadow-lg shadow-[#6D28A8]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Roast This Profile ({roastLevel.toUpperCase()})</span>
                      <span>🔥</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Roast Generation Loading */}
              {isAnalyzing && (
                <LoadingState message={`Summoning the AI Roast Reviewer (${roastLevel.toUpperCase()} mode) via OpenRouter...`} />
              )}

              {/* Roast Generation Error */}
              {analysisError && (
                <ErrorMessage
                  message={analysisError}
                  onRetry={handleRunAiRoast}
                />
              )}

              {/* AI Roast Report - The Core Hero Payoff */}
              {analysisData && (
                <AIAnalysisReport
                  analysisData={analysisData}
                  profile={profileData.profile}
                  repositoryData={repositoryData}
                  currentSnapshot={currentSnapshot}
                />
              )}
            </div>
          )}

          {/* Empty State Showcase (when no profile has been entered yet) */}
          {!profileData && !isLoading && !error && (
            <div className="pt-6 space-y-6 max-w-4xl mx-auto">
              <div className="p-6 rounded-2xl glass-panel-subtle text-center space-y-2 border border-[rgba(168,85,247,0.18)]">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[rgba(63,13,99,0.50)] border border-[rgba(168,85,247,0.30)] text-xl mb-1 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                  <span>👾</span>
                </div>
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Drop a GitHub username. We'll do the rest.
                </h3>
                <p className="text-xs text-[#C4B5D4] max-w-md mx-auto">
                  Instant evidence-grounded developer intelligence, personality archetypes, and comedic reviews.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl glass-panel-interactive space-y-2 text-center sm:text-left">
                  <span className="text-2xl">📊</span>
                  <h3 className="text-sm font-bold text-white">Grounded Evidence</h3>
                  <p className="text-xs text-[#C4B5D4] leading-relaxed">
                    Real metrics only. We inspect commit cadence, original work vs. forks, and tech stack breadth.
                  </p>
                </div>

                <div className="p-5 rounded-2xl glass-panel-interactive space-y-2 text-center sm:text-left">
                  <span className="text-2xl">🔥</span>
                  <h3 className="text-sm font-bold text-white">Playful &amp; Sharp</h3>
                  <p className="text-xs text-[#C4B5D4] leading-relaxed">
                    A senior engineering friend roasting your README habits and abandoned weekend projects.
                  </p>
                </div>

                <div className="p-5 rounded-2xl glass-panel-interactive space-y-2 text-center sm:text-left">
                  <span className="text-2xl">🚀</span>
                  <h3 className="text-sm font-bold text-white">Actionable Advice</h3>
                  <p className="text-xs text-[#C4B5D4] leading-relaxed">
                    Prioritized, high-leverage recommendations tailored to strengthen your GitHub profile.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Clean Footer */}
      <footer className="w-full mt-auto py-8 text-center text-xs text-[#C4B5D4] border-t border-[rgba(168,85,247,0.15)] bg-[rgba(9,3,15,0.70)] backdrop-blur-xl relative z-10">
        <p>
          AI Roast My GitHub &bull; Bored → Built #01 &bull; Powered by Gemini 2.5 via OpenRouter
        </p>
      </footer>
    </div>
  );
}
