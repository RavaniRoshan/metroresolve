# Submission data pack — MetroResolve (PS-07)

Pre-filled, paste-ready. Repo URL field stays placeholder
until the push succeeds. Nothing below claims more than
what was verified (33/33 automated checks against the
production build, 2026-10-10).

## Core fields

- **Project name:** MetroResolve
- **Challenge / problem:** PS-07 — Every Complaint Heard
  (Metro Operations)
- **Team:** Solo
- **One-line pitch:** MetroResolve — offline-first
  complaint triage that never lets an urgent passenger
  complaint get buried, even with the network off.
- **Tags:** offline-first, metro operations, complaint
  triage, multilingual, Gujarati, Hindi, PWA, React,
  TypeScript, Vite

## Description (what it does)

Passenger complaints arrive through multiple channels in
Gujarati, Hindi, English, and mixed Gujlish/Hinglish, and
urgent ones get buried. MetroResolve classifies each
complaint into one of five department queues (Safety,
Cleanliness, Fare, Lifts, Staff Behaviour), assigns an
urgency score with visible per-rule reasons, and drafts an
editable reply in the detected language. Everything runs
on-device: bundled synthetic data, localStorage
persistence, and a service worker make the full triage
flow work with the network off. A configurable sync
adapter sends cases to an HTTP endpoint with
idempotency keys and retries when connectivity returns —
and the app only ever says "synced" after a real server
acknowledgement.

## What currently works (accurate, verified)

- Operations dashboard: total, pending, urgent, and
  server-acknowledged complaint counts.
- 12 labelled synthetic sample complaints across English,
  Hindi, Gujarati, Gujlish, and Hinglish, seeded on
  first launch.
- Manual complaint entry and sample selection.
- Deterministic classification into the five departments,
  with matched keywords shown per case.
- Urgency score (0–100) with per-rule reasons and band
  (urgent/high/normal/low).
- Editable response draft in the detected language
  (Gujarati/Hindi/English templates; Gujlish/Hinglish get
  English with an explicit note).
- Department queue filters; urgency-first ordering.
- localStorage persistence across reloads; graceful
  fallback if storage is unavailable.
- Online/offline indicator; local outbox of unsynced
  records; JSON export.
- Sync adapter: configurable endpoint, Idempotency-Key
  per case, backoff retries for network/429/5xx,
  permanent failure on other 4xx; "synced" only on 2xx.
- Service worker caches the app shell; after one online
  load the app renders fully with the network disabled.
- Optional local Ollama adapter (off by default; the
  expected gemma4:e2b model is not installed, so the
  rule-based engine remains active).

## Not included / known limitations (stated honestly)

- Language detection is a heuristic: fully romanized
  Gujlish/Hinglish is indistinguishable from English
  (disclosed in-app).
- Urgency scores are prototype decision support, not
  official operational severity ratings.
- Drafts are template-based and always labelled
  "DRAFT — not sent, not approved".
- No real complaint ingestion, no reply sending, no real
  sync endpoint configured (outbox + JSON export until
  one is set).
- First load must be online once for service-worker
  caching; every later load works offline.
- All bundled data is synthetic demo data — no real
  passenger complaints or live metro status.

## Tech stack

React 19, Vite, TypeScript, minimal CSS, local JSON,
localStorage, service worker. Zero runtime dependencies
beyond the React toolchain. No backend, no hosted
database, no cloud AI, no maps, no CDN assets.

## Run / build / offline-test commands

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # TypeScript check + production build
npm run preview    # http://localhost:4173
```

Offline test: open the preview URL once online, then
enable DevTools → Network → Offline and hard-reload —
the full dashboard, triage, editing, and local save
still work; the header shows "Offline".

## Demo script (≈3 minutes)

1. Dashboard shows 12 complaints, 12 pending, 4 urgent.
2. Open SAMPLE-03 — Gujarati lift complaint: Lifts,
   urgency 70 (URGENT), reasons "person trapped" +
   "urgent language", Gujarati draft labelled
   "DRAFT — not sent, not approved".
3. Add a manual Gujarati complaint → MR-0001, Lifts,
   urgency 60, appears in the queue.
4. Edit the draft → Save response locally → outbox
   count increments.
5. Hard-reload → case and edited draft persist.
6. DevTools Offline → hard-reload → everything works.
7. Export JSON → downloads all cases.

## Repository

- **URL:** https://github.com/RavaniRoshan/metroresolve
  (public, `main` branch pushed and verified).

## Submission record

- **Form:** Metro Hacks Project Submission (Google Forms,
  DevFest Gandhinagar / GDG Gandhinagar × GDG Cloud Gandhinagar)
- **Submitted:** 2026-10-10 (UTC), via automated headless
  browser — every field value read back and verified in the
  live DOM before the Submit click (14/14 checks), and the
  confirmation page read "Your response has been recorded."
- **Answers as submitted:** see the field list above
  (track = Metro Operations; offline = Fully; demo link left
  blank — optional, no live site).
- **Honest disclosures included in "What works right now":**
  first-load-once caveat for service-worker caching, and
  prior-work disclosure (React+Vite starter scaffolded
  before the ride; all triage logic, demo data and docs
  written during the event).

## Machine-readable (for JSON/API forms)

```json
{
  "name": "MetroResolve",
  "challenge": "PS-07 — Every Complaint Heard (Metro Operations)",
  "team": "solo",
  "pitch": "MetroResolve — offline-first complaint triage that never lets an urgent passenger complaint get buried, even with the network off.",
  "stack": ["React 19", "Vite", "TypeScript", "localStorage", "service worker", "local JSON"],
  "languages_supported": ["English", "Hindi", "Gujarati", "Gujlish", "Hinglish"],
  "departments": ["Safety", "Cleanliness", "Fare", "Lifts", "Staff Behaviour"],
  "offline": true,
  "dependencies_added": 0,
  "repo_url": "https://github.com/RavaniRoshan/metroresolve"
}
```
