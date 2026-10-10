# MetroResolve

**PS-07: Every Complaint Heard — Metro Operations.**
Offline-first complaint triage for a station controller.
Complaints arrive in Gujarati, Hindi, English, and mixed
Gujlish/Hinglish. MetroResolve classifies each complaint
into one of five department queues (Safety, Cleanliness,
Fare, Lifts, Staff Behaviour), scores urgency with visible
reasons, drafts an editable reply in the detected language,
and stores everything locally. It works fully offline after
first load and syncs through a configurable HTTP endpoint
when one is provided.

> All bundled complaint data is **synthetic demo data**.
> Language detection, classification, and urgency scores
> are **prototype decision support** — not verified
> translations and not official operational severity
> ratings. Drafts are never sent or approved by this app.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # TypeScript check + production build → dist/
npm run preview    # serve the production build → http://localhost:4173
```

## What works (verified — see docs/final-report.md)

- Operations dashboard: total complaints, pending cases,
  urgent cases, server-acknowledged count.
- Local batch of 12 clearly labelled synthetic complaints
  covering English, Hindi, Gujarati, Gujlish and Hinglish,
  seeded on first launch.
- Manual complaint entry (any supported language) and
  one-click loading of any sample.
- Deterministic rule-based classification into the five
  departments, with matched keywords visible per case.
- Urgency score (0–100) with per-rule reasons and band
  (urgent ≥ 65, high ≥ 40, normal ≥ 20, low < 20).
- Editable response draft in the detected language
  (Gujarati/Hindi/English templates; Gujlish/Hinglish get
  the English template with an explicit note).
- Department queue filters; urgency-first ordering.
- localStorage persistence across reloads; graceful
  fallback if storage is unavailable.
- Online/offline indicator; local outbox of unsynced
  records; JSON export.
- Sync adapter: configurable endpoint, `Idempotency-Key`
  per case (server-side dedupe), retries with backoff for
  network errors/429/5xx, permanent failure on other 4xx.
  "Synced" is shown only after a real 2xx acknowledgement.
- Optional local Ollama adapter (localhost only, off by
  default). The rule-based engine remains active always.
- Service worker caches the app shell; after one online
  load the app renders with the network disabled.

## Architecture note

```
src/App.tsx            dashboard, queues, detail panel, sync UI
src/main.tsx           mount + production-only SW registration
src/lib/nlp.ts         language detection, department classifier,
                       urgency rules, reply templates
src/lib/cases.ts       CaseRecord model, factory, id sequence
src/lib/storage.ts     safe localStorage wrapper (JSON + fallback)
src/lib/sync.ts        HTTP sync adapter (idempotent, retrying)
src/lib/ollama.ts      optional local Ollama inference adapter
src/lib/data.ts        RouteRelay-era accessor (unused, kept)
src/data/complaints.json  12 synthetic complaints + stations/channels
src/data/network.json     RouteRelay-era demo data (unused, kept)
public/sw.js           shell cache service worker (metroresolve-shell-v1)
```

Data flows: bundled JSON → deterministic classifier →
CaseRecord → localStorage (single source of truth) → UI.
Sync is an overlay: records stay local until a configured
endpoint acknowledges them. No network request is needed to
render the shell, load data, classify, triage, or persist.

## Offline test (production build)

```bash
npm run build && npm run preview
# 1. Open http://localhost:4173 once while online (SW caches the shell).
# 2. Chrome DevTools → Application → Service Workers → "Offline" ticked,
#    or Network → "Offline" checkbox.
# 3. Hard-reload (Ctrl/Cmd+Shift+R). The dashboard, all 12+ cases,
#    triage, editing, and local save must all still work.
# 4. The header must show "Offline" and the unsynced-record count.
```

An automated CDP harness (33 checks) was used during
development; see `docs/validation.md`.

## Demo script (≈3 minutes)

1. Dashboard shows 12 complaints, 12 pending, 4 urgent.
2. Click **SAMPLE-03** — Gujarati lift complaint: Lifts,
   urgency 70 (URGENT), reasons "person trapped" +
   "urgent language", Gujarati draft labelled
   "DRAFT — not sent, not approved".
3. Add a manual Gujarati complaint → MR-0001, classified
   Lifts, urgency 60, appears in the queue.
4. Edit the draft, "Save response locally" — marked
   unsynced, outbox count increments.
5. Hard-reload — the case and edited draft persist.
6. DevTools Offline → hard-reload — everything still works.
7. Export JSON — downloads all cases.

## Assumptions

- Complaint text is synthetic; no real passenger data.
- Language detection is a script/lexicon heuristic —
  fully romanized Gujlish/Hinglish is indistinguishable
  from English by design (see docs/decisions.md).
- Urgency rules are configurable in `src/lib/nlp.ts`
  (`URGENCY_RULES`); scores are decision support only.
- A real sync endpoint must deduplicate on the
  `Idempotency-Key` header; no endpoint is configured
  out of the box, so records are retained locally and
  JSON export is the sharing path.
- First load must be online once so the service worker
  can cache the shell; every subsequent load works offline.
- Ollama adapter is optional and off by default; the
  expected model (`gemma4:e2b`) is not installed in this
  environment, so the rule-based engine is the active one.

## GitHub (not yet pushed)

The repository is prepared locally with baseline commits on
`main`. When internet is available:

```bash
gh repo create metroresolve --public --source=. --remote=origin --push
```

## Project docs

- `docs/requirements.md` — problem, user, scope, acceptance
- `docs/design.md` — architecture and data model
- `docs/tasks.md` — prioritized task list (P0 done)
- `docs/validation.md` — test procedures
- `docs/decisions.md` — architectural decisions and reasons
- `docs/final-report.md` — tested / untested / limitations
