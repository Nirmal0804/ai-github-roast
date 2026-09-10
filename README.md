# AI Roast My GitHub

> **Bored → Built #01** &bull; An AI-powered developer intelligence tool that transforms public GitHub repository data into humorous, evidence-grounded roasts, engineering scorecards, and objective recruiter evaluations.

---

## Overview

**AI Roast My GitHub** evaluates a developer's public GitHub presence using observable repository metrics, code signals, and commit cadence. Powered by FastAPI, React, and Google Gemini API (via the official `google-genai` SDK), the application generates technical personality archetypes, multi-tier roast intensities, detailed strength/weakness audits, and recruiter summaries—all grounded strictly in verified repository facts.

---

## Screenshots

<!-- Visual preview placeholder -->
```text
+------------------------------------------------------------------------------------+
|  [Bored -> Built #01]                                          AI ROAST MY GITHUB  |
|                                                                                    |
|                           AI ROAST MY GITHUB                                       |
|                  Your GitHub deserves an honest review.                            |
|                                                                                    |
|       [ github.com/username                        ] [ Roast My GitHub 🔥 ]        |
|                                                                                    |
|  +------------------------------------------------------------------------------+  |
|  |  Developer Scorecard: 88/100 (Tier: Elite Builder)                           |  |
|  |  Developer DNA: Builder (90%) | Documenter (85%) | Maintainer (75%)          |  |
|  |  The Roast: "You maintain your repos like a Swiss watchmaker, yet 90% of    |  |
|  |  your star count rests comfortably on a single tutorial repository..."       |  |
|  |  Lens: [Developer Mode] [Recruiter Mode]  |  [Download PNG] [Download PDF]   |  |
|  +------------------------------------------------------------------------------+  |
+------------------------------------------------------------------------------------+
```

---

## Features

- **Evidence-Grounded Signals**: Inspects real GitHub signals—original repositories vs. forks, stars, forks, commit cadence (last 180 days), licensing, and README coverage.
- **Roast Intensity Selector**: Choose between **Friendly** (gentle teasing), **Brutal** (sharp senior engineer critique), or **Nuclear** (maximum comedic burns).
- **One-Line Roast**: Concise, shareable one-liner optimized for quick 1-click clipboard copying and social sharing.
- **Developer Scorecard**: Holistic 0–100 score across 4 core engineering dimensions (Technical Depth, Project Quality, Documentation, and Consistency) alongside an honest percentile indicator.
- **Developer DNA**: 7 measurable engineering dimensions: *Builder*, *Experimenter*, *Documenter*, *Maintainer*, *Open Source*, *Specialist*, and *Explorer*.
- **Tech Stack Fingerprint**: Visual language distribution with prominence scoring and repository volume badges based on actual code.
- **Audited Strengths & Weaknesses**: Exactly 3 positive attributes and 3 constructive gaps grounded in repository data.
- **Personalized Action Plan**: Prioritized high-impact recommendations (High / Medium / Low) for improving GitHub portfolio presence.
- **Developer League Tiers**: Deterministic ranking (*Code Rookie*, *Builder*, *Strong Builder*, *Elite Builder*, *GitHub Legend*).
- **Recruiter Mode**: Toggle from comedic roast to a structured, professional evaluation designed for hiring managers and technical recruiters.
- **Historical Comparison**: Compares score progression against previous audits stored locally in the browser (`localStorage`), with no database or login required.
- **Export & Download**: One-click export to high-resolution PNG or PDF (powered by `html2canvas` & `jsPDF`).
- **Dark-Purple Glassmorphism UI**: Polished, responsive desktop and mobile experience with ambient purple gradients and micro-interactions.

---

## Architecture

```text
React 18 + Vite (Frontend)
          │
          │ HTTP / JSON API (CORS-restricted)
          ▼
FastAPI + Uvicorn (Backend)
         ╱         ╲
        ╱           ╲
       ▼             ▼
GitHub REST API   Google Gemini API
(Public Profile   (gemini-2.5-flash / gemini-3.6-flash)
 & Repositories)
```

