# RouteRelay

Offline-first metro journey-recovery web app — **hackathon
preparation starter**. Currently a working shell with synthetic
demo data; the route-calculation engine is not implemented yet
(see `docs/tasks.md`, P1).

> All network data is **synthetic demo data** — not live, not
> verified, not a real-world transport authority's information.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build → dist/
npm run preview    # serve the production build → http://localhost:4173
```

## What works today (verified at preparation time)

- Responsive app shell: DEMO MODE badge, data-status pills
  (local/synthetic, live not connected, storage state).
- Incident + destination selectors populated from bundled JSON.
- Route-recovery results placeholder + friendly empty state.
- Selection persists across refresh (localStorage, with
  in-memory fallback).
- Minimal service worker: after first online load, the shell
  renders from cache (airplane-mode capable). Manual browser
  test still required — see `docs/validation.md` M6–M7.

## Project structure

```
src/App.tsx            shell UI
src/main.tsx           mount + production-only SW registration
src/lib/data.ts        typed accessors over bundled JSON
src/lib/storage.ts     safe localStorage wrapper
src/data/network.json  synthetic demo network + scenarios
public/sw.js           minimal service worker
docs/                  requirements, design, tasks, validation,
                       decisions, idea-patterns
```

## Before the demo

1. Read `docs/validation.md` and run every check.
2. Confirm the airplane-mode reload test (M7) passes in the
   actual demo machine/browser.
3. Update the one-line pitch to describe **only** what works.

## Hackathon Start Procedure

1. **Inspect the announcement.** Underline the intended user,
   the operational problem, and any required deliverables.
2. **Map it.** Use the keyword table in `docs/idea-patterns.md`
   to pick the closest pattern — or decide the patterns don't
   fit and start fresh on the generic shell.
3. **Re-scope the docs first.** Update `docs/requirements.md`
   (problem, user, MVP, acceptance), `docs/design.md` (data
   schema, workflow), `docs/tasks.md` (P0 for the new scope),
   and `docs/validation.md` (what "done" means).
4. **Update the task list.** Check off nothing that isn't
   verified; move the new P0 to the top.
5. **Build the smallest viable solution:** one complete
   end-to-end workflow, running fully offline from bundled
   data. Only then add secondary features.
6. **Keep honesty visible:** DEMO MODE badge and synthetic-data
   labels stay unless/until real sourced data replaces them.

## GitHub (not yet pushed)

The repository is prepared locally with a baseline commit.
When internet is available:

```bash
gh repo create RouteRelay --public --source=. --remote=origin --push
```

See the final preparation report (or ask the agent) for status
checks, milestone commits, and push-recovery commands.
