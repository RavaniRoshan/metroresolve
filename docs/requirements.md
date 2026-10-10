# RouteRelay — Requirements (PROVISIONAL)

> Status: prepared **before** the official hackathon challenge was announced.
> Everything below is a hypothesis about the challenge, not a commitment.
> All network data in this project is **synthetic demo data** unless explicitly labelled otherwise.

## Provisional problem statement

When a metro segment is disrupted, a passenger on a train platform or
station concourse needs a quick alternative route to their destination —
using only data bundled with the app, because event connectivity cannot
be relied on.

## Target user & job to be done

- **User (provisional):** a metro passenger affected by a disruption;
  possibly an operations volunteer demonstrating recovery workflows.
- **Job to be done:** "My line is disrupted — show me, offline, a
  plausible alternative across the network, and be honest that it is
  simulated."

## Event constraints (stated by the organizer brief)

- Solo participant; approximately **two hours** to build.
- Intermittent or absent internet; judges **may enable airplane mode**.
- No organizer-provided dataset.
- Submission requires: public GitHub repository, one-line pitch, and an
  accurate description of what currently works.
- Stack preference: React + Vite + TypeScript, minimal CSS, local JSON,
  localStorage, Git/GitHub. No Next.js, backend, hosted DB, remote AI
  APIs, Android tooling, live maps, or unnecessary dependencies.

## MVP scope (P0 — smallest working prototype)

1. Responsive app shell that renders with zero network requests.
2. Home screen with a clearly visible **DEMO MODE** indicator.
3. Incident (affected-segment) selection area, populated from bundled data.
4. Destination selection area.
5. Route-recovery results **placeholder** (engine is P1, not P0).
6. Visible data-status indicator: data is local/synthetic; live data is
   not connected.
7. Friendly empty state when no scenario is selected.
8. Selection persists across refresh via localStorage, degrading
   gracefully when storage is unavailable.

## Non-goals

- No live, real-time, or official service-status data.
- No complete real-world network (explicitly **not** a full
  Ahmedabad–Gandhinagar network).
- No verified ETAs, fares, or replacement-bus availability claims.
- No maps, GPS, Android/native builds, backend, hosted database, or AI APIs.
- No accounts, no multi-user features, no decorative polish.

## Acceptance criteria (P0)

- `npm run build` and `npm run preview` succeed; app renders without
  runtime errors.
- The shell and demo data load with no network request after first load
  (bundled assets only; service worker registered in production builds).
- DEMO MODE badge, data-status pills, and empty state are visible and
  correct.
- Selecting an incident + destination updates the results placeholder;
  the choice survives a page refresh.
- No text in the UI presents simulated data as live or verified.

## Challenge announcement changes

Reconsider the following **once the official challenge is announced**
(record decisions in `docs/decisions.md`):

- [ ] Is journey recovery still the right problem? Map the announcement
      to a pattern in `docs/idea-patterns.md` or discard the patterns.
- [ ] Target user and job-to-be-done.
- [ ] Required local data schema (stations/edges may need to change).
- [ ] MVP scope, acceptance criteria, and the P0/P1 split.
- [ ] Whether demo data must be regenerated for a different city/system.

## Fact ledger

### Verified facts (checked during preparation)

- Working directory was empty; no prior work existed to preserve.
- Node v24.21.0, npm 11.19.0, git 2.43.0, `gh` CLI (authenticated as
  RavaniRoshan, SSH, `repo` scope) available.
- npm registry reachable at preparation time (`npm ping` → PONG).

### Assumptions

- The demonstration environment may be offline after first load.
- Judges accept clearly-labelled synthetic data; honesty about data
  provenance is a feature, not a weakness.
- A browser is available for the demo (PWA, not a native app).

### Simulated data

- All stations, edges, statuses, durations, and scenarios in
  `src/data/network.json` are synthetic, generated 2026-10-10, and
  marked `verified: false`. Station names are generic placeholders.
