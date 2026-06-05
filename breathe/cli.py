from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import urllib.request
import webbrowser
from pathlib import Path
from urllib.parse import urlencode

from .config import ConfigError, load_spec
from .report import write_json_report, write_markdown_report
from .run import run_spec


def _load_env() -> None:
    """Load .env file from cwd into os.environ (does not overwrite existing vars)."""
    env_path = Path(".env")
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val

RED    = "\033[31m"
GREEN  = "\033[32m"
YELLOW = "\033[33m"
BOLD   = "\033[1m"
DIM    = "\033[2m"
RESET  = "\033[0m"

def _c(text: str, *codes: str) -> str:
    return "".join(codes) + text + RESET


# ── NYC Tech Week events ─────────────────────────────────────────────────────

_NYC_EVENTS = [
    {
        "id": "evt_no_forking_way",
        "name": "AI Builders Showcase",
        "date": "Jun 4",  "time": "6:00 PM",
        "venue": "Downtown Event Space, NYC",
        "lat": 40.7313, "lng": -73.9890,
        "gcal_start": "20260604T180000", "gcal_end": "20260604T210000",
        "text": "AI Builders Showcase — Jun 4, 6PM, Downtown NYC. Live code demos of production AI systems. Terminal-first crowd.",
    },
    {
        "id": "evt_ai_founders",
        "name": "AI Founders Mixer",
        "date": "Jun 5",  "time": "7:00 PM",
        "venue": "SoHo, NYC",
        "lat": 40.7256, "lng": -74.0008,
        "gcal_start": "20260605T190000", "gcal_end": "20260605T220000",
        "text": "AI Founders Mixer — Jun 5, 7PM, SoHo. Networking for AI startup founders and investors. Pitch practice welcome.",
    },
    {
        "id": "evt_devtools_panel",
        "name": "The Future of Dev Tools",
        "date": "Jun 6",  "time": "5:00 PM",
        "venue": "Brooklyn, NYC",
        "lat": 40.6892, "lng": -73.9442,
        "gcal_start": "20260606T170000", "gcal_end": "20260606T200000",
        "text": "The Future of Dev Tools — Jun 6, 5PM, Brooklyn. Panel on AI-assisted coding, CI/CD, and agent infrastructure.",
    },
    {
        "id": "evt_llm_in_prod",
        "name": "LLMs in Production: What Actually Works",
        "date": "Jun 7",  "time": "2:00 PM",
        "venue": "Lower East Side, NYC",
        "lat": 40.7157, "lng": -73.9863,
        "gcal_start": "20260607T140000", "gcal_end": "20260607T170000",
        "text": "LLMs in Production: What Actually Works — Jun 7, 2PM, Lower East Side. Engineers sharing war stories: latency, evals, hallucination, cost.",
    },
    {
        "id": "evt_growth_marketing",
        "name": "Growth Marketing with AI",
        "date": "Jun 5",  "time": "6:00 PM",
        "venue": "Midtown, NYC",
        "lat": 40.7549, "lng": -73.9840,
        "gcal_start": "20260605T180000", "gcal_end": "20260605T210000",
        "text": "Growth Marketing with AI — Jun 5, 6PM, Midtown. Non-technical marketers learning ChatGPT prompt tricks.",
    },
    {
        "id": "evt_hiring_summit",
        "name": "Tech Hiring Summit",
        "date": "Jun 6",  "time": "10:00 AM",
        "venue": "Flatiron, NYC",
        "lat": 40.7411, "lng": -73.9897,
        "gcal_start": "20260606T100000", "gcal_end": "20260606T130000",
        "text": "Tech Hiring Summit — Jun 6, 10AM, Flatiron. Recruiters and founders share strategies for hiring engineers in an AI-disrupted market.",
    },
    {
        "id": "evt_web3_mixer",
        "name": "Web3 Builder Night",
        "date": "Jun 5",  "time": "8:00 PM",
        "venue": "FiDi, NYC",
        "lat": 40.7074, "lng": -74.0113,
        "gcal_start": "20260605T200000", "gcal_end": "20260605T230000",
        "text": "Web3 Builder Night — Jun 5, 8PM, FiDi. NFT creators and DeFi builders.",
    },
    {
        "id": "evt_crypto_panel",
        "name": "Crypto Regulation Panel",
        "date": "Jun 6",  "time": "4:00 PM",
        "venue": "Midtown, NYC",
        "lat": 40.7580, "lng": -73.9855,
        "gcal_start": "20260606T160000", "gcal_end": "20260606T190000",
        "text": "Crypto Regulation Panel — Jun 6, 4PM, Midtown. Legal experts on SEC policy and digital assets.",
    },
]


