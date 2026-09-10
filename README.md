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

---

### 3. OpenRouter / LLM Setup

To configure and validate the AI review engine:

1. **Create an OpenRouter API Key**:
   - Sign up at [OpenRouter](https://openrouter.ai/) and generate an API key.

2. **Configure Environment Variables**:
   - Create a `backend/.env` file (copied from `backend/.env.example`).
   - Put your API key in `backend/.env`:
     ```env
     OPENROUTER_API_KEY=your_openrouter_api_key_here
     ```
   - Set `OPENROUTER_MODEL` to your chosen model (e.g. `google/gemini-2.0-flash-001` or any JSON-compatible model):
     ```env
     OPENROUTER_MODEL=google/gemini-2.0-flash-001
     ```

3. **Security**:
   - **Never expose the API key to the frontend.** All LLM calls must remain exclusively on the backend server.
   - `backend/.env` is ignored by git to keep secrets safe.

4. **Run the Development Connectivity Test**:
   - Run the lightweight connectivity test script to verify model configuration and API access:
     ```bash
     cd backend
     python scripts/test_openrouter.py
     ```
