import os
import unittest
from pathlib import Path
from dotenv import load_dotenv

from app.models.analysis import DeveloperAnalysis
from app.services.ai_service import analyze_github_data

# Resolve and load backend/.env if not already loaded
backend_dir = Path(__file__).resolve().parent.parent
env_file = backend_dir / ".env"
if env_file.exists():
    load_dotenv(dotenv_path=env_file)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()


@unittest.skipUnless(
    bool(GEMINI_API_KEY and not GEMINI_API_KEY.startswith("your_")),
    "GEMINI_API_KEY is not configured or is a placeholder; skipping live Gemini API integration test.",
)
class TestGeminiLiveIntegration(unittest.IsolatedAsyncioTestCase):
    """Optional live integration test against the real Google Gemini API."""

    async def test_live_gemini_octocat_analysis(self):
        profile = {
            "login": "octocat",
            "name": "The Octocat",
            "bio": "Building open source tools.",
            "public_repos": 8,
            "followers": 120,
            "following": 5,
            "created_at": "2020-01-01T00:00:00Z",
        }
        summary = {
            "total_public_repositories": 8,
            "total_original_repositories": 6,
            "total_forked_repositories": 2,
            "total_archived_repositories": 0,
            "active_repositories": 6,
            "total_stars": 340,
            "total_forks": 45,
            "languages_used": ["TypeScript", "Python"],
            "language_counts": {"TypeScript": 4, "Python": 2},
            "repositories_with_readme": 6,
            "repositories_with_license": 5,
            "repositories_with_description": 7,
            "recently_active_repositories": 5,
            "documentation_rate": 1.0,
            "license_rate": 0.833,
            "description_rate": 1.0,
            "activity_rate": 0.833,
        }
        top_repos = [
            {
                "name": "spoon-knife",
                "description": "Reputed demo repository",
                "language": "TypeScript",
                "topics": ["demo", "starter"],
                "stars": 250,
                "forks": 35,
                "has_readme": True,
                "has_license": True,
                "is_fork": False,
                "is_archived": False,
                "created_at": "2021-01-01T00:00:00Z",
                "updated_at": "2026-08-01T00:00:00Z",
                "pushed_at": "2026-08-01T00:00:00Z",
                "html_url": "https://github.com/octocat/spoon-knife",
            }
        ]

        result = await analyze_github_data(profile, summary, top_repos, roast_level="brutal")
        self.assertIsInstance(result, DeveloperAnalysis)
        self.assertGreaterEqual(result.overall_score, 0)
        self.assertLessEqual(result.overall_score, 100)
        self.assertEqual(len(result.recommendations), 3)
        self.assertTrue(len(result.roast) > 0)
        self.assertTrue(len(result.developer_personality) > 0)


if __name__ == "__main__":
    unittest.main()
