from typing import Optional
from fastapi import APIRouter, HTTPException, status
from app.models.github import (
    ValidateGithubRequest,
    ValidateGithubResponse,
    GithubProfile,
    GithubRepositoriesResponse,
)
from app.models.analysis import AnalyzeGithubResponse, AnalyzeGithubRequest
from app.services.github_service import normalize_github_input, get_github_profile
from app.services.repository_service import fetch_user_repositories, process_repositories
from app.services.ai_service import analyze_github_data

router = APIRouter()


@router.post("/validate", response_model=ValidateGithubResponse)
async def validate_github(payload: ValidateGithubRequest):
    """Normalize and validate a GitHub username or URL, then fetch the public profile."""
    try:
        username = normalize_github_input(payload.input)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    profile_dict = await get_github_profile(username)

    return ValidateGithubResponse(
        valid=True,
        username=username,
        profile=GithubProfile(**profile_dict),
    )


@router.get("/{username}/repositories", response_model=GithubRepositoriesResponse)
async def get_repositories(username: str):
    """Fetch, paginate, filter, and process public GitHub repositories for a user."""
    try:
        normalized_username = normalize_github_input(username)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    # Fetch raw repositories with pagination
    raw_repos = await fetch_user_repositories(normalized_username)

    # Process and compute aggregate signals and quality rates
    repositories, summary, top_repositories = await process_repositories(
        raw_repos, normalized_username
    )

    return GithubRepositoriesResponse(
        username=normalized_username,
        summary=summary,
        top_repositories=top_repositories,
        repositories=repositories,
    )


@router.post("/{username}/analyze", response_model=AnalyzeGithubResponse)
async def analyze_developer(
    username: str,
    payload: Optional[AnalyzeGithubRequest] = None,
):
    """Orchestrate profile retrieval, repository processing, and AI roast analysis."""
    try:
        normalized_username = normalize_github_input(username)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )

    # Determine roast level with default to brutal
    roast_level = "brutal"
    if payload and payload.roast_level:
        cleaned_level = payload.roast_level.strip().lower()
        if cleaned_level in ("friendly", "brutal", "nuclear"):
            roast_level = cleaned_level

    # Fetch profile and repositories concurrently
    profile_dict = await get_github_profile(normalized_username)
    raw_repos = await fetch_user_repositories(normalized_username)

    # Process repositories
    _, summary, top_repositories = await process_repositories(raw_repos, normalized_username)

    # Send structured evidence to AI reviewer
    top_repos_payload = [repo.model_dump() for repo in top_repositories]
    analysis = await analyze_github_data(
        profile=profile_dict,
        summary=summary.model_dump(),
        top_repos=top_repos_payload,
        roast_level=roast_level,
    )

    return AnalyzeGithubResponse(
        username=normalized_username,
        analysis=analysis,
    )
