# Shared Product Context

## What Breathe is

Two products in one repo:

### 1. Breathe CLI (`breathe/`)
Open-source behavioral contract testing for AI agents. You define what an agent must do in YAML, run eval cases, and catch regressions before CI merges them. The command is `breathe run <spec.yaml>`.

Secondary command: `breathe rank` — AI-powered NYC Tech Week event ranker. Takes interests or a GitHub repo URL, ranks events, opens a paper-style HTML UI with a map and Google Calendar buttons.

### 2. Breathe Web (`web/`)
Event discovery and scheduling platform. The tagline is "just breathe" — it calms the stress of finding events across scattered sources (Luma, Partiful, Eventbrite, Meetup).

Core user flow:
1. Paste any event URL → Firecrawl scrapes it → Claude parses name/date/venue/sponsors → user reviews and saves
2. `/dashboard/calendar` shows saved events color-coded by AI score (dark green = must-attend → dark red = skip)
3. Subscribe via iCal feed or sync to Google Calendar
4. Share invite link with teammates

### Who uses it
- Founders, devs, and operators who attend multiple NYC tech events per week
- Teams that want a shared view of which events to attend
- 4-person initial team (owner + 3 collaborators via invite)

### Current state (June 2026)
- CLI: fully functional, used for demo at Startup Grind NYC
- Web: built, not yet deployed — needs Neon DB, Firecrawl key, and Vercel deploy
- One Supabase project exists (rolemate, inactive) — migrating to Neon

### Key external services
| Service | Purpose | Env var |
|---|---|---|
| Neon | Postgres database | `DATABASE_URL` |
| Clerk | Auth (web only) | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` |
| Firecrawl | Headless scraping of Luma/Partiful | `FIRECRAWL_API_KEY` |
| Anthropic | Event parsing + AI scoring | `ANTHROPIC_API_KEY` |
| OpenRouter | Anthropic proxy (alternative) | `OPENROUTER_API_KEY` |
