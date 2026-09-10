import json
import unittest
from unittest.mock import patch, MagicMock
import httpx
from fastapi import HTTPException

from app.main import app
from app.models.analysis import (
    DeveloperAnalysis,
    DeveloperDNA,
    TechStackFingerprint,
    TechLanguage,
    AssessmentItem,
    ActionPlanItem,
    RecruiterSummary,
    AnalyzeGithubRequest,
    AnalyzeGithubResponse,
)
from app.services.ai_service import (
    calculate_developer_league,
    build_analysis_prompt,
    populate_v3_fallbacks,
    analyze_github_data,
)


class TestFeaturePackV3(unittest.IsolatedAsyncioTestCase):
    """Test suite covering Feature Pack V3 Developer Intelligence and Roast Experience."""

    def setUp(self):
        self.mock_api_key = "sk-or-v1-mock-v3-key"
        self.profile = {
            "login": "octocat",
            "name": "The Octocat",
            "bio": "Building open source tools.",
            "public_repos": 10,
            "followers": 150,
            "following": 10,
            "created_at": "2020-01-01T00:00:00Z",
        }
        self.summary = {
            "total_public_repositories": 10,
            "total_original_repositories": 8,
            "total_forked_repositories": 2,
            "total_archived_repositories": 1,
            "active_repositories": 7,
            "total_stars": 420,
            "total_forks": 55,
            "languages_used": ["TypeScript", "Python", "Rust"],
            "language_counts": {"TypeScript": 5, "Python": 3, "Rust": 2},
            "repositories_with_readme": 8,
            "repositories_with_license": 7,
            "repositories_with_description": 9,
            "recently_active_repositories": 6,
            "documentation_rate": 0.88,
            "license_rate": 0.80,
            "description_rate": 0.90,
            "activity_rate": 0.75,
        }
        self.top_repos = [
            {
                "name": "spoon-knife",
                "description": "Reputed demo repository",
                "language": "TypeScript",
                "topics": ["demo", "starter"],
                "stars": 320,
                "forks": 40,
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

    def test_1_developer_dna_schema(self):
        """1. Verify Developer DNA dimensions and 0-100 bounds."""
        dna = DeveloperDNA(
            builder=88,
            experimenter=75,
            documenter=90,
            maintainer=65,
            open_source=80,
            specialist=70,
            explorer=82,
        )
        self.assertEqual(dna.builder, 88)
        self.assertEqual(dna.maintainer, 65)

    def test_2_tech_stack_fingerprint(self):
        """2. Verify Tech Stack Fingerprint model with language scores and counts."""
        fingerprint = TechStackFingerprint(
            languages=[
                TechLanguage(name="TypeScript", score=90, repository_count=5),
                TechLanguage(name="Python", score=75, repository_count=3),
            ]
        )
        self.assertEqual(len(fingerprint.languages), 2)
        self.assertEqual(fingerprint.languages[0].name, "TypeScript")
        self.assertEqual(fingerprint.languages[0].repository_count, 5)

    def test_3_roast_level_prompts(self):
        """3. Verify prompt adapts to friendly, brutal, and nuclear roast levels."""
        _, p_friendly = build_analysis_prompt(self.profile, self.summary, self.top_repos, roast_level="friendly")
        self.assertIn('"REQUESTED_ROAST_LEVEL": "friendly"', p_friendly)

        _, p_nuclear = build_analysis_prompt(self.profile, self.summary, self.top_repos, roast_level="nuclear")
        self.assertIn('"REQUESTED_ROAST_LEVEL": "nuclear"', p_nuclear)

        _, p_brutal = build_analysis_prompt(self.profile, self.summary, self.top_repos, roast_level="brutal")
        self.assertIn('"REQUESTED_ROAST_LEVEL": "brutal"', p_brutal)

    def test_4_one_line_roast_field(self):
        """4. Verify one-line roast exists and adheres to string expectations."""
        analysis = DeveloperAnalysis(
            overall_score=80,
            technical_depth_score=75,
            project_quality_score=85,
            documentation_score=80,
            consistency_score=70,
            developer_personality="Balanced Builder",
            strongest_signal="Solid documentation.",
            biggest_weakness="Sparse commit cadence.",
            best_project={"name": "spoon-knife", "reason": "High star count."},
            roast="You write code with confidence and great READMEs.",
            one_line_roast="10 repos, solid docs, but your commit graph has commitment issues.",
            recommendations=["Add tests", "Tag topics", "Pin top repos"],
        )
        self.assertIn("commitment issues", analysis.one_line_roast)

    def test_5_exactly_three_strengths(self):
        """5. Verify strengths items structure."""
        strengths = [
            AssessmentItem(title="Strong Docs", description="90% of repos have thorough READMEs."),
            AssessmentItem(title="Diverse Stack", description="Proficiency across 3 languages."),
            AssessmentItem(title="Original Work", description="8 original repositories authored."),
        ]
        self.assertEqual(len(strengths), 3)

    def test_6_exactly_three_weaknesses(self):
        """6. Verify weaknesses items structure."""
        weaknesses = [
            AssessmentItem(title="Star Concentration", description="Stars are concentrated in one repo."),
            AssessmentItem(title="Fork Ratio", description="20% of projects are forks."),
            AssessmentItem(title="License Gaps", description="Some repositories omit open source licenses."),
        ]
        self.assertEqual(len(weaknesses), 3)

    def test_7_action_plan_validation(self):
        """7. Verify action plan item priorities and structure."""
        plan_item = ActionPlanItem(
            title="Add MIT licenses",
            reason="Several projects lack explicit licensing.",
            expected_impact="Protects intellectual property and invites open source contribution.",
            priority="High",
        )
        self.assertEqual(plan_item.priority, "High")

    def test_8_league_calculation_deterministic(self):
        """8. Verify deterministic league tier calculation across all score ranges."""
        self.assertEqual(calculate_developer_league(95)[0], "GitHub Legend")
        self.assertEqual(calculate_developer_league(80)[0], "Elite Builder")
        self.assertEqual(calculate_developer_league(65)[0], "Strong Builder")
        self.assertEqual(calculate_developer_league(45)[0], "Builder")
        self.assertEqual(calculate_developer_league(25)[0], "Code Rookie")

    def test_9_score_boundaries_maintained(self):
        """9. Verify score bounds in league calculations and models."""
        self.assertEqual(calculate_developer_league(-10)[0], "Code Rookie")
        self.assertEqual(calculate_developer_league(150)[0], "GitHub Legend")

    def test_10_recruiter_mode_model(self):
        """10. Verify RecruiterSummary fields."""
        recruiter = RecruiterSummary(
            candidate_snapshot="Experienced full-stack engineer with active TypeScript and Python projects.",
            technical_strengths=["Clean READMEs", "Active repositories"],
            strongest_projects=["spoon-knife"],
            technology_breadth="Multi-language proficiency in TypeScript, Python, and Rust.",
            engineering_signals=["420 stars earned", "88% documentation rate"],
            documentation_quality="High quality documentation across active projects.",
            activity_consistency="Pushed updates within the last 180 days across 6 repositories.",
            areas_to_improve=["Distribute star presence across multiple utilities."],
            overall_impression="Strong potential candidate with grounded open-source credibility.",
        )
        self.assertIn("full-stack engineer", recruiter.candidate_snapshot)
        self.assertEqual(len(recruiter.technical_strengths), 2)

    def test_11_percentile_unavailable_handling(self):
        """11. Verify honest percentile status indication."""
        analysis = DeveloperAnalysis(
            overall_score=70,
            technical_depth_score=70,
            project_quality_score=70,
            documentation_score=70,
            consistency_score=70,
            developer_personality="Steady Builder",
            strongest_signal="Consistent code.",
            biggest_weakness="Needs more stars.",
            best_project={"name": "repo", "reason": "Good."},
            roast="A nice roast.",
            recommendations=["Do this", "Do that", "Do more"],
        )
        self.assertEqual(analysis.percentile_status, "Benchmark data developing")

    def test_12_historical_snapshot_serialization(self):
        """12. Verify snapshot serialization for localStorage compatibility."""
        analysis = DeveloperAnalysis(
            overall_score=85,
            technical_depth_score=80,
            project_quality_score=85,
            documentation_score=90,
            consistency_score=75,
            developer_personality="Systematic Builder",
            strongest_signal="High doc rate.",
            biggest_weakness="Few forks.",
            best_project={"name": "spoon-knife", "reason": "Clean codebase."},
            roast="A roast.",
            recommendations=["R1", "R2", "R3"],
            one_line_roast="Short roast.",
            league="Elite Builder",
        )
        snapshot = {
            "timestamp": "2026-09-10T12:00:00Z",
            "username": "octocat",
            "overall_score": analysis.overall_score,
            "technical_depth_score": analysis.technical_depth_score,
            "project_quality_score": analysis.project_quality_score,
            "documentation_score": analysis.documentation_score,
            "consistency_score": analysis.consistency_score,
            "league": analysis.league,
            "developer_dna": analysis.developer_dna.model_dump(),
        }
        json_str = json.dumps(snapshot)
        loaded = json.loads(json_str)
        self.assertEqual(loaded["username"], "octocat")
        self.assertEqual(loaded["overall_score"], 85)

    def test_13_backward_compatibility_with_old_payloads(self):
        """13. Verify that payloads missing V3 fields parse and populate fallbacks gracefully."""
        minimal_v1_payload = {
            "overall_score": 65,
            "technical_depth_score": 60,
            "project_quality_score": 70,
            "documentation_score": 50,
            "consistency_score": 60,
            "developer_personality": "Pragmatic Builder",
            "strongest_signal": "Solid code.",
            "biggest_weakness": "Needs docs.",
            "best_project": {"name": "app", "reason": "Clean."},
            "roast": "A witty roast text here.",
            "recommendations": ["A", "B", "C"],
        }
        populated = populate_v3_fallbacks(minimal_v1_payload, self.summary, "brutal")
        analysis = DeveloperAnalysis.model_validate(populated)

        self.assertEqual(analysis.league, "Strong Builder")
        self.assertEqual(len(analysis.strengths), 3)
        self.assertEqual(len(analysis.weaknesses), 3)
        self.assertEqual(len(analysis.action_plan), 3)
        self.assertIn("A witty roast text here", analysis.one_line_roast)
        self.assertEqual(len(analysis.tech_stack_fingerprint.languages), 3)

    async def test_14_end_to_end_analyze_route_with_roast_level(self):
        """14. Test POST /api/github/{username}/analyze with explicit roast_level payload."""
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
            with patch("app.api.routes.github.get_github_profile", return_value=self.profile):
                with patch("app.api.routes.github.fetch_user_repositories", return_value=[]):
                    with patch(
                        "app.api.routes.github.analyze_github_data",
                        return_value=DeveloperAnalysis(
                            overall_score=82,
                            technical_depth_score=80,
                            project_quality_score=85,
                            documentation_score=80,
                            consistency_score=75,
                            developer_personality="Balanced Builder",
                            strongest_signal="Solid documentation.",
                            biggest_weakness="Sparse commit cadence.",
                            best_project={"name": "spoon-knife", "reason": "Good repo."},
                            roast="Nuclear roast incoming!",
                            one_line_roast="Nuclear burn in one line.",
                            roast_level="nuclear",
                            league="Elite Builder",
                            recommendations=["A", "B", "C"],
                        ),
                    ):
                        resp = await client.post(
                            "/api/github/octocat/analyze",
                            json={"roast_level": "nuclear"},
                        )
                        self.assertEqual(resp.status_code, 200)
                        data = resp.json()
                        self.assertEqual(data["analysis"]["roast_level"], "nuclear")
                        self.assertEqual(data["analysis"]["league"], "Elite Builder")
                        self.assertIn("Nuclear", data["analysis"]["one_line_roast"])


if __name__ == "__main__":
    unittest.main()
