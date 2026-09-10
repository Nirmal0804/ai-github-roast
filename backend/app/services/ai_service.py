import json
import os
import re
from typing import Dict, Any, List, Tuple
import httpx
from fastapi import HTTPException, status

from app.models.analysis import DeveloperAnalysis

OPENROUTER_API_BASE = "https://openrouter.ai/api/v1"
DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash"


def build_analysis_prompt(
    profile: Dict[str, Any],
    summary: Dict[str, Any],
    top_repos: List[Dict[str, Any]],
) -> Tuple[str, str]:
    """Construct the system and user prompts for the AI reviewer."""
    system_prompt = """You are an experienced software engineering reviewer analyzing a developer's public GitHub profile.
Your role is to produce a technically grounded, evidence-based, constructive, and humorous profile roast and review.

CRITICAL RULES:
1. STRICT GROUNDING: Only reference technologies, projects, metrics, skills, and activities explicitly present in the supplied data.
   NEVER invent private repositories, employment history, education, job titles, years of experience, or achievements not supported by the evidence.
2. If evidence for a metric, project, or signal is lacking or zero, explicitly say 'Insufficient evidence' or reflect that in lower scores.
3. Tone: A witty, sharp, senior code reviewer friend giving an affectionate, evidence-grounded roast. Slightly brutal, but constructive, respectful, and never abusive or hateful. NEVER attack appearance, identity, or personal traits.
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
9. roast: 2 to 5 sentences referencing actual data (languages, repo count, stars, README documentation rate, or activity). Make it funny, sharp, and specific.
10. recommendations: EXACTLY 3 specific, realistic, actionable recommendations to improve their GitHub presence grounded in detected weaknesses. Avoid generic advice like 'build better projects' or 'learn more'.

You MUST reply with a single, valid JSON object matching this schema:
{
  "overall_score": 0,
  "technical_depth_score": 0,
  "project_quality_score": 0,
  "documentation_score": 0,
  "consistency_score": 0,
  "developer_personality": "string",
  "strongest_signal": "string",
  "biggest_weakness": "string",
  "best_project": {
    "name": "string or null",
    "reason": "string"
  },
  "roast": "string",
  "recommendations": [
    "string",
    "string",
    "string"
  ]
}
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
    }

    user_prompt = f"Analyze the following GitHub developer dataset and output strict JSON according to your instructions:\n\n{json.dumps(user_payload, indent=2)}"
    return system_prompt, user_prompt


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
        else:
            json_str = trimmed

    return json.loads(json_str)


async def analyze_github_data(
    profile: Dict[str, Any],
    summary: Dict[str, Any],
    top_repos: List[Dict[str, Any]],
) -> DeveloperAnalysis:
    """Send structured GitHub data to OpenRouter and parse the analysis into DeveloperAnalysis."""
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OpenRouter API key is not configured. Please set OPENROUTER_API_KEY in the backend environment.",
        )

    model = os.getenv("OPENROUTER_MODEL", "").strip() or DEFAULT_OPENROUTER_MODEL
    system_prompt, user_prompt = build_analysis_prompt(profile, summary, top_repos)

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
        analysis_result = DeveloperAnalysis.model_validate(parsed_dict)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to parse and validate AI analysis output. The response did not match the required schema.",
        )

    return analysis_result
