# Build and Test Commands

## CLI (Python)

### Install
```bash
make install
# or: python3 -m venv .venv --without-pip && .venv/bin/python3 -m ensurepip --upgrade && .venv/bin/python3 -m pip install -e ".[dev]"
```

### Run demo (FAIL → PASS → PASS)
```bash
make demo
# Requires no API key. Set OPENROUTER_API_KEY or ANTHROPIC_API_KEY for live Claude.
```

### Run tests
```bash
make test
# or: .venv/bin/pytest -q
# Expected: 2 tests pass (buggy agent fails contract, fixed agent passes)
```

### Run contract test manually
```bash
.venv/bin/breathe run examples/support-agent/breathe-fixed.yaml
.venv/bin/breathe run examples/support-agent/breathe-buggy.yaml --no-fail
```

### Rank events
```bash
.venv/bin/breathe rank "AI agents, hiring engineers"
.venv/bin/breathe rank --repo https://github.com/advik-bhatt/breathe
# Opens browser with ranked events. Needs ANTHROPIC_API_KEY or OPENROUTER_API_KEY for live mode.
```

---

## Web (Next.js)

### Install
```bash
cd web && npm install
```

### Dev server
```bash
cd web && npm run dev
# Opens at http://localhost:3000
# Works without any env vars (graceful fallbacks everywhere)
```

### Type check
```bash
cd web && npm run build
# Must pass with 0 errors before marking any change done
```

### Lint
```bash
cd web && npm run lint
```

### Required env vars for full functionality
Copy `web/.env.local.example` → `web/.env.local` and fill in:
```
DATABASE_URL=          # Neon → project → connection string
FIRECRAWL_API_KEY=     # firecrawl.dev → dashboard → API keys
ANTHROPIC_API_KEY=     # console.anthropic.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # dashboard.clerk.com
CLERK_SECRET_KEY=                    # dashboard.clerk.com
```

### Run DB schema (once, after Neon project created)
In Neon dashboard → SQL Editor → paste and run `web/db/schema.sql`

---

## CI (GitHub Actions)
`.github/workflows/test.yml` runs on every push:
1. `pytest -q` — CLI unit tests
2. `breathe run examples/support-agent/breathe-fixed.yaml` — contract test must pass

Web build is not yet in CI. To add it:
```yaml
- name: Web build check
  run: cd web && npm ci && npm run build
```

---

## Deployment (Vercel)
1. Connect `advik-bhatt/breathe` repo on vercel.com
2. Set root directory: `web`
3. Framework: Next.js (auto-detected)
4. Add all env vars from `web/.env.local.example`
5. Deploy
