import asyncio
import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
import httpx
from fastapi import HTTPException, status

from app.models.github import GithubRepository, RepositorySummary

GITHUB_API_BASE = "https://api.github.com"
MAX_PAGES = 10  # Up to 10 pages of 100 repos = max 1,000 repositories
PAGE_SIZE = 100
MAX_README_CHECK_REPOS = 10  # Check top N repositories for README presence to protect API rate limits


def _get_auth_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "AI-Roast-My-GitHub",
    }
    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def fetch_user_repositories(username: str) -> List[Dict[str, Any]]:
    """Fetch public repositories for a GitHub user across multiple pages.

    Implements pagination with per_page=100 up to MAX_PAGES (1000 repositories max).
    Handles 404, rate limits (403/429), and 5xx errors cleanly.
    """
    headers = _get_auth_headers()
    all_repositories: List[Dict[str, Any]] = []

    async with httpx.AsyncClient(timeout=10.0) as client:
        for page in range(1, MAX_PAGES + 1):
            url = f"{GITHUB_API_BASE}/users/{username}/repos"
            params = {
                "per_page": PAGE_SIZE,
                "page": page,
                "sort": "updated",
                "direction": "desc",
            }

            try:
                response = await client.get(url, headers=headers, params=params)
            except httpx.RequestError:
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Couldn't reach GitHub right now. Please try again.",
                )

            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="GitHub user not found. Check the username or URL.",
                )

            if response.status_code == 429 or (
                response.status_code == 403
                and (
                    response.headers.get("x-ratelimit-remaining") == "0"
                    or "rate limit" in response.text.lower()
                )
            ):
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="GitHub API rate limit reached. Please try again later.",
                )

            if 500 <= response.status_code < 600:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Couldn't reach GitHub right now. GitHub service is temporarily unavailable.",
                )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail="Couldn't reach GitHub right now. Please try again.",
                )

            page_data = response.json()
            if not page_data or not isinstance(page_data, list):
                break

            all_repositories.extend(page_data)

            # If fewer than PAGE_SIZE returned, this was the final page
            if len(page_data) < PAGE_SIZE:
                break

    return all_repositories


async def check_readme_presence(owner: str, repo_name: str, client: httpx.AsyncClient, headers: Dict[str, str]) -> bool:
    """Check if a repository contains a README using a lightweight HEAD request."""
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo_name}/readme"
    try:
        resp = await client.head(url, headers=headers)
        return resp.status_code == 200
    except Exception:
        return False


def _parse_iso_datetime(date_str: str | None) -> datetime | None:
    if not date_str:
        return None
    try:
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except Exception:
        return None


