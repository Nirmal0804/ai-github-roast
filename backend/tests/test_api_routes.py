import json
import os
import unittest
from unittest.mock import patch, MagicMock
import httpx

from app.main import app


class TestApiRoutesIntegration(unittest.IsolatedAsyncioTestCase):
    """End-to-end FastAPI route tests using ASGITransport (no live network calls)."""

    async def asyncSetUp(self):
        self.transport = httpx.ASGITransport(app=app)
        self.client = httpx.AsyncClient(transport=self.transport, base_url="http://test")

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_root_and_health(self):
        r1 = await self.client.get("/")
        self.assertEqual(r1.status_code, 200)
        self.assertIn("running", r1.json()["message"])

        r2 = await self.client.get("/health")
        self.assertEqual(r2.status_code, 200)
        self.assertEqual(r2.json()["status"], "healthy")

    async def test_validate_route(self):
        # 1. Successful validation
        mock_profile = {
            "login": "nirmal",
            "name": "Nirmal Patel",
            "avatar_url": "https://avatars.githubusercontent.com/u/1",
            "html_url": "https://github.com/nirmal",
            "public_repos": 5,
        }
        with patch("app.api.routes.github.get_github_profile", return_value=mock_profile):
            resp = await self.client.post("/api/github/validate", json={"input": "github.com/nirmal"})
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertTrue(data["valid"])
            self.assertEqual(data["username"], "nirmal")

        # 2. Invalid URL input (HTTP 400)
        resp_400 = await self.client.post("/api/github/validate", json={"input": "https://github.com/nirmal/extra-path"})
        self.assertEqual(resp_400.status_code, 400)

    async def test_repositories_route(self):
        mock_repos = [
            {"id": 1, "name": "repo-a", "stargazers_count": 10, "forks_count": 2, "language": "Python"}
        ]
        with patch("app.api.routes.github.fetch_user_repositories", return_value=mock_repos):
            resp = await self.client.get("/api/github/nirmal/repositories")
            self.assertEqual(resp.status_code, 200)
            data = resp.json()
            self.assertEqual(data["username"], "nirmal")
            self.assertIn("summary", data)
            self.assertEqual(data["summary"]["total_public_repositories"], 1)

    async def test_analyze_route_success(self):
        mock_profile = {"login": "nirmal", "name": "Nirmal Patel"}
        mock_repos = [{"id": 1, "name": "repo-a", "stargazers_count": 10, "forks_count": 2, "language": "Python"}]
        mock_analysis = {
            "overall_score": 85,
            "technical_depth_score": 80,
            "project_quality_score": 85,
            "documentation_score": 75,
            "consistency_score": 90,
            "developer_personality": "Quiet Builder",
            "strongest_signal": "Consistent Python projects.",
            "biggest_weakness": "Minimal documentation.",
            "best_project": {"name": "repo-a", "reason": "Solid architecture."},
            "roast": "You write code like a secret agent: effective, but no one knows how you did it.",
            "recommendations": ["Add a README.", "Pin your project.", "Tag topics."],
        }

        with patch("app.api.routes.github.get_github_profile", return_value=mock_profile):
            with patch("app.api.routes.github.fetch_user_repositories", return_value=mock_repos):
                with patch(
                    "app.api.routes.github.analyze_github_data",
                    return_value=mock_analysis,
                ):
                    resp = await self.client.post("/api/github/nirmal/analyze")
                    self.assertEqual(resp.status_code, 200)
                    data = resp.json()
                    self.assertEqual(data["username"], "nirmal")
                    self.assertEqual(data["analysis"]["overall_score"], 85)
                    self.assertEqual(data["analysis"]["developer_personality"], "Quiet Builder")

    async def test_analyze_route_missing_api_key(self):
        mock_profile = {"login": "nirmal", "name": "Nirmal Patel"}
        mock_repos = []

        with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}):
            with patch("app.api.routes.github.get_github_profile", return_value=mock_profile):
                with patch("app.api.routes.github.fetch_user_repositories", return_value=mock_repos):
                    resp = await self.client.post("/api/github/nirmal/analyze")
                    self.assertEqual(resp.status_code, 500)
                    self.assertIn("OpenRouter API key is not configured", resp.json()["detail"])


if __name__ == "__main__":
    unittest.main()
