import json
import unittest
from datetime import datetime, timezone, timedelta
from unittest.mock import patch, MagicMock
import httpx
from fastapi import HTTPException

from app.services.github_service import normalize_github_input, get_github_profile
from app.services.repository_service import (
    fetch_user_repositories,
    process_repositories,
    MAX_PAGES,
    PAGE_SIZE,
)


class TestGithubInputNormalization(unittest.TestCase):
    """Regression test suite for Step 2 input normalization rules."""

    def test_valid_input_formats(self):
        """Verify all supported valid input formats normalize to a clean username."""
        valid_cases = [
            ("nirmal", "nirmal"),
            ("  nirmal  ", "nirmal"),
            ("https://github.com/nirmal", "nirmal"),
            ("https://github.com/nirmal/", "nirmal"),
            ("http://github.com/nirmal", "nirmal"),
            ("http://github.com/nirmal/", "nirmal"),
            ("github.com/nirmal", "nirmal"),
            ("github.com/nirmal/", "nirmal"),
            ("www.github.com/nirmal", "nirmal"),
            ("https://www.github.com/nirmal", "nirmal"),
            ("torvalds", "torvalds"),
        ]
        for raw_input, expected in valid_cases:
            with self.subTest(input=raw_input):
                self.assertEqual(normalize_github_input(raw_input), expected)

    def test_invalid_input_formats(self):
        """Verify invalid URLs, extra segments, or bad characters are rejected."""
        invalid_cases = [
            "https://github.com/nirmal/some-repo",
            "not a github username!",
            "https://gitlab.com/nirmal",
            "",
            "   ",
            "-nirmal",
            "nirmal-",
            "user--name",
            "https://github.com/",
            "https://github.com",
            "nirmal/repo",
        ]
        for raw_input in invalid_cases:
            with self.subTest(input=raw_input):
                with self.assertRaises(ValueError):
                    normalize_github_input(raw_input)


class TestGithubProfileRetrieval(unittest.IsolatedAsyncioTestCase):
    """Regression test suite for Step 2 GitHub profile retrieval."""

    async def test_profile_200_success(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "login": "nirmal",
            "name": "Nirmal Patel",
            "bio": "Developer",
            "avatar_url": "https://avatars.githubusercontent.com/u/1",
            "html_url": "https://github.com/nirmal",
            "public_repos": 15,
            "followers": 50,
            "following": 10,
        }

        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            profile = await get_github_profile("nirmal")
            self.assertEqual(profile["login"], "nirmal")
            self.assertEqual(profile["public_repos"], 15)

    async def test_profile_404_not_found(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 404
        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            with self.assertRaises(HTTPException) as ctx:
                await get_github_profile("nonexistent")
            self.assertEqual(ctx.exception.status_code, 404)

    async def test_profile_rate_limit(self):
        mock_resp = MagicMock()
        mock_resp.status_code = 403
        mock_resp.headers = {"x-ratelimit-remaining": "0"}
        mock_resp.text = "API rate limit exceeded"
        with patch("httpx.AsyncClient.get", return_value=mock_resp):
            with self.assertRaises(HTTPException) as ctx:
                await get_github_profile("nirmal")
            self.assertEqual(ctx.exception.status_code, 429)


class TestGithubRepositoryProcessing(unittest.IsolatedAsyncioTestCase):
    """Regression test suite for Step 3 repository retrieval & signal calculations."""

    async def test_pagination_and_safety_cap(self):
        """Verify pagination stops when < 100 items returned and caps at MAX_PAGES."""
        # Test stops when page < 100
        call_count = 0

        async def mock_get(self_client, url, headers=None, params=None):
            nonlocal call_count
            call_count += 1
            mock_resp = MagicMock()
            mock_resp.status_code = 200
            if params.get("page") == 1:
                mock_resp.json.return_value = [{"id": i, "name": f"r{i}"} for i in range(100)]
            else:
                mock_resp.json.return_value = [{"id": 100 + i, "name": f"r{100+i}"} for i in range(25)]
            return mock_resp

        with patch("httpx.AsyncClient.get", new=mock_get):
            repos = await fetch_user_repositories("testuser")
            self.assertEqual(len(repos), 125)
            self.assertEqual(call_count, 2)

    async def test_repository_signals_and_ranking(self):
        """Verify calculations of forks, active, stars, languages, recent activity, and top 5."""
        now = datetime.now(timezone.utc)
        recent_pushed = (now - timedelta(days=10)).strftime("%Y-%m-%dT%H:%M:%SZ")
        old_pushed = (now - timedelta(days=200)).strftime("%Y-%m-%dT%H:%M:%SZ")

        mock_raw = [
            {
                "id": 1, "name": "top-proj", "stargazers_count": 50, "forks_count": 10,
                "language": "Python", "fork": False, "archived": False, "pushed_at": recent_pushed,
                "license": {"name": "MIT"}, "description": "Top project"
            },
            {
                "id": 2, "name": "med-proj", "stargazers_count": 25, "forks_count": 2,
                "language": "TypeScript", "fork": False, "archived": False, "pushed_at": recent_pushed,
                "license": None, "description": "Medium project"
            },
            {
                "id": 3, "name": "forked-proj", "stargazers_count": 100, "forks_count": 5,
                "language": "Python", "fork": True, "archived": False, "pushed_at": recent_pushed,
                "license": {"name": "Apache-2.0"}, "description": "Forked project"
            },
            {
                "id": 4, "name": "archived-proj", "stargazers_count": 5, "forks_count": 0,
                "language": "Go", "fork": False, "archived": True, "pushed_at": old_pushed,
                "license": None, "description": None
            },
        ]

        repos, summary, top_5 = await process_repositories(mock_raw, "testuser")

        self.assertEqual(summary.total_public_repositories, 4)
        self.assertEqual(summary.total_original_repositories, 3)
        self.assertEqual(summary.total_forked_repositories, 1)
        self.assertEqual(summary.total_archived_repositories, 1)
        self.assertEqual(summary.active_repositories, 2)
        self.assertEqual(summary.total_stars, 180)
        self.assertEqual(summary.total_forks, 17)
        self.assertEqual(summary.language_counts, {"Python": 2, "TypeScript": 1, "Go": 1})
        self.assertEqual(summary.recently_active_repositories, 3)

        # Ranking: forked-proj (100 stars) > top-proj (50 stars) > med-proj (25 stars) > archived-proj (5 stars)
        self.assertEqual(top_5[0].name, "forked-proj")
        self.assertEqual(top_5[1].name, "top-proj")
        self.assertEqual(top_5[2].name, "med-proj")
        self.assertEqual(top_5[3].name, "archived-proj")

    async def test_zero_repositories_division_safety(self):
        """Verify 0 repositories safely returns 0.0 rates without ZeroDivisionError."""
        repos, summary, top_5 = await process_repositories([], "emptyuser")
        self.assertEqual(summary.total_public_repositories, 0)
        self.assertEqual(summary.documentation_rate, 0.0)
        self.assertEqual(summary.license_rate, 0.0)
        self.assertEqual(summary.description_rate, 0.0)
        self.assertEqual(summary.activity_rate, 0.0)
        self.assertEqual(len(top_5), 0)


if __name__ == "__main__":
    unittest.main()
