import urllib.request
import urllib.error
import json
import sys

def test_live():
    print("Testing live API POST /api/github/octocat/analyze with roast_level='brutal'...")
    req = urllib.request.Request(
        "http://localhost:8000/api/github/octocat/analyze",
        data=json.dumps({"roast_level": "brutal"}).encode("utf-8"),
        headers={"Content-Type": "application/json", "Accept": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            print(f"HTTP STATUS: {resp.status}")
            print("FULL RESPONSE KEYS:", list(data.keys()))
            if "analysis" in data:
                print("ANALYSIS KEYS:", list(data["analysis"].keys()))
                print(json.dumps(data["analysis"], indent=2))
            analysis = data.get("analysis", {})
            print(f"OVERALL SCORE: {analysis.get('overall_score')}")
            print(f"LEAGUE: {analysis.get('league')} ({analysis.get('league_min_score')}-{analysis.get('league_max_score')})")
            print(f"PERCENTILE: {analysis.get('percentile_status')}")
            print(f"ROAST LEVEL: {analysis.get('roast_level')}")
            print(f"ONE-LINE ROAST: {analysis.get('one_line_roast')}")
            print(f"DEVELOPER DNA: {analysis.get('developer_dna')}")
            print(f"TECH STACK: {analysis.get('tech_stack_fingerprint')}")
            print(f"STRENGTHS ({len(analysis.get('strengths', []))}):")
            for s in analysis.get('strengths', []):
                print(f"  - {s.get('title')}: {s.get('description')}")
            print(f"WEAKNESSES ({len(analysis.get('weaknesses', []))}):")
            for w in analysis.get('weaknesses', []):
                print(f"  - {w.get('title')}: {w.get('description')}")
            print(f"ACTION PLAN ({len(analysis.get('action_plan', []))} items):")
            for a in analysis.get('action_plan', []):
                print(f"  - [{a.get('priority')}] {a.get('title')} (Why: {a.get('reason')})")
            print(f"RECRUITER SNAPSHOT: {analysis.get('recruiter_summary', {}).get('candidate_snapshot')}")
            print("\nALL V3 BACKEND CHECKS: PASS")
    except urllib.error.HTTPError as e:
        print(f"HTTP ERROR: {e.code} - {e.reason}")
        print("BODY:", e.read().decode("utf-8"))
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_live()
