import json
import os
import unittest
from unittest.mock import patch, MagicMock, AsyncMock
import httpx
from fastapi import HTTPException
from google.genai.errors import APIError

from app.main import app
from app.models.analysis import DeveloperAnalysis, AnalyzeGithubResponse
from app.services.ai_service import (
    analyze_github_data,
    build_analysis_prompt,
    DEFAULT_GEMINI_MODEL,
)


class TestStep5EndToEndAiIntegration(unittest.IsolatedAsyncioTestCase):
    """Test suite specifically covering Step 5 end-to-end AI analysis requirements with Google Gemini."""

    def setUp(self):
        self.mock_api_key = "mock-gemini-step5-key"
        self.profile = {
            "login": "octocat",
            "name": "The Octocat",
            "bio": "Building open-source tools.",
            "public_repos": 8,
            "followers": 120,
            "following": 5,
            "created_at": "2020-01-01T00:00:00Z",
        }
        self.summary = {
            "total_public_repositories": 8,
            "total_original_repositories": 6,
            "total_forked_repositories": 2,
            "total_archived_repositories": 0,
            "active_repositories": 6,
            "total_stars": 340,
            "total_forks": 45,
            "languages_used": ["TypeScript", "Python", "Rust"],
            "language_counts": {"TypeScript": 4, "Python": 2, "Rust": 1},
            "repositories_with_readme": 6,
            "repositories_with_license": 5,
            "repositories_with_description": 7,
            "recently_active_repositories": 5,
            "documentation_rate": 1.0,
            "license_rate": 0.833,
            "description_rate": 1.0,
            "activity_rate": 0.833,
        }
        self.top_repos = [
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
        self.valid_ai_response = {
            "overall_score": 88,
            "technical_depth_score": 85,
            "project_quality_score": 90,
            "documentation_score": 92,
            "consistency_score": 84,
            "developer_personality": "Systematic Full-Stack Builder",
            "strongest_signal": "Flawless documentation and high-quality TypeScript repositories.",
            "biggest_weakness": "Concentration of stars in a single standout repository.",
            "best_project": {
                "name": "spoon-knife",
                "reason": "Highest star count and clean TypeScript implementation with complete README.",
            },
            "roast": "You maintain your GitHub with the precision of a Swiss watchmaker, yet 90% of your star count rests comfortably on one project. The other repos are just watching from the sidelines.",
            "recommendations": [
                "Cross-reference your standout project from other smaller utilities.",
                "Add CI/CD status badges to your top repositories.",
                "Publish a developer roadmap in your profile README.",
            ],
        }

    def test_grounded_prompt_construction(self):
        """Verify prompt embeds all essential GitHub signals and enforces grounding rules."""
        system_prompt, user_prompt = build_analysis_prompt(
            self.profile, self.summary, self.top_repos
        )

        # Grounding rules in system prompt
        self.assertIn("STRICT GROUNDING", system_prompt)
        self.assertIn("NEVER invent private repositories", system_prompt)
        self.assertIn("Insufficient evidence", system_prompt)
        self.assertIn("EXACTLY 3", system_prompt)
        self.assertIn("0 to 100", system_prompt)

        # User payload contains profile, summary, and repo evidence
        payload = json.loads(user_prompt.split("\n\n", 1)[1])
        self.assertEqual(payload["PROFILE"]["username"], "octocat")
        self.assertEqual(payload["REPOSITORY_SUMMARY"]["total_stars"], 340)
        self.assertEqual(payload["REPOSITORY_SUMMARY"]["documentation_rate"], 1.0)
        self.assertEqual(len(payload["TOP_REPOSITORIES"]), 1)
        self.assertEqual(payload["TOP_REPOSITORIES"][0]["name"], "spoon-knife")

    async def test_gemini_model_and_config_used_in_request(self):
        """Verify Gemini client configuration, model selection, and structured output parameters."""
        with patch.dict(os.environ, {"GEMINI_API_KEY": self.mock_api_key, "GEMINI_MODEL": "gemini-2.5-flash"}):
            mock_response = MagicMock()
            mock_response.text = json.dumps(self.valid_ai_response)

            with patch("app.services.ai_service.genai.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.aio.models.generate_content = AsyncMock(return_value=mock_response)
                mock_client_cls.return_value = mock_client

                res = await analyze_github_data(self.profile, self.summary, self.top_repos)
                self.assertIsInstance(res, DeveloperAnalysis)

                mock_client_cls.assert_called_with(api_key=self.mock_api_key)
                call_args = mock_client.aio.models.generate_content.call_args
                self.assertEqual(call_args.kwargs["model"], "gemini-2.5-flash")
                config = call_args.kwargs["config"]
                self.assertEqual(config.response_mime_type, "application/json")
                self.assertEqual(config.response_schema, DeveloperAnalysis)

    async def test_gemini_429_quota_exhausted(self):
        """Verify HTTP 429 Quota/Rate limit returns a clear HTTP 429 with actionable message."""
        with patch.dict(os.environ, {"GEMINI_API_KEY": self.mock_api_key}):
            with patch("app.services.ai_service.genai.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.aio.models.generate_content = AsyncMock(
                    side_effect=APIError(429, {"error": {"message": "RESOURCE_EXHAUSTED", "status": "RESOURCE_EXHAUSTED"}})
                )
                mock_client_cls.return_value = mock_client

                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)
                self.assertEqual(ctx.exception.status_code, 429)
                self.assertIn("Gemini API rate limit reached", ctx.exception.detail)

    async def test_gemini_404_model_not_found(self):
        """Verify HTTP 404 from Gemini returns a clear HTTP 502 regarding model configuration."""
        with patch.dict(os.environ, {"GEMINI_API_KEY": self.mock_api_key}):
            with patch("app.services.ai_service.genai.Client") as mock_client_cls:
                mock_client = MagicMock()
                mock_client.aio.models.generate_content = AsyncMock(
                    side_effect=APIError(404, {"error": {"message": "models/not-found is not found"}})
                )
                mock_client_cls.return_value = mock_client

                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)
                self.assertEqual(ctx.exception.status_code, 502)
                self.assertIn("Configured Gemini model was not found", ctx.exception.detail)

    async def test_end_to_end_analyze_route_success(self):
        """Verify full POST /api/github/{username}/analyze endpoint responds with valid schema."""
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            with patch("app.api.routes.github.get_github_profile", return_value=self.profile):
                with patch("app.api.routes.github.fetch_user_repositories", return_value=[]):
                    with patch(
                        "app.api.routes.github.analyze_github_data",
                        return_value=DeveloperAnalysis.model_validate(self.valid_ai_response),
                    ):
                        resp = await client.post("/api/github/octocat/analyze")
                        self.assertEqual(resp.status_code, 200)
                        data = resp.json()

                        # Enforce contract
                        self.assertEqual(data["username"], "octocat")
                        analysis = data["analysis"]
                        self.assertEqual(analysis["overall_score"], 88)
                        self.assertEqual(analysis["developer_personality"], "Systematic Full-Stack Builder")
                        self.assertEqual(len(analysis["recommendations"]), 3)
                        self.assertIn("spoon-knife", analysis["best_project"]["name"])

    async def test_end_to_end_analyze_route_nullable_best_project(self):
        """Verify response when developer has insufficient repositories for a standout project."""
        nullable_response = dict(self.valid_ai_response)
        nullable_response["best_project"] = {
            "name": None,
            "reason": "Insufficient repository evidence to identify a standout project.",
        }

        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            with patch("app.api.routes.github.get_github_profile", return_value=self.profile):
                with patch("app.api.routes.github.fetch_user_repositories", return_value=[]):
                    with patch(
                        "app.api.routes.github.analyze_github_data",
                        return_value=DeveloperAnalysis.model_validate(nullable_response),
                    ):
                        resp = await client.post("/api/github/octocat/analyze")
                        self.assertEqual(resp.status_code, 200)
                        data = resp.json()
                        self.assertIsNone(data["analysis"]["best_project"]["name"])


if __name__ == "__main__":
    unittest.main()