# ── repo context ─────────────────────────────────────────────────────────────

def _detect_repo_url() -> str | None:
    try:
        r = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=3,
        )
        if r.returncode == 0:
            url = r.stdout.strip()
            if url.startswith("git@github.com:"):
                url = "https://github.com/" + url[15:].removesuffix(".git")
            return url
    except Exception:
        pass
    return None


def _fetch_repo_context(repo_url: str) -> str:
    """Fetch README + key config files from a public GitHub repo."""
    url = repo_url.rstrip("/").removesuffix(".git")
    if "github.com" not in url:
        return ""
    parts = url.split("github.com/")[-1].split("/")
    if len(parts) < 2:
        return ""
    owner, repo = parts[0], parts[1]

    for path in ["README.md", "pyproject.toml", "package.json", "Cargo.toml"]:
        for branch in ["main", "master"]:
            try:
                raw = f"https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}"
                req = urllib.request.Request(raw, headers={"User-Agent": "breathe/1.0"})
                with urllib.request.urlopen(req, timeout=5) as resp:
                    return resp.read().decode("utf-8", errors="ignore")[:2500]
            except Exception:
                continue
    return ""


# ── helpers ──────────────────────────────────────────────────────────────────

def _load_events(path: str | None) -> list[dict]:
    if path:
        import yaml
        with open(path) as f:
            data = yaml.safe_load(f)
        return data if isinstance(data, list) else data.get("events", [])
    return _NYC_EVENTS


def _gcal_url(ev: dict, detail: str = "") -> str:
    start = ev.get("gcal_start", "")
    end   = ev.get("gcal_end",   "")
    if not start:
        return ""
    return "https://calendar.google.com/calendar/render?" + urlencode({
        "action":   "TEMPLATE",
        "text":     ev.get("name", ev.get("id", "")),
        "dates":    f"{start}/{end}",
        "details":  detail or ev.get("text", ""),
        "location": ev.get("venue", ""),
    })


def _rank_demo_mode(interests: str, events: list[dict]) -> dict:
    kw = interests.lower()
    scored = []
    for e in events:
        haystack = (e["id"] + " " + e.get("text", "")).lower()
        score = sum(1 for w in kw.replace(",", " ").split() if len(w) > 2 and w in haystack)
        scored.append((score, e))
    scored.sort(key=lambda x: -x[0])
    ranked = [e["id"] for _, e in scored]
    return {"ranked_events": ranked, "reasoning": {}, "citations": ranked[:3], "tool_calls": ["rank_events"]}


def _rank_live(interests: str, events: list[dict], api_key: str,
               repo_context: str = "", openrouter: bool = False) -> dict:
    try:
        import anthropic
    except ImportError:
        print(_c("  anthropic not installed — run: pip install anthropic", YELLOW), file=sys.stderr)
        return _rank_demo_mode(interests, events)

    if openrouter:
        client = anthropic.Anthropic(
            api_key=api_key,
            base_url="https://openrouter.ai/api/v1",
            default_headers={
                "HTTP-Referer": "https://github.com/advik-bhatt/breathe",
                "X-Title": "Breathe",
            },
        )
        model = "anthropic/claude-haiku-4-5-20251001"
    else:
        client = anthropic.Anthropic(api_key=api_key)
        model = "claude-haiku-4-5-20251001"

    block  = "\n".join(f'[{e["id"]}] {e.get("text", "")}' for e in events)

    repo_section = ""
    if repo_context:
        repo_section = f"\nContext from their codebase:\n{repo_context[:1500]}\n"

    msg = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": (
                f"Rank these NYC Tech Week events for a developer interested in: {interests}"
                f"{repo_section}\n\n"
                f"Events:\n{block}\n\n"
                f"Return ONLY valid JSON:\n"
                f"  ranked_events: list of event IDs best-first\n"
                f"  reasoning: object mapping event ID to one sentence\n"
                f"  citations: list of event IDs cited\n"
                f"  tool_calls: [\"rank_events\"]"
            ),
        }],
    )

    text = msg.content[0].text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text  = parts[1]
        if text.startswith("json"):
            text = text[4:]
    return json.loads(text.strip())


# ── HTML report ──────────────────────────────────────────────────────────────

def _traffic_color(rank: int, total: int) -> str:
    hue = int(120 * (1 - (rank - 1) / max(total - 1, 1)))
    return f"hsl({hue},48%,34%)"


