import json
import os
import unittest
from unittest.mock import patch, MagicMock
import httpx
from fastapi import HTTPException
from pydantic import ValidationError

from app.models.analysis import DeveloperAnalysis, BestProject, AnalyzeGithubResponse
from app.services.ai_service import (
    analyze_github_data,
    build_analysis_prompt,
    extract_json_payload,
)


class TestDeveloperAnalysisModel(unittest.TestCase):
    """Test suite for DeveloperAnalysis Pydantic schema validation."""

    def setUp(self):
        self.valid_payload = {
            "overall_score": 82,
            "technical_depth_score": 85,
            "project_quality_score": 80,
            "documentation_score": 75,
            "consistency_score": 90,
            "developer_personality": "Consistent Systems Builder",
            "strongest_signal": "Solid history of active original repositories.",
            "biggest_weakness": "Several repositories lack comprehensive documentation.",
            "best_project": {
                "name": "ai-roast-engine",
                "reason": "Clear modular architecture and high technical focus.",
            },
            "roast": "You write code with impressive consistency, though your READMEs read like mystery novels. Future developers will appreciate your logic while wondering what the project actually does.",
            "recommendations": [
                "Add detailed READMEs to your top 3 active repositories.",
                "Include setup and usage guides in your primary project.",
                "Archive legacy abandoned experiment repositories.",
            ],
        }

    def test_case_10_exactly_three_recommendations(self):
        """Case 10: Enforce exactly 3 non-empty recommendations."""
        # Valid: exactly 3 items
        analysis = DeveloperAnalysis.model_validate(self.valid_payload)
        self.assertEqual(len(analysis.recommendations), 3)

        # Invalid: 2 recommendations
        payload_2 = dict(self.valid_payload, recommendations=["Rec 1", "Rec 2"])
        with self.assertRaises(ValidationError) as ctx:
            DeveloperAnalysis.model_validate(payload_2)
        self.assertIn("exactly 3 items", str(ctx.exception))

        # Invalid: 4 recommendations
        payload_4 = dict(self.valid_payload, recommendations=["Rec 1", "Rec 2", "Rec 3", "Rec 4"])
        with self.assertRaises(ValidationError) as ctx:
            DeveloperAnalysis.model_validate(payload_4)
        self.assertIn("exactly 3 items", str(ctx.exception))

        # Invalid: empty string recommendation
        payload_empty = dict(self.valid_payload, recommendations=["Rec 1", "", "Rec 3"])
        with self.assertRaises(ValidationError) as ctx:
            DeveloperAnalysis.model_validate(payload_empty)
        self.assertIn("non-empty string", str(ctx.exception))

    def test_case_11_score_bounds_0_to_100(self):
        """Case 11: Validate score fields are bounded strictly between 0 and 100."""
        score_fields = [
            "overall_score",
            "technical_depth_score",
            "project_quality_score",
            "documentation_score",
            "consistency_score",
        ]

        # Valid boundaries: 0 and 100
        for score_field in score_fields:
            payload_0 = dict(self.valid_payload, **{score_field: 0})
            payload_100 = dict(self.valid_payload, **{score_field: 100})
            self.assertEqual(DeveloperAnalysis.model_validate(payload_0).__dict__[score_field], 0)
            self.assertEqual(DeveloperAnalysis.model_validate(payload_100).__dict__[score_field], 100)

            # Invalid: < 0
            payload_under = dict(self.valid_payload, **{score_field: -1})
            with self.assertRaises(ValidationError):
                DeveloperAnalysis.model_validate(payload_under)

            # Invalid: > 100
            payload_over = dict(self.valid_payload, **{score_field: 101})
            with self.assertRaises(ValidationError):
                DeveloperAnalysis.model_validate(payload_over)

    def test_case_12_nullable_best_project_name(self):
        """Case 12: Ensure best_project.name can be a valid string or null."""
        # Null name
        payload_null = dict(
            self.valid_payload,
            best_project={"name": None, "reason": "Insufficient repository evidence."},
        )
        analysis_null = DeveloperAnalysis.model_validate(payload_null)
        self.assertIsNone(analysis_null.best_project.name)
        self.assertEqual(analysis_null.best_project.reason, "Insufficient repository evidence.")

        # String name
        payload_str = dict(
            self.valid_payload,
            best_project={"name": "fastapi-service", "reason": "High activity and clean docs."},
        )
        analysis_str = DeveloperAnalysis.model_validate(payload_str)
        self.assertEqual(analysis_str.best_project.name, "fastapi-service")


