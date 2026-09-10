import json
import os
import re
from typing import Dict, Any, List, Tuple, Optional
import httpx
from fastapi import HTTPException, status

from app.models.analysis import DeveloperAnalysis

OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash"


def calculate_developer_league(overall_score: int) -> Tuple[str, int, int]:
    """Deterministically map overall developer score to a developer league."""
    score = max(0, min(100, overall_score))
    if score >= 90:
        return ("GitHub Legend", 90, 100)
    elif score >= 75:
        return ("Elite Builder", 75, 89)
    elif score >= 60:
        return ("Strong Builder", 60, 74)
    elif score >= 40:
        return ("Builder", 40, 59)
    else:
        return ("Code Rookie", 0, 39)


def build_analysis_prompt(
    profile: Dict[str, Any],
    summary: Dict[str, Any],
    top_repos: List[Dict[str, Any]],
    roast_level: str = "brutal",
) -> Tuple[str, str]:
    """Construct the system and user prompts for the AI reviewer."""
    roast_level_lower = (roast_level or "brutal").strip().lower()
    if roast_level_lower == "friendly":
        roast_tone = (
            "ROAST LEVEL: Friendly. "
            "Tone: Warm, lighthearted, and playful. Use gentle teasing and encouraging sarcasm. "
            "Poke fun at quirks without being biting or harsh."
        )
    elif roast_level_lower == "nuclear":
        roast_tone = (
            "ROAST LEVEL: Nuclear. "
            "Tone: Unfiltered, razor-sharp, devastatingly witty and sarcastic. "
            "Deliver maximum comedic impact roasting their commit gaps, README neglect, and stack choices. "
            "CRITICAL: Never be abusive, hateful, or target personal attributes. Keep it strictly grounded in the code."
        )
    else:
        roast_tone = (
            "ROAST LEVEL: Brutal. "
            "Tone: Biting, direct, senior engineer friend who gives the cold hard truth with sharp wit and zero sugarcoating."
        )

    system_prompt = f"""You are an elite software engineering reviewer analyzing a developer's public GitHub profile.
Your role is to produce a technically grounded, evidence-based, constructive, and humorous profile roast and review.

{roast_tone}

CRITICAL RULES:
1. STRICT GROUNDING: Only reference technologies, projects, metrics, skills, and activities explicitly present in the supplied data.
   NEVER invent private repositories, employment history, education, job titles, years of experience, or achievements not supported by the evidence.
2. If evidence for a metric, project, or signal is lacking or zero, explicitly say 'Insufficient evidence' or reflect that in lower scores.
3. NEVER attack appearance, identity, or personal traits. Roast coding habits, documentation, project follow-through, and repository presentation.
4. Scores must be integers from 0 to 100 based strictly on visible evidence:
   - overall_score: Holistic assessment based on public GitHub evidence.
   - technical_depth_score: Technical diversity, language breadth, and project complexity signals.
   - project_quality_score: Original projects, stars, forks, descriptions, and completeness.
   - documentation_score: README presence, descriptions, licenses, and topics.
   - consistency_score: Recent activity (last 180 days), maintenance patterns, and active projects.
5. developer_personality: A concise developer archetype label (approximately 2-5 words, e.g. "Weekend Builder", "Documentation Minimalist", "Multi-Stack Experimenter"). Infer personality ONLY from observable GitHub behavior.
6. strongest_signal: One concise sentence highlighting their clearest positive technical attribute grounded in the data.
7. biggest_weakness: One concise, constructive sentence identifying their primary area for improvement grounded in the data.
8. best_project: An object with:
   - "name": exact repository name from the supplied data (or null if no meaningful repository exists)
   - "reason": specific technical justification based strictly on the evidence (or 'Insufficient evidence' if null)
9. roast: 2 to 5 sentences referencing actual data (languages, repo count, stars, README documentation rate, or activity) matching the requested roast level.
10. one_line_roast: A single, punchy, shareable sentence (< 150 characters) summarizing the roast for social sharing.
11. recommendations: EXACTLY 3 specific, realistic, actionable recommendations to improve their GitHub presence.
12. developer_dna: Measurable engineering dimensions (0-100 integers):
   - builder: Drive to build and ship working original apps
   - experimenter: Breadth of trying different languages/tools
   - documenter: README and licensing thoroughness
   - maintainer: Recent updates and upkeep of existing repos
   - open_source: Stars, forks, collaboration signals
   - specialist: Focus in a primary language/domain
   - explorer: Diversity of repository domains/topics
13. tech_stack_fingerprint: A list of languages actually detected with score (0-100) and repository_count based on the provided repository data. Do NOT invent languages.
14. strengths: EXACTLY 3 evidence-grounded strength items: [ {{"title": "...", "description": "..."}}, ... ]
15. weaknesses: EXACTLY 3 evidence-grounded weakness items: [ {{"title": "...", "description": "..."}}, ... ]
16. action_plan: 3 to 5 prioritized growth actions: [ {{"title": "...", "reason": "...", "expected_impact": "...", "priority": "High" | "Medium" | "Low"}}, ... ]
17. recruiter_summary: Professional, objective assessment:
   - candidate_snapshot: 1-2 sentence professional profile
   - technical_strengths: list of observed technical strengths
   - strongest_projects: list of standout projects with brief technical justification
   - technology_breadth: assessment of language diversity
   - engineering_signals: notable code habits/signals
   - documentation_quality: factual evaluation of README/docs
   - activity_consistency: evaluation of maintenance pattern
   - areas_to_improve: constructive growth areas
   - overall_impression: balanced, objective summary (Do NOT make hiring decisions like 'Definitely hire').

18. LENGTH & CONCISENESS RULES:
   - Keep ALL descriptions, explanations, reasons, impacts, and impressions concise and punchy (1 to 2 sentences each, maximum 25 words).
   - Avoid verbose essays, repetitive filler, or sprawling paragraphs.
   - All text must be direct, impactful, and compact.

You MUST reply with a single, valid JSON object matching this schema:
{{
  "overall_score": 0,
  "technical_depth_score": 0,
  "project_quality_score": 0,
  "documentation_score": 0,
  "consistency_score": 0,
  "developer_personality": "string",
  "strongest_signal": "string",
  "biggest_weakness": "string",
  "best_project": {{
    "name": "string or null",
    "reason": "string"
  }},
  "roast": "string",
  "one_line_roast": "string",
  "recommendations": [
    "string",
    "string",
    "string"
  ],
  "developer_dna": {{
    "builder": 0,
    "experimenter": 0,
    "documenter": 0,
    "maintainer": 0,
    "open_source": 0,
    "specialist": 0,
    "explorer": 0
  }},
  "tech_stack_fingerprint": {{
    "languages": [
      {{
        "name": "string",
        "score": 0,
        "repository_count": 0
      }}
    ]
  }},
  "strengths": [
    {{ "title": "string", "description": "string" }},
    {{ "title": "string", "description": "string" }},
    {{ "title": "string", "description": "string" }}
  ],
  "weaknesses": [
    {{ "title": "string", "description": "string" }},
    {{ "title": "string", "description": "string" }},
    {{ "title": "string", "description": "string" }}
  ],
  "action_plan": [
    {{
      "title": "string",
      "reason": "string",
      "expected_impact": "string",
      "priority": "High"
    }}
  ],
  "recruiter_summary": {{
    "candidate_snapshot": "string",
    "technical_strengths": ["string"],
    "strongest_projects": ["string"],
    "technology_breadth": "string",
    "engineering_signals": ["string"],
    "documentation_quality": "string",
    "activity_consistency": "string",
    "areas_to_improve": ["string"],
    "overall_impression": "string"
  }}
}}
"""

    cleaned_profile = {
        "username": profile.get("login") or profile.get("username"),
        "name": profile.get("name"),
        "bio": profile.get("bio"),
        "public_repos": profile.get("public_repos", 0),
        "followers": profile.get("followers", 0),
        "following": profile.get("following", 0),
        "created_at": profile.get("created_at"),
    }

    cleaned_repos = []
    for repo in top_repos:
        cleaned_repos.append({
            "name": repo.get("name"),
            "description": repo.get("description"),
            "language": repo.get("language"),
            "topics": repo.get("topics", []),
            "stars": repo.get("stars", 0),
            "forks": repo.get("forks", 0),
            "has_readme": repo.get("has_readme", False),
            "has_license": repo.get("has_license", False),
            "is_fork": repo.get("is_fork", False),
            "is_archived": repo.get("is_archived", False),
            "created_at": repo.get("created_at"),
            "updated_at": repo.get("updated_at"),
            "pushed_at": repo.get("pushed_at"),
            "html_url": repo.get("html_url"),
        })

    user_payload = {
        "PROFILE": cleaned_profile,
        "REPOSITORY_SUMMARY": summary,
        "TOP_REPOSITORIES": cleaned_repos,
        "REQUESTED_ROAST_LEVEL": roast_level_lower,
    }

    user_prompt = f"Analyze the following GitHub developer dataset and output strict JSON according to your instructions:\n\n{json.dumps(user_payload, indent=2)}"
    return system_prompt, user_prompt


