const STORAGE_KEY = 'ai_github_roast_history_v1';
const MAX_SNAPSHOTS = 20;

/**
 * Retrieve analysis history from browser localStorage.
 * Handles parsing errors and missing data safely.
 * @returns {Array<object>}
 */
export function getAnalysisHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (err) {
    console.warn('Failed to parse analysis history from localStorage:', err);
    return [];
  }
}

/**
 * Save a compact analysis snapshot to localStorage.
 * Only stores necessary metrics, no API keys or raw API dumps.
 * Keeps at most MAX_SNAPSHOTS (20).
 *
 * @param {string} username
 * @param {object} analysisData
 * @param {object} repositoryData
 * @param {string} roastLevel
 * @returns {object} The created snapshot
 */
export function saveAnalysisSnapshot(username, analysisData, repositoryData, roastLevel = 'brutal') {
  if (!username || !analysisData?.analysis) return null;

  const analysis = analysisData.analysis;
  const now = new Date();
  
  const snapshot = {
    id: `snap_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    dateLabel: now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    username: username.trim(),
    roast_level: roastLevel || analysis.roast_level || 'brutal',
    overall_score: Number(analysis.overall_score) || 0,
    technical_depth_score: Number(analysis.technical_depth_score) || 0,
    project_quality_score: Number(analysis.project_quality_score) || 0,
    documentation_score: Number(analysis.documentation_score) || 0,
    consistency_score: Number(analysis.consistency_score) || 0,
    league: analysis.league || null,
    league_min_score: analysis.league_min_score ?? null,
    league_max_score: analysis.league_max_score ?? null,
    one_line_roast: analysis.one_line_roast || null,
    developer_dna: analysis.developer_dna || null,
    developer_personality: analysis.developer_personality || null,
    repo_count: repositoryData?.summary?.public_repository_count ?? repositoryData?.repositories?.length ?? 0,
    total_stars: repositoryData?.summary?.total_stars_earned ?? 0,
  };

  try {
    const history = getAnalysisHistory();
    // Prepend new snapshot, limit to MAX_SNAPSHOTS
    const updated = [snapshot, ...history].slice(0, MAX_SNAPSHOTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save analysis snapshot to localStorage:', err);
  }

  return snapshot;
}

/**
 * Clear all stored analysis snapshots after user confirmation.
 */
export function clearAnalysisHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history from localStorage:', err);
  }
}
