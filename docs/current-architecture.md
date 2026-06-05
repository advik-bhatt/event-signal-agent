# Current Architecture

## Repo structure

```
breathe/            Python package — CLI contract testing harness
  cli.py            `breathe run` + `breathe rank` commands
  config.py         YAML spec loader
  runner.py         Subprocess agent runner
  run.py            Test orchestrator
  checks.py         11 behavioral checks
  report.py         Markdown + JSON report writer

examples/
  support-agent/    Buggy vs fixed refund agent (demo)
  event-scout/      NYTechWeek event ranker (live Claude)

web/                Next.js 15 web app
  app/
    page.tsx        Landing page (8 sections, Three.js sphere)
    dashboard/
      page.tsx      Dashboard stub with breathing animation
      calendar/     Week/day calendar view, color-coded events
    import/         URL import page + server actions
    invite/[code]/  Workspace invite page
    api/
      calendar/     iCal feed endpoint
  components/
    sections/       Landing page sections (Hero, Problem, Solution, etc.)
    ui/             BreathingSphere (Three.js)
  lib/
    db.ts           Neon serverless client + typed query helpers
    scrape.ts       Firecrawl integration (falls back to plain fetch)
    parse-event.ts  Claude API event extraction (fetch, no SDK)
    gcal.ts         Google Calendar deep-link builder
  db/
    schema.sql      Postgres schema (run in Neon dashboard)

tests/              pytest — buggy agent fails, fixed agent passes
Makefile            make demo · make test · make install
pyproject.toml      breathe package + CLI entry points
```

## Data flow

### CLI contract testing
```
breathe run spec.yaml
  → load YAML (config.py)
  → for each case: spawn agent subprocess with JSON stdin (runner.py)
  → capture stdout JSON + latency (run.py)
  → run 11 behavioral checks (checks.py)
  → write markdown + JSON report (report.py)
  → exit 0 (PASS) or 1 (FAIL)
```

### Web event import
```
User pastes URL → /import page
  → scrape.ts: Firecrawl POST → markdown content
  → parse-event.ts: Claude Haiku → ParsedEvent JSON
  → form pre-filled, user reviews
  → saveEventAction() → Neon events + user_events tables
  → redirect to /dashboard/calendar
```

### Web calendar view
```
/dashboard/calendar
  → getEvents() from Neon
  → render week/day grid
  → color each event block by ai_score
  → click → detail panel with GCal link + iCal download
```

### iCal subscription
```
GET /api/calendar
  → getEvents() from Neon
  → build RFC 5545 iCal string
  → return text/calendar response
  → Google Calendar / Apple Calendar subscribes to this URL
```

## Key dependencies

### CLI (Python)
- PyYAML — spec loading
- Standard library only (subprocess, json, urllib)
- Optional: anthropic SDK (installed on `make demo` if API key present)

### Web (Node)
- Next.js 15 (App Router)
- @clerk/nextjs — auth
- @neondatabase/serverless — Postgres client
- @react-three/fiber + @react-three/drei — 3D sphere
- framer-motion — animations
- tailwindcss

## Deployment
- **CLI**: pip install from repo, runs locally
- **Web**: Vercel, root directory = `web/`, Node 18+
- **Database**: Neon Postgres (serverless, auto-suspend)

## What's not built yet
- GCal OAuth write (push events with colors directly into user's calendar)
- Recurring event scraping / cron jobs
- Multi-source aggregation (Eventbrite API, Meetup GraphQL)
- Mobile PWA / share-sheet integration