def _build_html(interests: str, mode_label: str, events: list[dict],
                result: dict, repo_url: str = "") -> str:
    ranked    = result.get("ranked_events", [])
    reasoning = result.get("reasoning", {})
    citations = result.get("citations", [])
    event_map = {e["id"]: e for e in events}
    n = len(ranked)

    # ── ranking cards ──────────────────────────────────────────────────────
    cards = ""
    for i, eid in enumerate(ranked, 1):
        ev    = event_map.get(eid, {"id": eid, "name": eid})
        color = _traffic_color(i, n)
        reason_html = (f'<p class="reason">{reasoning[eid]}</p>'
                       if isinstance(reasoning, dict) and eid in reasoning else "")
        cited_html  = '<span class="cited">cited</span>' if eid in citations else ""
        cal_url     = _gcal_url(ev, reasoning.get(eid, "") if isinstance(reasoning, dict) else "")
        cal_btn     = (f'<a class="cal-btn" href="{cal_url}" target="_blank">+ Google Calendar</a>'
                       if cal_url else "")
        meta        = " · ".join(filter(None, [ev.get("date"), ev.get("time"), ev.get("venue")]))
        cards += f"""
  <div class="card" style="border-left-color:{color}">
    <div class="rank" style="color:{color}">{i}</div>
    <div class="body">
      <div class="name">{ev.get("name", eid)}<span class="chips">{cited_html}</span></div>
      <div class="meta">{meta}</div>
      {reason_html}{cal_btn}
    </div>
  </div>"""

    # ── map markers ────────────────────────────────────────────────────────
    markers_js = ""
    for i, eid in enumerate(ranked, 1):
        ev  = event_map.get(eid, {})
        lat = ev.get("lat")
        lng = ev.get("lng")
        if not lat:
            continue
        color     = _traffic_color(i, n)
        cal_url   = _gcal_url(ev)
        cal_link  = f'<a href="{cal_url}" target="_blank">+ Google Calendar</a>' if cal_url else ""
        reason    = reasoning.get(eid, "") if isinstance(reasoning, dict) else ""
        reason_p  = f"<p style='font-style:italic;color:#666;font-size:12px;margin:4px 0'>{reason}</p>" if reason else ""
        popup     = (f"<b>{i}. {ev.get('name','')}</b>"
                     f"<br><small>{ev.get('date','')} · {ev.get('time','')} · {ev.get('venue','')}</small>"
                     f"{reason_p}{cal_link}")
        markers_js += (
            f"L.circleMarker([{lat},{lng}],"
            f"{{radius:{max(18-i,8)},color:'{color}',fillColor:'{color}',"
            f"fillOpacity:0.75,weight:2}})"
            f".addTo(map).bindPopup({json.dumps(popup)});\n"
        )

    repo_line = f' &nbsp;·&nbsp; <a href="{repo_url}" target="_blank" style="color:#6a6158">{repo_url.split("github.com/")[-1]}</a>' if repo_url else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Breathe · Rankings</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#f7f4ef;color:#1c1a17;font-family:Georgia,'Times New Roman',Charter,serif;line-height:1.65}}