class TestOpenRouterService(unittest.IsolatedAsyncioTestCase):
    """Test suite for OpenRouter AI analysis service with mocked HTTP interactions."""

    def setUp(self):
        self.mock_api_key = "sk-or-v1-mock-test-key-12345"
        self.profile = {"login": "nirmal", "name": "Nirmal Patel", "public_repos": 10}
        self.summary = {"total_public_repositories": 10, "total_stars": 25}
        self.top_repos = [{"name": "ai-roast", "stars": 20, "forks": 5, "language": "Python"}]
        self.valid_llm_json = {
            "overall_score": 78,
            "technical_depth_score": 82,
            "project_quality_score": 76,
            "documentation_score": 70,
            "consistency_score": 85,
            "developer_personality": "Quiet Builder",
            "strongest_signal": "Consistent original Python repositories.",
            "biggest_weakness": "Limited documentation across personal projects.",
            "best_project": {
                "name": "ai-roast",
                "reason": "Most active project with clear technical implementation.",
            },
            "roast": "You push code with the quiet confidence of someone who tests in production. The projects work, but future-you will need forensic tools to understand the architecture.",
            "recommendations": [
                "Add concise READMEs to all active repositories.",
                "Include setup steps for your core project.",
                "Tag repositories with appropriate topics.",
            ],
        }

    async def test_case_1_successful_openrouter_response(self):
        """Case 1: Successfully parse and validate OpenRouter response into DeveloperAnalysis."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            mock_response = MagicMock()
            mock_response.status_code = 200
            # Test with markdown code block formatting
            mock_content = f"```json\n{json.dumps(self.valid_llm_json)}\n```"
            mock_response.json.return_value = {
                "choices": [{"message": {"content": mock_content}}]
            }

            with patch("httpx.AsyncClient.post", return_value=mock_response) as mock_post:
                result = await analyze_github_data(self.profile, self.summary, self.top_repos)

                self.assertIsInstance(result, DeveloperAnalysis)
                self.assertEqual(result.overall_score, 78)
                self.assertEqual(result.developer_personality, "Quiet Builder")
                self.assertEqual(len(result.recommendations), 3)

                # Verify request headers and payload
                call_args = mock_post.call_args
                headers = call_args.kwargs["headers"]
                self.assertEqual(headers["Authorization"], f"Bearer {self.mock_api_key}")
                self.assertIn("response_format", call_args.kwargs["json"])
                self.assertEqual(call_args.kwargs["json"]["response_format"], {"type": "json_object"})

    async def test_case_2_malformed_json_response(self):
        """Case 2: Handle malformed / unparseable JSON gracefully with clean HTTP 502."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "choices": [{"message": {"content": "This is totally not JSON at all {"}}]
            }

            with patch("httpx.AsyncClient.post", return_value=mock_response):
                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)

                self.assertEqual(ctx.exception.status_code, 502)
                self.assertIn("Failed to parse and validate AI analysis output", ctx.exception.detail)
                # Verify API key is never in error detail
                self.assertNotIn(self.mock_api_key, ctx.exception.detail)

    async def test_case_3_invalid_pydantic_response(self):
        """Case 3: Handle JSON that violates Pydantic schema with clean HTTP 502."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            # Missing required field 'developer_personality' and score out of bounds
            invalid_data = dict(self.valid_llm_json)
            del invalid_data["developer_personality"]
            invalid_data["overall_score"] = 999

            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "choices": [{"message": {"content": json.dumps(invalid_data)}}]
            }

            with patch("httpx.AsyncClient.post", return_value=mock_response):
                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)

                self.assertEqual(ctx.exception.status_code, 502)
                self.assertIn("Failed to parse and validate AI analysis output", ctx.exception.detail)
                self.assertNotIn(self.mock_api_key, ctx.exception.detail)

    async def test_case_4_http_401_from_openrouter(self):
        """Case 4: Handle HTTP 401 Unauthorized from OpenRouter with clean HTTP 500."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            mock_response = MagicMock()
            mock_response.status_code = 401
            mock_response.text = '{"error": "Unauthorized: Invalid API Key"}'

            with patch("httpx.AsyncClient.post", return_value=mock_response):
                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)

                self.assertEqual(ctx.exception.status_code, 500)
                self.assertIn("OpenRouter authentication failed", ctx.exception.detail)
                self.assertNotIn(self.mock_api_key, ctx.exception.detail)

    async def test_case_5_http_429_from_openrouter(self):
        """Case 5: Handle HTTP 429 Rate Limit from OpenRouter with clean HTTP 429."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            mock_response = MagicMock()
            mock_response.status_code = 429
            mock_response.text = '{"error": "Rate limit exceeded"}'

            with patch("httpx.AsyncClient.post", return_value=mock_response):
                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)

                self.assertEqual(ctx.exception.status_code, 429)
                self.assertIn("rate limit reached", ctx.exception.detail)
                self.assertNotIn(self.mock_api_key, ctx.exception.detail)

    async def test_case_6_http_500_from_openrouter(self):
        """Case 6: Handle HTTP 500 from OpenRouter with clean HTTP 502."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            mock_response = MagicMock()
            mock_response.status_code = 500
            mock_response.text = '{"error": "Internal Server Error"}'

            with patch("httpx.AsyncClient.post", return_value=mock_response):
                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)

                self.assertEqual(ctx.exception.status_code, 502)
                self.assertIn("OpenRouter AI service is temporarily unavailable", ctx.exception.detail)
                self.assertNotIn(self.mock_api_key, ctx.exception.detail)

    async def test_case_7_other_5xx_from_openrouter(self):
        """Case 7: Handle other OpenRouter 5xx responses (e.g. 503) with clean HTTP 502."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            for status_code in [502, 503, 504]:
                mock_response = MagicMock()
                mock_response.status_code = status_code
                mock_response.text = '{"error": "Upstream error"}'

                with patch("httpx.AsyncClient.post", return_value=mock_response):
                    with self.assertRaises(HTTPException) as ctx:
                        await analyze_github_data(self.profile, self.summary, self.top_repos)

                    self.assertEqual(ctx.exception.status_code, 502)
                    self.assertIn("temporarily unavailable", ctx.exception.detail)
                    self.assertNotIn(self.mock_api_key, ctx.exception.detail)

    async def test_case_8_openrouter_request_timeout(self):
        """Case 8: Handle request timeouts to OpenRouter with clean HTTP 503."""
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": self.mock_api_key}):
            with patch(
                "httpx.AsyncClient.post",
                side_effect=httpx.TimeoutException("Connection timed out after 45s"),
            ):
                with self.assertRaises(HTTPException) as ctx:
                    await analyze_github_data(self.profile, self.summary, self.top_repos)

                self.assertEqual(ctx.exception.status_code, 503)
                self.assertIn("Couldn't reach OpenRouter AI service right now", ctx.exception.detail)
                self.assertNotIn(self.mock_api_key, ctx.exception.detail)

    async def test_case_9_missing_openrouter_api_key(self):
        """Case 9: Handle missing or empty OPENROUTER_API_KEY with clean HTTP 500."""
        # Unset / empty string
        with patch.dict(os.environ, {"OPENROUTER_API_KEY": ""}):
            with self.assertRaises(HTTPException) as ctx:
                await analyze_github_data(self.profile, self.summary, self.top_repos)

            self.assertEqual(ctx.exception.status_code, 500)
            self.assertIn("OpenRouter API key is not configured", ctx.exception.detail)


if __name__ == "__main__":
    unittest.main()
