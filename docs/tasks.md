# Tasks — MetroResolve

Status legend: `[x]` = implemented **and** verified
(automated check + observed result). Nothing is checked
off on faith.

## P0 — smallest working prototype (complete)

- [x] **P0.1 Project skeleton**: React + Vite + TS,
      minimal CSS, no runtime deps beyond React.
      *Done: `npm run build` passes; bundle 255.54 kB JS
      / 7.40 kB CSS.*
- [x] **P0.2 Dashboard**: total, pending, urgent,
      server-acknowledged stat cards.
      *Done: renders 12/12/4/0 after seed (harness P1).*
- [x] **P0.3 Synthetic sample batch**: 12 complaints,
      EN/HI/GU/Gujlish/Hinglish, clearly labelled
      synthetic. *Done: `src/data/complaints.json`;
      seeded on first launch only.*
- [x] **P0.4 Manual entry + sample selection**: add-form
      with station/channel pickers; sample batch list.
      *Done: harness P4 creates MR-0001.*
- [x] **P0.5 Department classification** (5 departments)
      with visible matched signals. *Done: 12/12 samples
      match documented expectations (harness P2).*
- [x] **P0.6 Urgency score + per-rule reasons**.
      *Done: SAMPLE-03 shows 70/URGENT with reasons
      "trapped-signal", "urgent-language".*
- [x] **P0.7 Editable draft in detected language**.
      *Done: Gujarati template for SAMPLE-03; edit +
      "Save response locally" works (harness P5).*
- [x] **P0.8 Department queues + urgency-first ordering**.
      *Done: tabs filter; queue sorted by score desc.*
- [x] **P0.9 Persistence across reload**. *Done: harness
      P6 — 13 cases and edited draft survive reload.*
- [x] **P0.10 Offline shell via service worker**. *Done:
      harness P7 — offline navigation renders h1, 13
      queue items, "Offline" indicator; SW cache
      `metroresolve-shell-v1` present.*
- [x] **P0.11 Online/offline indicator + outbox count**.
      *Done: header pill; "Outbox: 12 unsynced" after
      seed.*
- [x] **P0.12 JSON export**. *Done: harness P12 —
      "Exported 13 case(s) to JSON".*
- [x] **P0.13 Sync adapter**: configurable endpoint,
      idempotency keys, backoff retries, no-duplicate
      semantics, "synced" only on 2xx. *Done: harness
      P8 (404 → fail after 1 attempt), P9 (refused →
      2 attempts then fail, records retained), P10
      (2xx → all synced, Idempotency-Key on all 13
      requests).*
- [x] **P0.14 Zero console errors** across the full
      flow. *Done: harness P0.*

**Definition of done for P0:** all of the above pass in
the production build (`npm run build && npm run preview`),
verified by the automated harness (33/33) and the manual
procedures in `docs/validation.md`.

## P1 — improvements after P0 holds

- [ ] **P1.1 Manual test on the demo machine**: run the
      M1–M8 procedures in `docs/validation.md` in a real
      browser, including airplane mode. *Acceptance: every
      M-check passes; note any machine-specific behavior.*
- [ ] **P1.2 Optional Ollama adapter live test** — only if
      `gemma4:e2b` is installed locally (it is not in this
      environment; do not pull it). *Acceptance: one
      Gujarati, Hindi, English, and Gujlish example each
      triaged via Ollama; rule-based fallback still works
      when Ollama is stopped.*
- [ ] **P1.3 Real sync endpoint smoke test** (if the
      organizers provide one). *Acceptance: cases sync
      once; a duplicate POST with the same Idempotency-Key
      does not create a second record server-side.*
- [ ] **P1.4 Accessibility pass**: focus order, labels,
      contrast on the three-column layout.
- [ ] **P1.5 More sample variety**: one complaint per
      station; edge cases (empty text, very long text,
      mixed-script single sentence).

## P2 — explicitly deferred

- [ ] **P2.1** Real complaint ingestion (email/WhatsApp/
      social channels) — needs backend; out of scope.
- [ ] **P2.2** Trained multilingual model for detection/
      classification — needs data and time; heuristic
      remains the shipped engine.
- [ ] **P2.3** Multi-user roles, authentication, audit
      log, dashboards/analytics.
- [ ] **P2.4** Reply sending through official channels
      (would require real credentials; never faked).
- [ ] **P2.5** IndexedDB migration for large queues —
      localStorage is sufficient for demo scale.
- [ ] **P2.6** i18n of the UI itself (UI is English;
      replies are templated in Gujarati/Hindi/English).

## Post-event / adaptation

If the actual challenge differs from PS-07, re-scope
from `docs/requirements.md` downward before touching
code — see the Hackathon Start Procedure in `README.md`.