def repair_truncated_json(text: str) -> str:
    """Attempt to repair truncated JSON by closing unclosed strings and bracket pairs."""
    s = text.strip()
    if not s:
        return "{}"

    # Remove any trailing incomplete escape or key fragment
    in_string = False
    escape = False
    stack = []

    for char in s:
        if escape:
            escape = False
            continue
        if char == "\\":
            if in_string:
                escape = True
            continue
        if char == '"':
            in_string = not in_string
            continue
        if not in_string:
            if char in "{[":
                stack.append("}" if char == "{" else "]")
            elif char in "}]":
                if stack and stack[-1] == char:
                    stack.pop()

    repaired = s
    if in_string:
        repaired += '"'

    # Strip any trailing comma or colon right before closure
    repaired = re.sub(r",\s*$", "", repaired.strip())
    repaired = re.sub(r":\s*$", ': ""', repaired.strip())

    while stack:
        closing = stack.pop()
        repaired += closing

    return repaired


def extract_json_payload(raw_content: str) -> Dict[str, Any]:
    """Extract and parse a JSON object from raw LLM output, handling markdown fences if present."""
    trimmed = raw_content.strip()
    if not trimmed:
        raise ValueError("Empty response received from LLM.")

    # Check for markdown code blocks (```json ... ``` or ``` ...)
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", trimmed, re.DOTALL)
    if match:
        json_str = match.group(1).strip()
    else:
        # Fallback: look for the outermost curly braces
        start = trimmed.find("{")
        end = trimmed.rfind("}")
        if start != -1 and end != -1 and end > start:
            json_str = trimmed[start : end + 1]
        elif start != -1:
            json_str = trimmed[start:]
        else:
            json_str = trimmed

    try:
        return json.loads(json_str)
    except json.JSONDecodeError:
        try:
            repaired = repair_truncated_json(json_str)
            return json.loads(repaired)
        except Exception:
            # Re-raise original error or propagate
            return json.loads(json_str)