The system uses an intentional, lightweight architecture:
- **No database required**: State is derived on-demand from the GitHub API and transiently processed.
- **No user authentication required**: Operates exclusively on public GitHub data.
- **Safe local storage**: Historical trends are persisted solely within the client's browser.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, Tailwind CSS, html2canvas, jsPDF |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic V2, Google GenAI SDK (`google-genai`), HTTPX, Python-Dotenv |
| **AI Model** | Google Gemini API (`gemini-2.5-flash` / `gemini-3.6-flash`) |
| **Data Provider** | GitHub REST API v3 |
| **Hosting (Target)** | Frontend: **Vercel** &bull; Backend: **Render** |

---

## Project Structure

```text
ai-github-roast/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   │       └── github.py          # API endpoints (/validate, /repositories, /analyze)
│   │   ├── models/
│   │   │   ├── analysis.py            # Pydantic models for scores, DNA, recruiter summaries
│   │   │   └── github.py              # GitHub profile & repository models
│   │   ├── services/
│   │   │   ├── ai_service.py          # Gemini prompt generation, structured output schema, fallback repair
│   │   │   ├── github_service.py      # Input normalization & profile retrieval
│   │   │   └── repository_service.py  # Repository fetching, pagination, and signal calculations
│   │   └── main.py                    # FastAPI application, CORS, health check, exception handling
│   ├── scripts/
│   │   ├── test_gemini.py             # Connectivity test utility for Google Gemini API
│   │   └── test_openrouter.py         # Connectivity test utility for OpenRouter (legacy)
│   ├── tests/                         # Full automated test suite (62 unit & integration tests)
│   ├── requirements.txt               # Backend Python dependencies
│   └── .env.example                   # Backend environment template
├── frontend/
│   ├── src/
│   │   ├── components/                # Modular React UI components
│   │   │   ├── AIAnalysisReport.jsx   # Core report container & scorecard
│   │   │   ├── ActionPlan.jsx         # Action items view
│   │   │   ├── DeveloperDNA.jsx       # 7-dimension behavioral DNA bars
│   │   │   ├── DownloadReport.jsx     # PNG/PDF export controls
│   │   │   ├── ErrorMessage.jsx       # Accessible error feedback
│   │   │   ├── GitHubInput.jsx        # Username/URL input form
│   │   │   ├── HistoricalComparison.jsx # Local progression & deltas
│   │   │   ├── LoadingState.jsx       # Animated loading indicator
│   │   │   ├── OneLineRoast.jsx       # 1-line roast with copy action
│   │   │   ├── ProfilePreview.jsx     # Profile header card
│   │   │   ├── RecruiterModeView.jsx  # Professional recruiter lens
│   │   │   ├── RepositorySummary.jsx  # Top repos & repository metrics
│   │   │   ├── RoastLevelSelector.jsx # Friendly / Brutal / Nuclear selector
│   │   │   ├── StrengthsWeaknesses.jsx# Strengths & weaknesses cards
│   │   │   └── TechStackFingerprint.jsx# Language prominence breakdown
│   │   ├── pages/
│   │   │   └── Home.jsx               # Main landing page
│   │   ├── services/
│   │   │   └── githubApi.js           # Frontend API client with safe trailing slash handling
│   │   └── utils/
│   │       └── historyStorage.js      # LocalStorage snapshot management
│   ├── package.json                   # Frontend dependencies
│   ├── vite.config.js                 # Vite configuration
│   └── .env.example                   # Frontend environment template
├── LICENSE                            # MIT License
└── README.md                          # Project documentation
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `PORT` | Optional | `8000` | Port for the Uvicorn server |
| `ALLOWED_ORIGINS` | Production | `http://localhost:5173` | Comma-separated list of allowed frontend origins (e.g. `https://your-app.vercel.app`) |
| `GITHUB_TOKEN` | Optional | *None* | Personal Access Token to raise GitHub API rate limits (60 req/hr &rarr; 5,000 req/hr) |
| `GEMINI_API_KEY` | **Required** | *None* | Google Gemini API key for AI report generation |
| `GEMINI_MODEL` | Optional | `gemini-2.5-flash` | Configured Gemini model identifier (`gemini-2.5-flash` or `gemini-3.6-flash`) |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | Production | `http://localhost:8000` | Base URL of the deployed FastAPI backend |