.header{{padding:44px 44px 0;max-width:700px;margin:0 auto}}
h1{{font-size:22px;font-weight:400;letter-spacing:-.2px;margin-bottom:6px}}
.sub{{font-size:13px;color:#9a9188;margin-bottom:28px;font-family:-apple-system,BlinkMacSystemFont,sans-serif}}
.sub em{{color:#6a6158;font-style:normal}}
nav{{padding:0 44px;max-width:700px;margin:0 auto 28px;display:flex;gap:8px;font-family:-apple-system,BlinkMacSystemFont,sans-serif}}
.tab-btn{{font-size:13px;padding:7px 18px;border-radius:6px;border:1px solid #ddd7cd;background:#f0ece4;color:#5a5248;cursor:pointer;transition:background .12s}}
.tab-btn.active{{background:#1c1a17;color:#f7f4ef;border-color:#1c1a17}}
#tab-list{{padding:0 44px 60px;max-width:700px;margin:0 auto}}
#tab-map{{height:calc(100vh - 180px);min-height:500px}}
.card{{background:#fff;border:1px solid #e4ddd4;border-left:3px solid #ccc;border-radius:8px;padding:22px 24px 20px;margin-bottom:10px;display:flex;gap:20px;align-items:flex-start;box-shadow:0 1px 3px rgba(60,40,20,.05);transition:box-shadow .15s,transform .12s}}
.card:hover{{box-shadow:0 4px 14px rgba(60,40,20,.09);transform:translateY(-1px)}}
.rank{{font-size:28px;font-weight:700;line-height:1;min-width:34px;padding-top:4px;font-family:Georgia,serif}}
.body{{flex:1;min-width:0}}
.name{{font-size:15px;font-weight:700;color:#1c1a17;margin-bottom:4px;display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}}
.chips{{display:inline-flex;gap:6px;align-items:center}}
.cited{{font-size:10px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-weight:500;color:#3a6e4f;background:rgba(58,110,79,.08);border:1px solid rgba(58,110,79,.2);border-radius:3px;padding:1px 6px;letter-spacing:.3px}}
.meta{{font-size:12px;color:#9a9188;margin-bottom:9px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;font-style:italic}}
.reason{{font-size:14px;color:#4a4540;margin-bottom:14px;line-height:1.6}}
.cal-btn{{display:inline-block;font-size:12px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;padding:5px 13px;border-radius:5px;background:#f0ece4;border:1px solid #ddd7cd;color:#5a5248;text-decoration:none;transition:background .12s}}
.cal-btn:hover{{background:#e8e3d8;color:#1c1a17}}
footer{{padding:0 44px 48px;max-width:700px;margin:0 auto;font-size:12px;color:#c4bdb4;font-family:-apple-system,BlinkMacSystemFont,sans-serif}}
</style>
</head>
<body>
<div class="header">
  <h1>Breathe · Event Rankings</h1>
  <p class="sub">Ranked for: <em>{interests}</em>{repo_line} &nbsp;·&nbsp; {mode_label}</p>
</div>
<nav>
  <button class="tab-btn active" onclick="show('list',this)">Rankings</button>
  <button class="tab-btn" onclick="show('map',this)">Map</button>
</nav>
<div id="tab-list">
{cards}
</div>
<div id="tab-map" hidden></div>
<footer id="footer">Breathe &nbsp;·&nbsp; github.com/advik-bhatt/breathe</footer>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
function show(tab, btn) {{
  document.getElementById('tab-list').hidden = (tab !== 'list');
  document.getElementById('tab-map').hidden  = (tab !== 'map');
  document.getElementById('footer').hidden   = (tab !== 'list');
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (tab === 'map' && !window._mapInit) {{
    window._mapInit = true;
    var map = L.map(document.getElementById('tab-map')).setView([40.730, -73.990], 12);
    L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png', {{
      attribution: '© OpenStreetMap contributors'
    }}).addTo(map);
    {markers_js}
  }}
}}
</script>
</body>
</html>"""


# ── rank command ─────────────────────────────────────────────────────────────

def _rank_command(args: argparse.Namespace) -> int:
    or_key   = os.getenv("OPENROUTER_API_KEY")
    api_key  = os.getenv("ANTHROPIC_API_KEY")
    events   = _load_events(getattr(args, "events", None))
    repo_url = getattr(args, "repo", None)

    # auto-detect repo from current directory if flag not given
    if not repo_url:
        repo_url = _detect_repo_url()

    repo_context = ""
    repo_label   = ""
    if repo_url:
        print(_c(f"  Reading repo: {repo_url}", DIM))
        repo_context = _fetch_repo_context(repo_url)
        repo_label   = repo_url.split("github.com/")[-1]
        if repo_context:
            print(_c(f"  Context loaded ({len(repo_context)} chars)", DIM))
        else:
            print(_c("  Could not read repo (private or not GitHub) — using interests only", YELLOW))

    # if no interests given but we have repo context, derive from repo
    interests = getattr(args, "interests", None) or ""
    if not interests and repo_context and api_key:
        interests = f"developer working on: {repo_label}"
    elif not interests:
        print(_c("  Provide interests or a --repo flag", RED), file=sys.stderr)
        return 1

    if or_key:
        mode_term = _c("OpenRouter · Claude Haiku · live", GREEN, BOLD)
        mode_html = "OpenRouter · Claude Haiku (live)"
    elif api_key:
        mode_term = _c("Claude Haiku · live", GREEN, BOLD)
        mode_html = "Claude Haiku (live)"
    else:
        mode_term = _c("demo mode  (set OPENROUTER_API_KEY or ANTHROPIC_API_KEY for live)", YELLOW)
        mode_html = "demo mode"

    print()
    print(_c("  Breathe · Event Scout", BOLD))
    print(f"  Interests: {_c(interests, DIM)}")
    if repo_label:
        print(f"  Repo:      {_c(repo_label, DIM)}")
    print(f"  Mode:      {mode_term}")
    print()

    try:
        if or_key:
            result = _rank_live(interests, events, or_key, repo_context, openrouter=True)
        elif api_key:
            result = _rank_live(interests, events, api_key, repo_context, openrouter=False)
        else:
            result = _rank_demo_mode(interests, events)
    except Exception as exc:
        print(_c(f"  Live ranking failed ({exc}) — falling back to demo mode", YELLOW), file=sys.stderr)
        result = _rank_demo_mode(interests, events)
        mode_html = "demo mode (fallback)"

    ranked     = result.get("ranked_events", [])
    reasoning  = result.get("reasoning", {})
    citations  = result.get("citations", [])
    tool_calls = result.get("tool_calls", [])
    event_map  = {e["id"]: e for e in events}

    for i, eid in enumerate(ranked, 1):
        ev   = event_map.get(eid, {})
        name = ev.get("name", eid)
        cited = _c("  ✓", GREEN) if eid in citations else ""
        print(f"  {_c(str(i), BOLD)}.  {name}{cited}")
        if isinstance(reasoning, dict) and eid in reasoning:
            print(f"      {_c(reasoning[eid], DIM)}")
    print()

    checks_ok = len(citations) > 0 and "rank_events" in tool_calls
    contract  = _c("PASS ✓", GREEN, BOLD) if checks_ok else _c("WARN", YELLOW, BOLD)
    print(f"  Contract:  {contract}   Citations: {_c(str(len(citations)), GREEN)}   Tools: {_c(', '.join(tool_calls) or 'none', DIM)}")

    html      = _build_html(interests, mode_html, events, result, repo_url or "")
    out_dir   = Path("reports")
    out_dir.mkdir(exist_ok=True)
    html_path = out_dir / "breathe-rankings.html"
    html_path.write_text(html, encoding="utf-8")
    print(f"  {_c(f'Report:    {html_path}', DIM)}")
    print()

    if not getattr(args, "no_browser", False):
        webbrowser.open(html_path.resolve().as_uri())

    return 0


# ── run command ──────────────────────────────────────────────────────────────

def _run_command(args: argparse.Namespace) -> int:
    try:
        spec = load_spec(args.spec)
    except ConfigError as exc:
        print(_c(f"Breathe config error: {exc}", RED), file=sys.stderr)
        return 2

    report    = run_spec(spec)
    md_path   = Path(args.report)
    json_path = Path(args.json_report) if args.json_report else md_path.with_suffix(".json")
    write_markdown_report(report, md_path)
    write_json_report(report, json_path)

    status_color = GREEN if report.status == "PASS" else RED
    print()
    print(_c(f"  Breathe: {report.status}", BOLD, status_color))
    print(_c(f"  Agent:      {report.agent_name}", BOLD))
    print()
    print(f"  Cases: {report.total_cases}  "
          f"Passed: {_c(str(report.passed_cases), GREEN, BOLD)}  "
          f"Failed: {_c(str(report.failed_cases), RED, BOLD) if report.failed_cases else _c('0', DIM)}")
    print(f"  Score: {_c(f'{report.average_score}/100', GREEN if report.average_score == 100 else YELLOW)}")
    print(_c(f"  Report: {md_path}", DIM))
    print()

    if report.failed_cases:
        print(_c("  Failures:", BOLD, RED))
        for result in report.results:
            if not result.passed:
                print(f"  {_c('✗', RED, BOLD)} {result.case_id}  "
                      f"{_c(f'{len(result.failures)} failed checks', RED)}")
                for check in result.failures[:3]:
                    print(f"    {_c('•', YELLOW)} {_c(check.name, BOLD)}: {_c(check.detail, DIM)}")
        print()
    else:
        print(f"  {_c('✓', GREEN, BOLD)} {_c('All checks passed', GREEN)}")
        print()

    return 0 if report.status == "PASS" or args.no_fail else 1


# ── parser ───────────────────────────────────────────────────────────────────

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="breathe",
        description="Behavioral contract testing for AI agents.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    run = sub.add_parser("run", help="Run a Breathe YAML contract file.")
    run.add_argument("spec", help="Path to breathe.yaml")
    run.add_argument("--report", default="reports/breathe-report.md")
    run.add_argument("--json-report", default=None)
    run.add_argument("--no-fail", action="store_true")
    run.set_defaults(func=_run_command)

    rank = sub.add_parser("rank", help="Rank NYC Tech Week events for your codebase and interests.")
    rank.add_argument("interests", nargs="?", default=None,
                      help="Your interests, e.g. 'AI agents, hiring engineers'")
    rank.add_argument("--repo",       default=None, help="GitHub repo URL (auto-detected if omitted)")
    rank.add_argument("--events",     default=None, help="Path to custom events YAML")
    rank.add_argument("--no-browser", action="store_true")
    rank.set_defaults(func=_rank_command)

    return parser


def main(argv: list[str] | None = None) -> int:
    _load_env()
    parser = build_parser()
    args   = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())
