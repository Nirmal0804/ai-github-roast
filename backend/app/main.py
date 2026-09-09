import os
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables from .env file if available
load_dotenv()

app = FastAPI(
    title="AI Roast My GitHub API",
    description="Backend API for AI Roast My GitHub",
    version="0.1.0",
)


def get_allowed_origins() -> List[str]:
    """Retrieve allowed CORS origins from environment or default to local dev."""
    raw_origins = os.getenv("ALLOWED_ORIGINS", "")
    if raw_origins:
        origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]
        if origins:
            return origins
    return [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]


# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "AI Roast My GitHub API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}
