# Claude instructions

This repo contains two tightly coupled systems in one monorepo:
- **`breathe/`** — Python CLI: behavioral contract testing for AI agents
- **`web/`** — Next.js web app: event discovery platform with calendar, import, and auth

## Always read first
- docs/shared-product-context.md
- docs/cross-repo-contract.md
- docs/current-architecture.md
- docs/build-and-test.md

## Systems in this repo
- **CLI system**: `breathe/`, `examples/`, `tests/`, `Makefile`, `pyproject.toml`
- **Web system**: `web/` (Next.js 15, Clerk auth, Neon DB, Tailwind, Framer Motion)

## Rule
Do not change cross-system contracts silently. If the database schema, API routes, env vars, auth assumptions, event data shape, or deployment config change, update `docs/cross-repo-contract.md` and mention the paired system's impact in your final summary.

## Before coding
Explain:
1. Which system owns this change (CLI or web)
2. Whether the other system must also change
3. Which contract file is affected (schema / API shape / env vars / auth)

## Verification
Run the relevant build/typecheck/test commands listed in docs/build-and-test.md before reporting done.