> **Security Notice**: Never put private credentials (`GEMINI_API_KEY` or `GITHUB_TOKEN`) into frontend files or `.env` templates. All LLM and authenticated GitHub queries run exclusively on the backend.

---

## Local Development

### 1. Prerequisites
- Python 3.10 or higher
- Node.js 18 or higher (npm included)
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/))

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your GEMINI_API_KEY

# Verify Gemini API connectivity
python scripts/test_gemini.py

# Start backend dev server
uvicorn app.main:app --reload
```
The backend API is now running at `http://localhost:8000`.
- Health Check: `http://localhost:8000/health`
- Interactive API Docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
The frontend interface will open at `http://localhost:5173`.

---

## API Overview

### `GET /health`
Returns lightweight status for monitoring and zero-downtime health checks.
```json
{
  "status": "healthy"
}
```

### `POST /api/github/validate`
Validates a GitHub username or profile URL and returns sanitized profile data.
- **Request Body**:
  ```json
  { "input": "octocat" }
  ```
- **Response**: `200 OK` with user details, or `400`/`404` error details.

### `GET /api/github/{username}/repositories`
Fetches and aggregates repository metrics (stars, active repos, README coverage, languages).
- **Response**: `200 OK` with summary signals, top 5 ranked repositories, and repository lists.

### `POST /api/github/{username}/analyze`
Orchestrates profile retrieval, repository processing, and Gemini AI analysis.
- **Request Body** (optional):
  ```json
  { "roast_level": "brutal" }
  ```
- **Response**: `200 OK` with full `DeveloperAnalysis` payload.

---

## Production Deployment

### Backend (Render)

1. Create a new **Web Service** on [Render](https://render.com/).
2. Connect your repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path**: `/health`
4. Set Environment Variables:
   - `GEMINI_API_KEY`: Your real Gemini API key
   - `GEMINI_MODEL`: `gemini-2.5-flash` (or `gemini-3.6-flash`)
   - `ALLOWED_ORIGINS`: `https://your-frontend.vercel.app`
   - `GITHUB_TOKEN`: *(Optional)* GitHub personal access token for higher limits

### Frontend (Vercel)

1. Create a new project on [Vercel](https://vercel.com/).
2. Connect your repository.
3. Configure the build settings:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Set Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com` (no trailing slash)

---

## Security & Hardening

- **Prompt Injection Defense**: Repository descriptions, READMEs, bios, and usernames are strictly isolated as untrusted user data. The model explicitly ignores embedded commands or attempts to override instructions.
- **CORS Hardening**: Production defaults disallow wildcard origins (`*`). Allowed origins are configured via `ALLOWED_ORIGINS` and restricted to `GET`, `POST`, and `OPTIONS` methods.
- **Input Bounding**: GitHub usernames/URLs are capped at 255 characters. Repository descriptions are truncated before LLM prompt submission to prevent payload bloating and token exhaustion.
- **Rate Limit & Error Isolation**: Provider errors (401, 403, 404, 429, 5xx) from GitHub or Gemini are caught cleanly and returned as actionable client error messages. Raw Python tracebacks and internal file paths are never exposed.
- **Safe State Handling**: LocalStorage reads are validated to isolate corrupt snapshots. Report downloads catch canvas errors gracefully without crashing the UI.

---

## Testing

The backend includes a comprehensive automated test suite covering input normalization, repository calculations, Gemini structured output parsing, prompt construction, CORS parsing, and error handling.

```bash
cd backend
python -m unittest discover -s tests -v
```

**Status**: **62 / 62 unit & integration tests passing** (+ live integration test suite `test_gemini_live.py`).

To verify the frontend production build:
```bash
cd frontend
npm run build
```

---

## Project Status

**Production-Ready (V3 Scope Complete)**. All core features, responsive layouts, export capabilities, recruiter modes, and security mitigations have been implemented and verified.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Author

Developed by **Nirmal** as part of the **Bored → Built** project series (#01).
