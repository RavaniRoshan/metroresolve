# Validation — MetroResolve

Automated checks were run against the **production build**
(`npm run build && npm run preview`) with a headless
Chromium driven over CDP. Manual checks are for the demo
machine. Automated ≠ manual: everything below marked
**[A]** ran as code; everything **[M]** must be run by a
human once.

## Environment verified

- Node v24.21.0, npm 11.19.0, git 2.43.0.
- Ollama daemon at localhost:11434 with models
  `claude-sonnet-4-5:latest`, `qwen2.5-coder:3b`;
  `gemma4:e2b` NOT installed (checked live, harness P11).

## Automated suite (33 checks — all passing)

Run: `node /tmp/mr-test.mjs` (development harness; not
shipped in the repo). Phases:

- **[A] P1 first load:** exactly 12 cases seeded; stats
  12/12/4/0; outbox pill "12 unsynced"; online indicator.
- **[A] P2 classification:** all 12 samples match the
  documented language/department/score/band table; all
  four language groups present; SAMPLE-03 has ≥2 urgency
  reasons; SAMPLE-03 draft is Gujarati.
- **[A] P3 detail panel:** source text, department +
  URGENT band, language with confidence, urgency reasons,
  matched signals, "DRAFT — not sent, not approved".
- **[A] P4 manual creation:** Gujarati text → MR-0001,
  gu/Lifts, urgency 60, origin manual.
- **[A] P5 response editing:** edit saved; case marked
  `pending` (outbox).
- **[A] P6 reload persistence:** 13 cases and the edited
  draft survive a full reload.
- **[A] P7 offline:** with `Network.emulateNetworkConditions
  {offline:true}`, a fresh navigation renders h1
  "MetroResolve", 13 queue items, 13 cases, and the
  "Offline" indicator — served from the SW cache
  (`metroresolve-shell-v1`).
- **[A] P8 sync 404:** endpoint returning 404 → all cases
  `failed` after exactly 1 attempt, none claimed synced.
- **[A] P9 sync refused:** dead port → 2 attempts with
  backoff, then `failed`; records retained in outbox.
- **[A] P10 sync 2xx:** local CORS-enabled endpoint → all
  cases `synced` with `acknowledgedAt`; `Idempotency-Key`
  present on all 13 requests.
- **[A] P11 Ollama check:** daemon detected, `gemma4:e2b`
  correctly reported NOT installed, rule-based triage
  active.
- **[A] P12 export:** JSON export of all 13 cases.
- **[A] P0:** zero console errors / exceptions throughout.

## Manual procedures (run once on the demo machine)

- **[M1] Dev startup:** `npm install && npm run dev` →
  http://localhost:5173 renders the dashboard; 12 cases
  seeded on first visit.
- **[M2] Production build:** `npm run build` → exits 0,
  no TypeScript errors; `dist/` emitted.
- **[M3] Production preview:** `npm run preview` →
  http://localhost:4173 renders; identical data to dev.
- **[M4] Core user flow:** open SAMPLE-03 → verify
  Lifts/70/URGENT/reasons/Gujarati draft; add a manual
  complaint; edit its draft; save locally; confirm the
  outbox count increments.
- **[M5] Invalid data:** submit empty complaint text →
  button disabled or friendly notice; paste 2000+ chars →
  case still created; no crash.
- **[M6] Refresh persistence:** hard-reload → all cases
  and edits intact.
- **[M7] First-load caching:** clear site data, load once
  online (SW installs), then check
  DevTools → Application → Service Workers shows the SW
  active, and Application → Cache Storage shows
  `metroresolve-shell-v1`.
- **[M8] Airplane-mode reload after caching:** tick
  "Offline" in DevTools (or physical airplane mode) →
  hard-reload → full dashboard renders; triage, editing,
  local save, and export all work; header shows "Offline".
- **[M9] Missing/stale data:** rename `dist/` away and
  serve an empty dir → clear error, no infinite spinner
  (server-level concern; app shell itself never 404s its
  own assets because they are bundled).
- **[M10] Language coverage:** one complaint each in
  English, Hindi, Gujarati, Gujlish, Hinglish → verify
  detected language badge and template language.

## What was NOT validated

- Real-browser airplane mode (no physical toggle here —
  CDP-level network emulation was used instead; M8 covers
  the human check).
- A real sync endpoint (none exists; a local stub server
  stood in for the 2xx path).
- Ollama inference (model not installed; adapter code is
  exercised only up to the model check).
- Cross-browser behavior (Chromium only).
