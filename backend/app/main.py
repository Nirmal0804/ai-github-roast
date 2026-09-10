import os
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import github

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


# Configure CORS middleware with restricted methods and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Authorization"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Ensure unhandled server exceptions do not leak stack traces or system paths."""
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
            headers=getattr(exc, "headers", None),
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# Include API routers
app.include_router(github.router, prefix="/api/github", tags=["github"])


@app.get("/")
def root():
    return {"message": "AI Roast My GitHub API is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
