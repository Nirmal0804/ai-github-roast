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
    <div className="min-h-screen relative overflow-hidden bg-[#030712] text-slate-100 flex flex-col items-center selection:bg-purple-500 selection:text-white">
      {/* Background Ambient Radial Glows & Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-purple-600/15 via-pink-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-purple-900/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/2 -right-48 w-96 h-96 bg-pink-900/10 blur-3xl rounded-full pointer-events-none" />

      {/* Main Responsive Wrapper (max-w-5xl = 1024px to 1120px) */}
      <main className="relative z-10 w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-10">
        
        {/* Top Navigation & Reset */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/50 shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>Bored → Built #01</span>
          </div>

          {(profileData || analysisData) && (
            <button
              onClick={handleReset}
              className="text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Analyze Another</span>
            </button>
          )}
        </div>

        {/* Hero Section */}
        <section className="text-center space-y-4 max-w-2xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            <span className="bg-gradient-to-r from-slate-100 via-purple-100 to-slate-300 bg-clip-text text-transparent">
              AI Roast My
            </span>{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              GitHub
            </span>
          </h1>
          <p className="text-slate-400 text-base sm:text-lg font-normal leading-relaxed">
            Your public repositories tell a story. We inspect your code habits, README dedication, and engineering patterns — then roast you with brutal honesty.
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
                <div className="relative p-6 sm:p-7 rounded-2xl bg-gradient-to-b from-purple-950/70 via-slate-900 to-pink-950/40 border border-purple-500/40 space-y-6 shadow-xl shadow-purple-950/30">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-400">
                      <span>⚡</span>
                      <span>Next Step: Select Roast Level &amp; Launch</span>
                    </span>
                    <h4 className="text-lg font-black text-slate-100">
                      Ready to face the AI Reviewer?
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                      We'll pass your verified repository dataset to Gemini 2.5 on OpenRouter to craft an evidence-grounded roast, developer scorecard, and practical action plan.
                    </p>
                  </div>

                  {/* Roast Level Selector */}
                  <RoastLevelSelector
                    value={roastLevel}
                    onChange={setRoastLevel}
                    disabled={isAnalyzing}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                    <span className="text-xs text-slate-400 font-mono">
                      Selected: <strong className="text-purple-300 uppercase">{roastLevel}</strong>
                    </span>

                    <button
                      onClick={handleRunAiRoast}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] transition-all shadow-lg shadow-purple-900/40 hover:shadow-purple-700/50 cursor-pointer"
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
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2 text-center sm:text-left">
                <span className="text-2xl">📊</span>
                <h3 className="text-sm font-bold text-slate-200">Grounded Evidence</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real metrics only. We inspect commit cadence, original work vs. forks, and tech stack breadth.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2 text-center sm:text-left">
                <span className="text-2xl">🔥</span>
                <h3 className="text-sm font-bold text-slate-200">Playful &amp; Sharp</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  A senior engineering friend roasting your README habits and abandoned weekend projects.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2 text-center sm:text-left">
                <span className="text-2xl">🚀</span>
                <h3 className="text-sm font-bold text-slate-200">Actionable Advice</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Three realistic, high-leverage recommendations tailored to strengthen your GitHub profile.
                </p>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Clean Footer (No internal development wording) */}
      <footer className="w-full mt-auto py-8 text-center text-xs text-slate-400 border-t border-slate-900/80 relative z-10">
        <p>
          AI Roast My GitHub &bull; Bored → Built #01 &bull; Powered by Gemini 2.5 via OpenRouter
        </p>
      </footer>
    </div>
  );
}
