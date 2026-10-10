# Decisions — MetroResolve

## D1. Web app, not Android

The event allows ~2 hours, permits airplane mode, and
judges use a browser. A web app needs no toolchain, no
device, no install, and its offline story (service worker
+ localStorage) covers the demo. Android would spend the
entire budget on environment setup. *Provisional only if
the organizers mandate a native app.*

## D2. The core workflow must not depend on any API

Connectivity is intermittent and may be cut during the
demo. Every core operation — shell render, data load,
classification, urgency, drafting, persistence — runs
from bundled JSON and localStorage with zero network
requests. Sync is an optional overlay, not a dependency.

## D3. Deterministic rule-based classifier is the primary engine

A keyword/script heuristic is explainable (every
classification lists its matched signals), testable
(12/12 sample expectations are pinned), dependency-free,
and instant. A model would be a black box with a
installation risk. The rules are configurable
(`URGENCY_RULES` in `src/lib/nlp.ts`).

## D4. Simulated incidents/complaints are visibly labelled

All bundled data is synthetic. The footer states it,
sample IDs are `SAMPLE-*`, and the notice banner reports
synthetic provenance. This is deliberate: judges must
never mistake demo data for live metro data.

## D5. Speculative ETAs, drafts, and scores are never presented as verified

Urgency scores carry the label "prototype decision
support — not official operational severity ratings".
Reply drafts carry "DRAFT — not sent, not approved".
"Synced" appears only after a real 2xx server
acknowledgement (`acknowledgedAt`). Language detection
reports a confidence and an honest note when romanized
Gujlish/Hinglish is indistinguishable from English.

## D6. Optional local Ollama adapter — off by default, never blocking

If `gemma4:e2b` were installed, the adapter could improve
classification/drafting. It is not installed here (verified
live), so it ships disabled. Design rules: localhost only
(no cloud AI, no complaint data leaves the device),
timeout-bounded, any failure falls back to the rule-based
engine without blocking the user, and the rule-based
path always remains available. Do not pull models during
the event.

## D7. Sync semantics: idempotent, retrying, honest

POST per case with `Idempotency-Key: <case.id>` so a
retry can never duplicate a record server-side (the
endpoint must honour the header). Network errors, 429,
and 5xx retry with backoff up to `maxAttempts`; other
4xx fail permanently (retrying cannot fix them). Failures
keep the record local in the outbox; JSON export is the
no-endpoint sharing path. Without a configured endpoint
the app says so and retains everything locally.

## D8. Department model is orthogonal to urgency

Department = *who* handles it (keyword classification).
Urgency = *when* (independent rule set). A Cleanliness
complaint can be urgent; a Safety complaint can be low.
This avoids conflating routing with priority and keeps
both dimensions explainable.

## D9. localStorage over IndexedDB

Demo-scale data (tens to hundreds of cases) fits
localStorage comfortably; the safe wrapper degrades to
in-memory if storage is unavailable. IndexedDB is listed
as P2.5 if queue size ever demands it.

## D10. Service worker: minimal and versioned

A single cache-first worker (`metroresolve-shell-v1`)
for the app shell and static assets — the smallest
reliable offline strategy, no stale-while-revalidate
complexity. Registered in production only, so dev
reflects source truth.

## Provisional until organizers confirm

- Department list and urgency rubric (D3/D8) — replace
  if a official rubric is published.
- Sync endpoint (D7) — configure when/if one exists.
- Language set (D5) — extend lexicons if more languages
  are required.
- Demo dataset stations (generic names, not the real
  network) — swap for sourced data if provided.
