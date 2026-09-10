import json
import os
import sys
import time
from pathlib import Path
import httpx
from dotenv import load_dotenv

# Resolve and load backend/.env
backend_dir = Path(__file__).resolve().parent.parent
env_file = backend_dir / ".env"

if env_file.exists():
    load_dotenv(dotenv_path=env_file)
else:
    load_dotenv()


def main():
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    model = os.getenv("OPENROUTER_MODEL", "").strip()

    has_api_key = bool(api_key)
    has_model = bool(model)

    print(f"OpenRouter configured: {'YES' if has_api_key else 'NO'}")
    print(f"Model configured: {'YES' if has_model else 'NO'}")

    if not has_api_key:
        print("Failure reason: missing API key (OPENROUTER_API_KEY is not set in backend/.env)")
        print("overall result: FAIL")
        sys.exit(1)

    if not has_model:
        print("Failure reason: missing model (OPENROUTER_MODEL is not set in backend/.env)")
        print("overall result: FAIL")
        sys.exit(1)

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://github.com/Nirmal0804/ai-github-roast",
        "X-Title": "AI Roast My GitHub - Connectivity Test",
    }
    payload = {
        "model": model,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "user",
                "content": 'Respond strictly with JSON: {"ok": true}',
            }
        ],
        "max_tokens": 50,
        "temperature": 0.0,
    }

    start_time = time.perf_counter()
    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(url, headers=headers, json=payload)
        latency = time.perf_counter() - start_time
    except httpx.TimeoutException:
        latency = time.perf_counter() - start_time
        print("HTTP status: None")
        print("Response received: NO")
        print(f"Latency: {latency:.2f}s")
        print("Failure reason: timeout (request timed out after 30s)")
        print("overall result: FAIL")
        sys.exit(1)
    except httpx.NetworkError as exc:
        latency = time.perf_counter() - start_time
        print("HTTP status: None")
        print("Response received: NO")
        print(f"Latency: {latency:.2f}s")
        print(f"Failure reason: DNS/network error ({type(exc).__name__})")
        print("overall result: FAIL")
        sys.exit(1)
    except httpx.RequestError as exc:
        latency = time.perf_counter() - start_time
        print("HTTP status: None")
        print("Response received: NO")
        print(f"Latency: {latency:.2f}s")
        print(f"Failure reason: Request error ({type(exc).__name__})")
        print("overall result: FAIL")
        sys.exit(1)

    print(f"HTTP status: {response.status_code}")
    print("Response received: YES")
    print(f"Latency: {latency:.2f}s")

    if response.status_code == 401 or response.status_code == 403:
        print("Failure reason: invalid API key / HTTP 401 (authentication failed)")
        print("overall result: FAIL")
        sys.exit(1)
    elif response.status_code == 429:
        print("Failure reason: rate limit / HTTP 429 (rate limit exceeded or insufficient credits)")
        print("overall result: FAIL")
        sys.exit(1)
    elif response.status_code == 400:
        try:
            err_msg = response.json().get("error", {}).get("message", "Bad request")
        except Exception:
            err_msg = "Bad request"
        print(f"Failure reason: invalid model / HTTP 400 ({err_msg})")
        print("overall result: FAIL")
        sys.exit(1)
    elif response.status_code == 404:
        try:
            err_msg = response.json().get("error", {}).get("message", "Model not found or no active endpoints")
        except Exception:
            err_msg = "Model not found or no active endpoints"
        print(f"Failure reason: invalid model / HTTP 404 ({err_msg})")
        print("overall result: FAIL")
        sys.exit(1)
    elif response.status_code == 402:
        try:
            err_msg = response.json().get("error", {}).get("message", "Payment required / insufficient credits")
        except Exception:
            err_msg = "Payment required / insufficient credits"
        print(f"Failure reason: insufficient credits / HTTP 402 ({err_msg})")
        print("overall result: FAIL")
        sys.exit(1)
    elif response.status_code >= 500:
        print(f"Failure reason: OpenRouter server error / {response.status_code}")
        print("overall result: FAIL")
        sys.exit(1)
    elif response.status_code != 200:
        print(f"Failure reason: unexpected HTTP status {response.status_code}")
        print("overall result: FAIL")
        sys.exit(1)

    # Validate choices -> message -> content
    try:
        resp_json = response.json()
        choices = resp_json.get("choices")
        if not choices or not isinstance(choices, list):
            raise ValueError("missing choices array")

        first_choice = choices[0]
        message = first_choice.get("message")
        if not message or not isinstance(message, dict):
            raise ValueError("missing message object in choices[0]")

        content = message.get("content")
        if content is None:
            raise ValueError("missing content in message")
    except Exception as exc:
        print("Failure reason: malformed response (missing choices -> message -> content)")
        print(f"Detail: {exc}")
        print("overall result: FAIL")
        sys.exit(1)

    # Parse content as JSON
    try:
        # Handle markdown fences if model wraps in ```json ... ```
        trimmed = content.strip()
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