def populate_v3_fallbacks(parsed_dict: Dict[str, Any], summary: Dict[str, Any], roast_level: str) -> Dict[str, Any]:
    """Ensure all Feature Pack V3 fields are safely populated and strictly grounded in repository data."""
    overall_score = parsed_dict.get("overall_score", 50)
    league, min_score, max_score = calculate_developer_league(overall_score)

    parsed_dict["roast_level"] = roast_level
    parsed_dict["league"] = league
    parsed_dict["league_min_score"] = min_score
    parsed_dict["league_max_score"] = max_score
    parsed_dict["percentile_status"] = "Benchmark data developing"

    # Fallback for one_line_roast
    if not parsed_dict.get("one_line_roast") or not isinstance(parsed_dict["one_line_roast"], str):
        roast_text = parsed_dict.get("roast", "")
        if roast_text:
            first_sentence = roast_text.split(".")[0].strip()
            parsed_dict["one_line_roast"] = (first_sentence[:140] + "...") if len(first_sentence) > 140 else (first_sentence + ".")
        else:
            parsed_dict["one_line_roast"] = "A developer whose repositories speak louder than their documentation."

    # Fallback for developer_dna
    dna = parsed_dict.get("developer_dna") or {}
    parsed_dict["developer_dna"] = {
        "builder": max(0, min(100, int(dna.get("builder", parsed_dict.get("project_quality_score", 50))))),
        "experimenter": max(0, min(100, int(dna.get("experimenter", parsed_dict.get("technical_depth_score", 50))))),
        "documenter": max(0, min(100, int(dna.get("documenter", parsed_dict.get("documentation_score", 50))))),
        "maintainer": max(0, min(100, int(dna.get("maintainer", parsed_dict.get("consistency_score", 50))))),
        "open_source": max(0, min(100, int(dna.get("open_source", min(100, summary.get("total_stars", 0) * 10 + 20))))),
        "specialist": max(0, min(100, int(dna.get("specialist", 60 if len(summary.get("languages_used", [])) <= 2 else 40)))),
        "explorer": max(0, min(100, int(dna.get("explorer", min(100, len(summary.get("languages_used", [])) * 25))))),
    }

    # Fallback for tech_stack_fingerprint using verified summary language data
    lang_counts = summary.get("language_counts", {})
    verified_languages = []
    provided_fp = parsed_dict.get("tech_stack_fingerprint", {}).get("languages", [])
    provided_score_map = {l.get("name", "").lower(): l.get("score", 70) for l in provided_fp if isinstance(l, dict)}

    for lang_name, count in lang_counts.items():
        score = provided_score_map.get(lang_name.lower(), min(100, count * 20 + 30))
        verified_languages.append({
            "name": lang_name,
            "score": max(0, min(100, int(score))),
            "repository_count": count,
        })
    parsed_dict["tech_stack_fingerprint"] = {"languages": verified_languages}

    # Fallback for strengths (must be exactly 3)
    strengths = parsed_dict.get("strengths")
    if not isinstance(strengths, list) or len(strengths) != 3:
        strong_sig = parsed_dict.get("strongest_signal", "Demonstrated capability in original repositories.")
        top_lang = summary.get("languages_used", ["software development"])[0] if summary.get("languages_used") else "software development"
        parsed_dict["strengths"] = [
            {"title": "Strong Core Signal", "description": strong_sig},
            {"title": "Active Language Focus", "description": f"Observable proficiency and repository volume centered in {top_lang}."},
            {"title": "Independent Creation", "description": f"Authored {summary.get('total_original_repositories', 0)} original repositories showcasing self-directed building."},
        ]

    # Fallback for weaknesses (must be exactly 3)
    weaknesses = parsed_dict.get("weaknesses")
    if not isinstance(weaknesses, list) or len(weaknesses) != 3:
        big_weak = parsed_dict.get("biggest_weakness", "Room for deeper repository documentation.")
        doc_rate = int(summary.get("documentation_rate", 0) * 100)
        parsed_dict["weaknesses"] = [
            {"title": "Primary Technical Gap", "description": big_weak},
            {"title": "Documentation Completeness", "description": f"README documentation rate currently stands at {doc_rate}%, leaving project context sparse."},
            {"title": "Maintenance Dispersion", "description": f"Recent activity is concentrated in {summary.get('recently_active_repositories', 0)} repositories, leaving older work dormant."},
        ]

    # Fallback for action_plan (3-5 items)
    plan = parsed_dict.get("action_plan")
    if not isinstance(plan, list) or len(plan) < 3:
        recs = parsed_dict.get("recommendations", [])
        parsed_dict["action_plan"] = [
            {
                "title": recs[0] if len(recs) > 0 else "Improve repository documentation",
                "reason": "Current documentation rate limits contributor comprehension.",
                "expected_impact": "Directly enhances project quality and external recruiter readability.",
                "priority": "High",
            },
            {
                "title": recs[1] if len(recs) > 1 else "Add setup guides and architecture notes",
                "reason": "Clear run instructions turn casual viewers into contributors.",
                "expected_impact": "Raises engineering depth score and demonstration credibility.",
                "priority": "High",
            },
            {
                "title": recs[2] if len(recs) > 2 else "Consolidate or tag legacy projects",
                "reason": "Clarifies active maintenance focus across your portfolio.",
                "expected_impact": "Improves consistency signals and visual profile organization.",
                "priority": "Medium",
            },
        ]

    # Fallback for recruiter_summary
    recruiter = parsed_dict.get("recruiter_summary") or {}
    top_proj_name = parsed_dict.get("best_project", {}).get("name") or "Primary Repository"
    parsed_dict["recruiter_summary"] = {
        "candidate_snapshot": recruiter.get("candidate_snapshot") or f"Public GitHub profile demonstrating work across {len(summary.get('languages_used', []))} languages with {summary.get('total_original_repositories', 0)} original repositories.",
        "technical_strengths": recruiter.get("technical_strengths") or [s.get("title", "") for s in parsed_dict["strengths"]],
        "strongest_projects": recruiter.get("strongest_projects") or [top_proj_name],
        "technology_breadth": recruiter.get("technology_breadth") or f"Active stack encompasses {', '.join(summary.get('languages_used', ['multiple tools']))}.",
        "engineering_signals": recruiter.get("engineering_signals") or [f"{summary.get('total_stars', 0)} stars earned", f"{int(summary.get('documentation_rate', 0)*100)}% README rate"],
        "documentation_quality": recruiter.get("documentation_quality") or f"Documentation rate is currently {int(summary.get('documentation_rate', 0)*100)}%.",
        "activity_consistency": recruiter.get("activity_consistency") or f"{summary.get('recently_active_repositories', 0)} repositories pushed within the last 180 days.",
        "areas_to_improve": recruiter.get("areas_to_improve") or [w.get("title", "") for w in parsed_dict["weaknesses"]],
        "overall_impression": recruiter.get("overall_impression") or "Evidence indicates a committed builder with opportunities to elevate portfolio presentation through thorough documentation and focused maintenance.",
    }

    return parsed_dict


