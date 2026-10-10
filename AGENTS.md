# AGENTS.md — repository instructions for coding-agent sessions

- **Read first:** `docs/requirements.md`, `docs/design.md`,
  `docs/tasks.md`, and `docs/validation.md` before implementing
  anything.
- **Preserve existing work.** Never delete or overwrite files
  outside your task scope; adapt rather than reinitialize.
- **Minimal dependencies.** Do not add packages without a
  concrete need; prefer the existing stack (React, Vite, TS,
  local JSON, localStorage). No backend, no hosted services, no
  remote AI APIs, no maps, no Android tooling.
- **Local-first.** Core functionality must work with zero
  network requests after first load. Data is bundled JSON,
  imported — never fetched in the critical path.
- **One flow at a time.** Implement one complete end-to-end
  workflow before secondary features.
- **Verify before claiming.** Run `npm run build`, the
  automated checks and manual procedures in
  `docs/validation.md`, and the production preview. Report
  failures honestly — never claim a passing state you did
  not observe.
- **Never claim unverified data is live.** All bundled data
  is synthetic demo data; keep the provenance labels,
  "DRAFT — not sent, not approved", and "prototype
  decision support" wording intact unless real sourced
  data replaces them. "Synced" only after a real 2xx
  acknowledgement.
- **Rule-based engine is primary.** The Ollama adapter is
  optional, off by default, localhost-only, and must never
  block the user or replace the fallback. Do not pull
  models during the event.
- **Update task status only after verification.** A checkbox in
  `docs/tasks.md` means implemented *and* tested.
- **Git hygiene:** check for secrets before staging; commit in
  small milestones with clear messages; do not push unless
  explicitly asked.
