import json
import os
import sys
import time
from pathlib import Path
from dotenv import load_dotenv

# Resolve and load backend/.env
backend_dir = Path(__file__).resolve().parent.parent
env_file = backend_dir / ".env"

if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()


def main():
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    model = os.getenv("GEMINI_MODEL", "").strip() or "gemini-2.5-flash"

    has_api_key = bool(api_key)
    has_model = bool(model)

    print(f"Gemini configured: {'YES' if has_api_key else 'NO'}")
    print(f"Model configured: {model if has_model else 'NO'}")

    if not has_api_key:
        print("Failure reason: missing API key (GEMINI_API_KEY is not set in backend/.env)")
        print("overall result: FAIL")
        sys.exit(1)

    try:
        from google import genai
        from google.genai import types, errors
    except ImportError as e:
        print(f"Failure reason: google-genai package not installed ({e})")
        print("overall result: FAIL")
        sys.exit(1)

    start_time = time.perf_counter()
    try:
        client = genai.Client(api_key=api_key)
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            temperature=0.1,
        )
        response = client.models.generate_content(
            model=model,
            contents='Respond strictly with JSON: {"ok": true}',
            config=config,
        )
        latency = time.perf_counter() - start_time
    except errors.APIError as err:
        latency = time.perf_counter() - start_time
        print("Response received: NO")
        print(f"Latency: {latency:.2f}s")
        err_str = str(err).lower()
        status_code = getattr(err, "code", None)
        if status_code in (401, 403) or "api_key_invalid" in err_str:
            print("Failure reason: invalid API key / HTTP 401 (authentication failed)")
        elif status_code == 429 or "resource_exhausted" in err_str or "quota" in err_str:
            print("Failure reason: rate limit / HTTP 429 (quota or rate limit reached)")
        elif status_code == 404 or "not found" in err_str:
            print(f"Failure reason: invalid model / HTTP 404 ({err})")
        else:
            print(f"Failure reason: Gemini API error ({err})")
        print("overall result: FAIL")
        sys.exit(1)
    except Exception as exc:
        latency = time.perf_counter() - start_time
        print("Response received: NO")
        print(f"Latency: {latency:.2f}s")
        print(f"Failure reason: Request error ({type(exc).__name__}: {exc})")
        print("overall result: FAIL")
        sys.exit(1)

    print("Response received: YES")
    print(f"Latency: {latency:.2f}s")

    raw_text = getattr(response, "text", "") or ""
    if not raw_text.strip():
        print("Failure reason: empty response from Gemini")
        print("overall result: FAIL")
        sys.exit(1)

    # Parse content as JSON
    try:
        trimmed = raw_text.strip()
        if trimmed.startswith("```"):
            lines = trimmed.splitlines()
            if len(lines) >= 3:
                trimmed = "\n".join(lines[1:-1]).strip()
        parsed = json.loads(trimmed)
        print("JSON parsing: PASS")
        print(f'Confirmed response content: {json.dumps(parsed)}')
    except Exception as exc:
        print("JSON parsing: FAIL")
        print(f"Failure reason: JSON parsing failure ({exc})")
        print("overall result: FAIL")
        sys.exit(1)

    print("overall result: PASS")
    sys.exit(0)


if __name__ == "__main__":
    main()
