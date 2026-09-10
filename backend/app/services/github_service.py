import os
import re
from urllib.parse import urlparse
from typing import Dict, Any
import httpx
from fastapi import HTTPException, status

GITHUB_API_BASE = "https://api.github.com"
# GitHub usernames: 1-39 alphanumeric characters or single hyphens, cannot begin or end with a hyphen
GITHUB_USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$")


def normalize_github_input(value: str) -> str:
    """Normalize a GitHub username or profile URL into a clean, validated username.

    Supports:
    - Plain username: 'nirmal', '  nirmal  '
    - Full URL: 'https://github.com/nirmal', 'https://github.com/nirmal/'
    - HTTP URL: 'http://github.com/nirmal'
    - URL without protocol: 'github.com/nirmal', 'github.com/nirmal/'
    - Leading/trailing whitespace is stripped.

    Rejects:
    - URLs with additional path segments (e.g. repos, settings)
    - Non-GitHub domains
    - Malformed usernames (invalid characters, consecutive hyphens, etc.)
    """
    if not value or not isinstance(value, str):
        raise ValueError("GitHub username or profile URL cannot be empty.")

    cleaned = value.strip()
    if not cleaned:
        raise ValueError("GitHub username or profile URL cannot be empty.")

    lower_val = cleaned.lower()

    # Detect if input is a URL or begins with a domain
    if lower_val.startswith(("http://", "https://", "github.com", "www.github.com")):
        url_to_parse = cleaned
        if not lower_val.startswith(("http://", "https://")):
            url_to_parse = f"https://{cleaned}"

        try:
            parsed = urlparse(url_to_parse)
        except Exception:
            raise ValueError("Enter a valid GitHub username or profile URL.")

        netloc = parsed.netloc.lower()
        if netloc not in ("github.com", "www.github.com"):
            raise ValueError("Only GitHub URLs (github.com) are supported.")

        path_segments = [seg for seg in parsed.path.split("/") if seg]
        if not path_segments:
            raise ValueError("Please provide a GitHub username in the URL.")
        if len(path_segments) > 1:
            raise ValueError("Invalid GitHub profile URL. Only profile URLs are supported (e.g. github.com/username).")

        candidate = path_segments[0]
    else:
        # If it contains slashes, it's an unsupported format (e.g., username/repo)
        if "/" in cleaned:
            raise ValueError("Enter a valid GitHub username or profile URL without extra paths.")
        candidate = cleaned

    # Validate candidate username format
    if not GITHUB_USERNAME_REGEX.match(candidate):
        raise ValueError("Enter a valid GitHub username. Usernames can only contain letters, numbers, and non-consecutive hyphens.")

    return candidate


async def get_github_profile(username: str) -> Dict[str, Any]:
    """Fetch public GitHub profile data for a validated username.

    Uses GITHUB_TOKEN if present in the environment for authenticated requests.
    Handles 404, rate limits (403/429), and 5xx errors cleanly.
    """
    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "AI-Roast-My-GitHub",
    }

    token = os.getenv("GITHUB_TOKEN", "").strip()
    if token:
        headers["Authorization"] = f"Bearer {token}"

    url = f"{GITHUB_API_BASE}/users/{username}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Couldn't reach GitHub right now. Please try again.",
        )

    if response.status_code == 200:
        data = response.json()
        return {
            "login": data.get("login", username),
            "name": data.get("name"),
            "bio": data.get("bio"),
            "avatar_url": data.get("avatar_url", ""),
            "html_url": data.get("html_url", f"https://github.com/{username}"),
            "public_repos": data.get("public_repos", 0),
            "followers": data.get("followers", 0),
            "following": data.get("following", 0),
            "created_at": data.get("created_at"),
            "updated_at": data.get("updated_at"),
        }

    if response.status_code == 404:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GitHub user not found. Check the username or URL.",
        )

    # Detect rate limiting: 429 or 403 with zero remaining or rate limit message
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

    # General fallback for any unexpected status code
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="Couldn't reach GitHub right now. Please try again.",
    )
