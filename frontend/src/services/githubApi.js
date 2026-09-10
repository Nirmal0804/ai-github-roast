const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * Validate a GitHub username or URL via backend API and retrieve profile data.
 * @param {string} input - GitHub username or profile URL
 * @returns {Promise<{valid: boolean, username: string, profile: object}>}
 */
export async function validateGithubInput(input) {
  const trimmed = input?.trim();
  if (!trimmed) {
    throw new Error('Please enter a GitHub username or profile URL.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/github/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input: trimmed }),
    });
  } catch (networkError) {
    throw new Error("Couldn't reach GitHub right now. Please try again.");
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail;
    } catch {
      // response wasn't JSON
    }

    if (response.status === 404) {
      throw new Error(errorDetail || 'GitHub user not found. Check the username or URL.');
    }
    if (response.status === 400) {
      throw new Error(errorDetail || 'Enter a valid GitHub username or profile URL.');
    }
    if (response.status === 429 || response.status === 403) {
      throw new Error(errorDetail || 'GitHub API rate limit reached. Please try again later.');
    }
    if (response.status >= 500) {
      throw new Error(errorDetail || "Couldn't reach GitHub right now. Please try again.");
    }

    throw new Error(errorDetail || 'An unexpected error occurred. Please try again.');
  }

  return await response.json();
}

/**
 * Fetch and process public GitHub repositories and aggregate signals for a user.
 * @param {string} username - GitHub username
 * @returns {Promise<{username: string, summary: object, top_repositories: Array, repositories: Array}>}
 */
export async function getGithubRepositories(username) {
  const trimmed = username?.trim();
  if (!trimmed) {
    throw new Error('Username is required to fetch repositories.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/github/${encodeURIComponent(trimmed)}/repositories`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
  } catch (networkError) {
    throw new Error("Couldn't reach GitHub right now. Please try again.");
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail;
    } catch {
      // response wasn't JSON
    }

    if (response.status === 404) {
      throw new Error(errorDetail || 'GitHub user not found.');
    }
    if (response.status === 400) {
      throw new Error(errorDetail || 'Invalid GitHub username.');
    }
    if (response.status === 429 || response.status === 403) {
      throw new Error(errorDetail || 'GitHub API rate limit reached. Please try again later.');
    }
    if (response.status >= 500) {
      throw new Error(errorDetail || "Couldn't reach GitHub right now. Please try again.");
    }

    throw new Error(errorDetail || 'An unexpected error occurred while fetching repositories.');
  }

  return await response.json();
}

/**
 * Trigger backend AI analysis for a developer using OpenRouter.
 * @param {string} username - GitHub username
 * @param {string} [roastLevel='brutal'] - Roast intensity ('friendly', 'brutal', 'nuclear')
 * @returns {Promise<{username: string, analysis: object}>}
 */
export async function analyzeGithubUser(username, roastLevel = 'brutal') {
  const trimmed = username?.trim();
  if (!trimmed) {
    throw new Error('Username is required for AI analysis.');
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api/github/${encodeURIComponent(trimmed)}/analyze`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roast_level: roastLevel }),
    });
  } catch (networkError) {
    throw new Error("Couldn't reach AI analysis service. Please check your connection and try again.");
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail;
    } catch {
      // response wasn't JSON
    }

    if (response.status === 404) {
      throw new Error(errorDetail || 'GitHub user not found.');
    }
    if (response.status === 429) {
      throw new Error(errorDetail || 'AI analysis rate limit reached. Please try again later.');
    }
    if (response.status >= 500) {
      throw new Error(errorDetail || 'AI service error. Check OpenRouter API configuration.');
    }

    throw new Error(errorDetail || 'Failed to complete AI analysis. Please try again.');
  }

  return await response.json();
}