async def process_repositories(raw_repos: List[Dict[str, Any]], username: str) -> Tuple[List[GithubRepository], RepositorySummary, List[GithubRepository]]:
    """Transform raw GitHub repository records into structured data and aggregate signals.

    Calculates:
    - Quality signals (documentation rate, license rate, description rate, activity rate)
    - Deterministically ranked top 5 repositories (stars DESC, forks DESC, pushed_at DESC)
    """
    now = datetime.now(timezone.utc)
    headers = _get_auth_headers()

    # Step 1: Initial transformation of raw fields
    preliminary_repos: List[GithubRepository] = []
    for raw in raw_repos:
        license_info = raw.get("license") or {}
        license_name = license_info.get("name") if isinstance(license_info, dict) else None

        repo = GithubRepository(
            id=raw.get("id", 0),
            name=raw.get("name", ""),
            full_name=raw.get("full_name", f"{username}/{raw.get('name', '')}"),
            description=raw.get("description"),
            html_url=raw.get("html_url", f"https://github.com/{username}/{raw.get('name', '')}"),
            homepage=raw.get("homepage"),
            language=raw.get("language"),
            topics=raw.get("topics", []) or [],
            stars=raw.get("stargazers_count", 0) or 0,
            forks=raw.get("forks_count", 0) or 0,
            open_issues_count=raw.get("open_issues_count", 0) or 0,
            size=raw.get("size", 0) or 0,
            created_at=raw.get("created_at"),
            updated_at=raw.get("updated_at"),
            pushed_at=raw.get("pushed_at"),
            default_branch=raw.get("default_branch", "main") or "main",
            license_name=license_name,
            has_license=bool(license_name),
            is_fork=bool(raw.get("fork", False)),
            is_archived=bool(raw.get("archived", False)),
            has_wiki=bool(raw.get("has_wiki", False)),
            has_pages=bool(raw.get("has_pages", False)),
            has_readme=False,
        )
        preliminary_repos.append(repo)

    # Step 2: Deterministic ranking to identify top repositories
    # Ranking order: stars DESC, forks DESC, pushed_at DESC
    def sort_key(r: GithubRepository):
        pushed_dt = _parse_iso_datetime(r.pushed_at)
        pushed_ts = pushed_dt.timestamp() if pushed_dt else 0.0
        return (r.stars, r.forks, pushed_ts)

    sorted_repos = sorted(preliminary_repos, key=sort_key, reverse=True)

    # Step 3: Check README presence efficiently
    # To protect API rate limits, verify exact README existence for top N candidates
    repos_to_check = sorted_repos[:MAX_README_CHECK_REPOS]
    if repos_to_check:
        async with httpx.AsyncClient(timeout=6.0) as client:
            tasks = [
                check_readme_presence(username, repo.name, client, headers)
                for repo in repos_to_check
            ]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            for repo, result in zip(repos_to_check, results):
                if isinstance(result, bool):
                    repo.has_readme = result

    # For remaining repositories beyond the top N, use description/size metadata signal
    for repo in sorted_repos[MAX_README_CHECK_REPOS:]:
        repo.has_readme = bool(repo.size > 0 and repo.description)

    top_repositories = sorted_repos[:5]

    # Step 4: Compute Aggregations
    total_public_repositories = len(preliminary_repos)
    total_original_repositories = sum(1 for r in preliminary_repos if not r.is_fork)
    total_forked_repositories = sum(1 for r in preliminary_repos if r.is_fork)
    total_archived_repositories = sum(1 for r in preliminary_repos if r.is_archived)
    active_repositories = sum(1 for r in preliminary_repos if (not r.is_fork) and (not r.is_archived))
    total_stars = sum(r.stars for r in preliminary_repos)
    total_forks = sum(r.forks for r in preliminary_repos)

    # Languages
    language_counts: Dict[str, int] = {}
    for r in preliminary_repos:
        if r.language and r.language.strip():
            lang = r.language.strip()
            language_counts[lang] = language_counts.get(lang, 0) + 1

    # Deterministic order by count DESC, then name ASC
    languages_used = sorted(
        language_counts.keys(),
        key=lambda l: (-language_counts[l], l)
    )

    repositories_with_readme = sum(1 for r in preliminary_repos if r.has_readme)
    repositories_with_license = sum(1 for r in preliminary_repos if r.has_license)
    repositories_with_description = sum(
        1 for r in preliminary_repos if r.description and r.description.strip()
    )

    # Recently active: pushed within last 180 days (180 * 86400 seconds)
    recently_active_repositories = 0
    cutoff_seconds = 180 * 86400
    for r in preliminary_repos:
        dt = _parse_iso_datetime(r.pushed_at)
        if dt:
            diff = (now - dt).total_seconds()
            if 0 <= diff <= cutoff_seconds:
                recently_active_repositories += 1

    # Base for rates: original non-archived repositories (active_repositories), fallback to original or total
    base = active_repositories if active_repositories > 0 else (
        total_original_repositories if total_original_repositories > 0 else total_public_repositories
    )

    if base > 0:
        documentation_rate = round(min(1.0, repositories_with_readme / base), 3)
        license_rate = round(min(1.0, repositories_with_license / base), 3)
        description_rate = round(min(1.0, repositories_with_description / base), 3)
        activity_rate = round(min(1.0, recently_active_repositories / base), 3)
    else:
        documentation_rate = 0.0
        license_rate = 0.0
        description_rate = 0.0
        activity_rate = 0.0

    summary = RepositorySummary(
        total_public_repositories=total_public_repositories,
        total_original_repositories=total_original_repositories,
        total_forked_repositories=total_forked_repositories,
        total_archived_repositories=total_archived_repositories,
        active_repositories=active_repositories,
        total_stars=total_stars,
        total_forks=total_forks,
        languages_used=languages_used,
        language_counts=language_counts,
        repositories_with_readme=repositories_with_readme,
        repositories_with_license=repositories_with_license,
        repositories_with_description=repositories_with_description,
        recently_active_repositories=recently_active_repositories,
        documentation_rate=documentation_rate,
        license_rate=license_rate,
        description_rate=description_rate,
        activity_rate=activity_rate,
    )

    return preliminary_repos, summary, top_repositories
