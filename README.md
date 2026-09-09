# AI Roast My GitHub

## Project
AI Roast My GitHub

## Series
Bored → Built #01

## Description
A small AI-powered application that analyzes a public GitHub profile and generates a brutally honest developer report.

## Current status
Step 1 — Project foundation completed.

## Planned architecture
```text
React + Vite
      ↓
FastAPI
   ↙     ↘
GitHub   OpenRouter
 API       LLM
```

## Planned deployment
```text
Frontend → Vercel
Backend  → Render
```

## Local development

### 1. Frontend Setup

Navigate to the `frontend` directory:
```bash
cd frontend
```

#### Install frontend dependencies
```bash
npm install
```

#### Start the Vite development server
```bash
npm run dev
```

The frontend will run locally at `http://localhost:5173`.

---

### 2. Backend Setup

Navigate to the `backend` directory:
```bash
cd backend
```

#### Create a Python virtual environment
- **macOS/Linux**:
  ```bash
  python3 -m venv .venv
  source .venv/bin/activate
  ```
- **Windows (PowerShell)**:
  ```powershell
  python -m venv .venv
  .venv\Scripts\Activate.ps1
  ```

#### Install backend dependencies
```bash
pip install -r requirements.txt
```

#### Start FastAPI with Uvicorn
```bash
uvicorn app.main:app --reload
```

The backend API will be available at `http://localhost:8000`.

You can verify the endpoints:
- Root: `http://localhost:8000/`
- Health check: `http://localhost:8000/health`
- Interactive API docs: `http://localhost:8000/docs`