async def analyze_github_data(
    profile: Dict[str, Any],
    summary: Dict[str, Any],
    top_repos: List[Dict[str, Any]],
    roast_level: str = "brutal",
) -> DeveloperAnalysis:
    """Send structured GitHub data to OpenRouter and parse the analysis into DeveloperAnalysis."""
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in the backend environment.",
        )

    model = os.getenv("OPENROUTER_MODEL", "").strip() or DEFAULT_OPENROUTER_MODEL
    system_prompt, user_prompt = build_analysis_prompt(profile, summary, top_repos, roast_level=roast_level)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://github.com/Nirmal0804/ai-github-roast",
        "X-Title": "AI Roast My GitHub",
        "Content-Type": "application/json",
    }

    request_body = {
        "model": model,
        "response_format": {"type": "json_object"},
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 1500,
    }

    url = f"{OPENROUTER_API_BASE}/chat/completions"

    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(url, headers=headers, json=request_body)
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Couldn't reach OpenRouter AI service right now. Please try again.",
        )

    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenRouter authentication failed. Please verify your OPENROUTER_API_KEY configuration.",
        )

    if response.status_code == 429:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="OpenRouter API rate limit reached. Please try again later.",
        )

    if response.status_code == 402:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OpenRouter payment required or insufficient credits. Please check your OpenRouter account.",
        )

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Configured OpenRouter model was not found. Please verify OPENROUTER_MODEL in backend/.env.",
        )

    if response.status_code >= 500:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OpenRouter AI service is temporarily unavailable. Please try again later.",
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"OpenRouter returned unexpected status {response.status_code}. Please try again.",
        )

    try:
        data = response.json()
        raw_message = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, json.JSONDecodeError):
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Malformed response received from OpenRouter AI service.",
        )

    try:
        parsed_dict = extract_json_payload(raw_message)
        populated_dict = populate_v3_fallbacks(parsed_dict, summary, roast_level)
        analysis_result = DeveloperAnalysis.model_validate(populated_dict)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to parse and validate AI analysis output: {str(exc)}",
        )

    return analysis_result
