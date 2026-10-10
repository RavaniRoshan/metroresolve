# Design — MetroResolve

## Architecture

Single-page React + Vite + TypeScript app. No backend, no
build-time code generation, no runtime dependencies beyond
the React runtime (Vite bundles everything).

Three layers:

1. **Data layer** — `src/data/complaints.json` (bundled,
   imported at build time; never fetched) and localStorage
   (single source of truth for case state at runtime).
2. **Logic layer** — pure functions: language detection,
   department classification, urgency scoring, reply
   templating (`src/lib/nlp.ts`); case model
   (`src/lib/cases.ts`); HTTP sync (`src/lib/sync.ts`);
   optional local inference (`src/lib/ollama.ts`).
3. **UI layer** — `src/App.tsx`: dashboard stats, add-form,
   sample batch, department queue tabs, detail panel, sync
   config, Ollama panel, export.

State flow is one-directional: text in → classifier →
CaseRecord → localStorage → re-render. Sync is an overlay
on the CaseRecord (`syncStatus`, `syncAttempts`,
`lastSyncError`, `acknowledgedAt`), never a second store.

## Local data format

`CaseRecord` (src/lib/cases.ts):

```
id                  string   SAMPLE-01..12 or MR-####
sourceText          string   original complaint text
channel             string   app | kiosk | phone | in-person | email
station             string   one of 8 synthetic stations
language            'en'|'hi'|'gu'|'gujlish'|'hinglish'
languageConfidence  'high'|'medium'|'low'
languageNote        string   honest detection caveat
department          'Safety'|'Cleanliness'|'Fare'|'Lifts'|'Staff Behaviour'
departmentScores    Record<Department, number>  keyword match counts
matchedSignals      string[]  matched keywords/phrases (explainability)
urgencyScore        number   0–100
urgencyBand         'urgent'|'high'|'normal'|'low'
urgencyReasons      {ruleId, label, points}[]
responseDraft       string   editable draft, template-filled
responseLanguage    'en'|'hi'|'gu'
responseNote        string   e.g. "English template — Gujlish has no template"
status              'new'|'in-progress'|'resolved'
origin              'sample-batch'|'manual'
createdAt/updatedAt ISO strings
syncStatus          'pending'|'synced'|'failed'
syncAttempts        number
lastSyncError       string|null
acknowledgedAt      string|null  set only on real 2xx
aiNote              string|null  set when Ollama produced the triage
```

`src/data/complaints.json` schema:

```
{
  "meta": { "source": "synthetic demo data — not live", "generated": ... },
  "stations": [8 generic station names],
  "channels": ["app","kiosk","phone","in-person","email"],
  "complaints": [ { "id","sourceText","channel","station" } × 12 ]
}
```

## Language detection and classification model

- **Script detection:** Gujarati (ગુજરાતી) and Devanagari
  (हिन्दी) Unicode ranges are unambiguous. Latin script is
  ambiguous (English vs Gujlish/Hinglish), resolved by
  lexicon share: Gujarati/Hindi transliterated terms vs
  English terms; a majority of neither → English. Fully
  romanized Gujlish/Hinglish is indistinguishable from
  English — this is a stated limitation, not a hidden
  failure (languageNote says so).
- **Department classification:** weighted keyword tables
  per department, per script (Gujarati, Hindi, English
  terms; Latin terms matched with word boundaries). The
  department with the highest weighted score wins; ties
  fall back to Safety only when safety keywords matched,
  otherwise a default. Matched keywords are stored in
  `matchedSignals` so every classification is explainable.
- **Urgency:** nine configurable rules (fire-signal +50,
  trapped-signal +50, harm-signal +40, accessibility +30,
  urgent-language +20, hazard +20, safety-category +15,
  service-outage +10, in-person-channel +10), summed and
  capped at 100. Bands: ≥65 urgent, ≥40 high, ≥20 normal,
  else low. Every fired rule contributes a visible reason.
  Safety complaints with supporting content score high by
  construction (fire/trapped/harm signals).

## Complaint-to-reply flow

1. Text arrives (sample batch, or manual paste).
2. `createCase` detects language, classifies department,
   scores urgency, lists reasons and matched signals.
3. `finalizeCase` fills `responseDraft` from the language
   template **only if no draft exists** (preserves Ollama
   or hand-written drafts).
4. Case is prepended to the queue; localStorage updated.
5. Queue is filterable by department; ordered by urgency
   score then recency.
6. Controller edits the draft in the detail panel and
   saves locally (case → `pending` in the outbox).
7. Sync (if an endpoint is configured): POST per pending
   case with `Idempotency-Key: <case.id>`; 2xx → `synced`
   + `acknowledgedAt`; 4xx (except 429) → `failed`
   immediately; network/429/5xx → retry with backoff up to
   `maxAttempts`, then `failed`. Records are never deleted
   locally by sync failure.

## Offline behavior and persistence

- Bundled JSON is imported at build time — zero network
  requests to load data.
- `public/sw.js` (cache-first, `metroresolve-shell-v1`)
  caches the app shell and static assets on first online
  load; registered only in production.
- localStorage (`metroresolve:cases`,
  `metroresolve:config`) is wrapped in a safe accessor
  (`src/lib/storage.ts`) that degrades to in-memory state
  if storage is unavailable (private mode, quota).
- Online/offline indicator from `navigator.onLine` plus
  `online`/`offline` events.

## Error states and graceful degradation

- Storage unavailable → in-memory queue, banner notes it;
  triage still works until reload.
- Sync endpoint unset → outbox grows; banner suggests
  Export JSON.
- Sync 4xx → permanent failure, shown per-case; no blind
  retry.
- Sync network error → retried with backoff, then failed;
  records retained.
- Ollama unreachable or model missing → check reports it
  plainly; rule-based triage continues uninterrupted.
- Corrupt persisted JSON → falls back to empty state and
  reseeds on next launch.

## Graph-calculated route vs verified alternative — the analogue here

A rule-based classification is a **heuristic suggestion**,
not a verified human judgment. Accordingly: every score is
labelled "prototype decision support"; every draft is
labelled "DRAFT — not sent, not approved"; the footer
states data is synthetic; and "synced" appears only after
a server acknowledgement. The UI never presents a
heuristic as an authority.
