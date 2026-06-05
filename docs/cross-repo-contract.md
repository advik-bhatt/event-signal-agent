# Cross-System Contract

Changes to anything in this file affect BOTH the CLI and web systems. Always update this doc when contracts change.

---

## 1. Database schema (Neon Postgres)
Source of truth: `web/db/schema.sql`

### Tables
```sql
events          -- canonical event records (source, name, date, venue, sponsors, ai_score)
user_events     -- user↔event relationship (status, personal_score)
workspaces      -- team/invite groups
workspace_members -- workspace membership
```

### Who writes
- **Web `/api/import`**: creates rows in `events` and `user_events`
- **CLI `breathe rank`**: does NOT write to DB — outputs HTML only

### Who reads
- **Web `/dashboard/calendar`**: reads `events` + `user_events`
- **Web `/api/calendar`**: reads `events` for iCal feed

### Changing schema
- Edit `web/db/schema.sql`
- Run the migration in Neon dashboard SQL editor
- Update `web/lib/db.ts` typed helpers
- Check all pages that query affected tables

---

## 2. Event data shape
TypeScript source of truth: `web/lib/parse-event.ts` → `ParsedEvent`

```typescript
interface ParsedEvent {
  name: string
  description: string
  start_at: string | null      // ISO 8601
  end_at: string | null
  venue: string | null
  venue_address: string | null
  organizer: string | null
  sponsors: Array<{ name: string; url?: string; description?: string }>
  tags: string[]
  url: string
  cover_image_url: string | null
  ai_score: number             // 0–100
  ai_reasoning: string
}
```

Python equivalent lives in `breathe/cli.py` `_NYC_EVENTS` list — these fields are a subset.

### Changing event shape
- Update `ParsedEvent` in `web/lib/parse-event.ts`
- Update `web/lib/db.ts` `saveEvent()` mapping
- Update `web/app/import/page.tsx` form fields
- Update `web/app/dashboard/calendar/page.tsx` seed data type
- Check `web/app/api/calendar/route.ts` iCal field mapping

---

## 3. API routes (web)
All routes live under `web/app/api/`.

| Route | Method | Purpose | Auth required |
|---|---|---|---|
| `/api/calendar` | GET | iCal feed | No (public feed) |
| `/import` (server action) | POST | Scrape + parse URL | Optional |

### Adding a new route
- Document it here
- Check if CLI needs to call it (currently: no CLI→web API calls)

---

## 4. Environment variables
All env vars must be documented in `web/.env.local.example`.

| Var | Used by | Required |
|---|---|---|
| `DATABASE_URL` | web/lib/db.ts | Yes (for DB features) |
| `FIRECRAWL_API_KEY` | web/lib/scrape.ts | No (falls back to plain fetch) |
| `ANTHROPIC_API_KEY` | web/lib/parse-event.ts, breathe/cli.py, examples/ | No (falls back to demo mode) |
| `OPENROUTER_API_KEY` | web/lib/parse-event.ts, breathe/cli.py | No (alternative to Anthropic) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | web auth | No (graceful fallback) |
| `CLERK_SECRET_KEY` | web auth | No (graceful fallback) |

---

## 5. Auth assumptions
- Clerk is optional — all pages render without Clerk keys (graceful fallback)
- User ID format: Clerk user ID string (e.g. `user_2abc...`)
- `user_events.user_id` and `workspace_members.user_id` store Clerk user IDs
- Dashboard pages check for Clerk keys at runtime, not build time

---

## 6. Color-coding contract
AI score → display color is used consistently across:
- `web/app/dashboard/calendar/page.tsx` (calendar blocks)
- `web/app/import/page.tsx` (score badge)
- `web/app/api/calendar/route.ts` (iCal `X-APPLE-CALENDAR-COLOR`)
- `breathe/cli.py` `_traffic_color()` (HTML rankings report)

```
80–100  →  #2d6a2d  (dark green)
60–79   →  #5a7a5a  (sage)
40–59   →  #b8860b  (goldenrod)
20–39   →  #cc6600  (orange)
0–19    →  #8b2020  (dark red)
```

If this mapping changes, update all four locations.
