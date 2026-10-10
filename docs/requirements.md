# Requirements — MetroResolve (PS-07: Every Complaint Heard)

**Status: challenge announced.** The organizers' problem is
PS-07 (Metro Operations). This document is scoped to it.

## Problem statement (provisional, from the announcement)

Passenger complaints arrive through multiple channels and
in Gujarati, Hindi, English, and mixed Gujlish. Urgent
complaints get buried. The required solution sorts
complaints into department queues, assigns urgency scores,
drafts replies in the complainant's language, works fully
on-device without network access, and syncs when
connectivity returns.

## Target user and job to be done

- **User:** a station controller / metro operations staff
  member under time pressure, possibly on a device with
  intermittent connectivity.
- **Job:** within seconds of a complaint arriving, know
  which department must handle it, how urgent it is (and
  why), and have a language-appropriate reply draft ready
  to review, edit, and send through the official channel.

## Event constraints

- Solo participant, ~2 hours of build time.
- Intermittent or absent internet; judges may enable
  airplane mode during the demo.
- No organizer-provided dataset.
- Submission requires a public GitHub repo, a one-line
  pitch, and an accurate description of what works.
- No cloud AI, no hosted databases, no backend, no live
  data feeds. Local Ollama is permitted if a model is
  already installed (it is not — see decisions.md).

## MVP scope (P0 — implemented and verified)

1. Dashboard with complaint counts, pending cases, urgent
   cases.
2. Local batch of 12 clearly labelled synthetic complaints
   (English, Hindi, Gujarati, Gujlish, Hinglish).
3. Manual complaint entry + selection from the sample batch.
4. Classification into five departments: Safety,
   Cleanliness, Fare, Lifts, Staff Behaviour.
5. Urgency score with visible per-rule reasons.
6. Editable response draft in the detected language.
7. Local save; case appears in the correct department queue.
8. Persistence across reloads.
9. Offline operation after first load; online/offline
   indicator; local outbox; JSON export.
10. Configurable sync adapter with non-duplicating
    retries; "synced" only after server acknowledgement.

## Explicit non-goals

- Real complaint ingestion (no email/WhatsApp/social feeds).
- Perfect multilingual NLP; human review is assumed.
- Official severity ratings or legally significant triage.
- Sending replies through any real channel.
- Authentication, multi-user roles, analytics, charts, maps.
- Android/native tooling; any hosted AI service.

## Acceptance criteria (P0)

- [x] `npm run build` passes (TypeScript + Vite).
- [x] First launch seeds exactly 12 synthetic cases; stats
      read 12 total / 12 pending / 4 urgent.
- [x] Each sample's language, department, score, and band
      match the documented expectations (12/12 verified).
- [x] All four language groups are represented (en, hi, gu,
      gujlish/hinglish).
- [x] Manual Gujarati complaint → MR-0001, Lifts, urgency 60.
- [x] Response edit persists and marks the case unsynced.
- [x] Reload preserves all cases and edits.
- [x] Airplane-mode reload after first load renders the full
      app from cache with the offline indicator.
- [x] Sync: 404 → permanent failure after 1 attempt;
      refused → 2 attempts then failure, records retained;
      2xx → synced with acknowledgement timestamp and
      Idempotency-Key on every request.
- [x] Zero console errors across the whole flow.
- [x] At least one complaint per language group tested.

## Data provenance (facts vs assumptions vs simulated)

- **Verified facts:** the app's own behaviour above
  (33/33 automated checks; see docs/final-report.md);
  Node/npm/git versions; Ollama daemon running with
  models `claude-sonnet-4-5:latest` and `qwen2.5-coder:3b`,
  and `gemma4:e2b` NOT installed.
- **Assumptions:** five departments are sufficient for the
  demo; controller workflow is single-device; a real sync
  endpoint would deduplicate on Idempotency-Key.
- **Simulated:** all complaint texts, stations, channels,
  and response templates are synthetic demo data — no real
  passenger complaints, no real Ahmedabad metro data, no
  verified translations.

## Challenge announcement changes

The challenge is now known (PS-07). Reconsider if the
organizers publish additional constraints:

- If a specific department list or urgency rubric is
  mandated, replace `URGENCY_RULES` in `src/lib/nlp.ts`
  and the department union in `src/lib/cases.ts`.
- If a real sync endpoint is provided, set it in the
  Sync panel and confirm dedupe on `Idempotency-Key`.
- If more languages are required, extend the lexicon
  tables in `src/lib/nlp.ts` (script detection + keywords).
- If judges require live data ingestion, that is out of
  scope for this build — flag it, don't fake it.
