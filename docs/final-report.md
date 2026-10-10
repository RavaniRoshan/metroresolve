# Final Report — MetroResolve (PS-07)

Build date: 2026-10-10. Stack: React 18 + Vite +
TypeScript, zero runtime dependencies beyond React.
Production build: **PASS** (`npm run build` — tsc clean,
Vite emits `dist/`: 255.54 kB JS / 7.40 kB CSS, gzip
well under 100 kB).

## Tested (all against the production build)

Verified by a 33-check automated CDP harness plus
targeted diagnostics; every result below was observed,
not inferred.

- **Production build & preview** — `npm run build` exits
  0; `npm run preview` serves `dist/` (HTTP 200).
- **Sample-data loading** — 12 synthetic complaints seed
  on first launch; stats 12 total / 12 pending / 4
  urgent / 0 acknowledged; outbox pill "12 unsynced".
- **Classification & urgency** — 12/12 samples match the
  documented expectations across English, Hindi, Gujarati,
  Gujlish, Hinglish; e.g. SAMPLE-01 en/Safety/95/urgent,
  SAMPLE-03 gu/Lifts/70/urgent (reasons: trapped-signal,
  urgent-language), SAMPLE-06 gu/Cleanliness/20/normal.
  Matched signals and per-rule reasons are visible per
  case.
- **Manual complaint creation** — Gujarati lift-entrapment
  text → MR-0001, gu/Lifts, urgency 60 (trapped +
  outage rules), origin "manual".
- **Response editing** — draft edited and saved locally;
  case marked `pending` (outbox); edit survives reload.
- **Persistence after reload** — full reload keeps all 13
  cases and the edited draft.
- **Offline behavior** — with CDP `Network.emulateNetworkConditions
  {offline:true}`, a fresh navigation renders the complete
  dashboard from the service-worker cache (`h1` MetroResolve,
  13 queue items, 13 cases, "Offline" indicator); SW
  controller active; cache `metroresolve-shell-v1` present.
  Independent diagnostic confirmed the same.
- **Local outbox & JSON export** — pending count tracked in
  header; Export JSON downloads all cases.
- **Sync error handling** — HTTP 404 → permanent failure
  after exactly 1 attempt, no case claimed synced;
  connection refused → 2 attempts with backoff then
  failure, all records retained; local 2xx endpoint → all
  cases `synced` with `acknowledgedAt`, `Idempotency-Key`
  header present on all 13 requests.
- **Ollama integration check** — daemon detected;
  `gemma4:e2b` correctly reported NOT installed; rule-based
  triage remains active.
- **Console cleanliness** — zero runtime errors/exceptions
  across the entire flow.

## Untested (honestly)

- Physical airplane mode (CDP-level network emulation
  used instead; manual procedure M8 documented for the
  demo machine).
- A real sync endpoint (a local stub stood in for 2xx;
  dedupe-on-idempotency-key must be confirmed by any
  real server).
- Ollama inference paths (model not installed; adapter
  exercised only to the model check; no models pulled).
- Cross-browser (Chromium only); real-device layout.
- Accessibility audit (P1.4).

## Known limitations

- **Language detection is a heuristic.** Fully romanized
  Gujlish/Hinglish is indistinguishable from English; the
  app says so in the per-case language note. Script-based
  detection (Gujarati/Devanagari) is reliable.
- **Urgency scores are prototype decision support**, not
  official severity ratings; rules are transparent and
  configurable but were not calibrated against real
  operations data.
- **Drafts are template-based** (Gujarati/Hindi/English);
  Gujlish/Hinglish receive the English template with an
  explicit note. Drafts are always labelled "not sent,
  not approved".
- **First load must be online once** so the service worker
  caches the shell; every subsequent load works offline.
- **No real sync endpoint is configured** — the outbox and
  JSON export are the sharing story until one is set.
- Synthetic dataset only: 12 complaints, 8 generic
  stations, 5 channels; no real Ahmedabad metro data,
  service status, or verified journey times anywhere.

## One-line pitch

"MetroResolve — offline-first complaint triage that never
lets an urgent passenger complaint get buried, even with
the network off."
