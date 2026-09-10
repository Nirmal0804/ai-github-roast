from typing import Optional, List, Dict
from pydantic import BaseModel, Field


class ValidateGithubRequest(BaseModel):
    """Request payload for GitHub username/URL validation."""
    input: str = Field(..., description="GitHub username or profile URL", min_length=1, max_length=255)


class GithubProfile(BaseModel):
    """Public GitHub profile data model."""
    login: str
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: str
    html_url: str
    public_repos: int = 0
    followers: int = 0
    following: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ValidateGithubResponse(BaseModel):
    """Response payload for successful GitHub validation."""
    valid: bool = True
    username: str
    profile: GithubProfile


class GithubRepository(BaseModel):
    """Structured and normalized GitHub repository data model."""
    id: int
    name: str
    full_name: str
    description: Optional[str] = None
    html_url: str
    homepage: Optional[str] = None
    language: Optional[str] = None
    topics: List[str] = Field(default_factory=list)
    stars: int = 0
    forks: int = 0
    open_issues_count: int = 0
    size: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    pushed_at: Optional[str] = None
    default_branch: str = "main"
    license_name: Optional[str] = None
    has_license: bool = False
    is_fork: bool = False
    is_archived: bool = False
    has_wiki: bool = False
    has_pages: bool = False
    has_readme: bool = False


class RepositorySummary(BaseModel):
    """Aggregated signals and statistics across public repositories."""
    total_public_repositories: int = 0
    total_original_repositories: int = 0
    total_forked_repositories: int = 0
    total_archived_repositories: int = 0
    active_repositories: int = 0
    total_stars: int = 0
    total_forks: int = 0
    languages_used: List[str] = Field(default_factory=list)
    language_counts: Dict[str, int] = Field(default_factory=dict)
    repositories_with_readme: int = 0
    repositories_with_license: int = 0
    repositories_with_description: int = 0
    recently_active_repositories: int = 0
    documentation_rate: float = 0.0
    license_rate: float = 0.0
    description_rate: float = 0.0
    activity_rate: float = 0.0


class GithubRepositoriesResponse(BaseModel):
    """Response model for GitHub repositories endpoint."""
    username: str
    summary: RepositorySummary
    top_repositories: List[GithubRepository] = Field(default_factory=list)
    repositories: List[GithubRepository] = Field(default_factory=list)
