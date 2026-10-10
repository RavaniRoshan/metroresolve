# RouteRelay — Task list

Status discipline: a checkbox is marked **only after the work is
implemented and verified**. Definition of done (DoD) is stated per task.

## P0 — required for the smallest working prototype

- [x] **Project scaffold** — Vite + React + TypeScript, minimal deps
      (react, react-dom, vite, @vitejs/plugin-react, typescript, types).
      Acceptance: `npm install` clean; `npm run build` passes.
      DoD: lockfile committed; build green.
      Verified 2026-10-10: install clean (0 vulnerabilities), build green.
- [x] **Application shell** — responsive layout, RouteRelay home screen,
      DEMO MODE badge, data-status pills (local/synthetic + live/not
      connected), storage-status pill.
      Acceptance: renders in a browser with no runtime errors.
      DoD: verified on desktop + narrow viewport.
      Verified 2026-10-10: headless Chromium render, 0 console errors;
      layout checked at 1280px (2-col) and 360px (1-col, no overflow).
- [x] **Selection UI** — incident selector + destination selector from
      bundled data, results placeholder, friendly empty state.
      Acceptance: selecting values updates the results area; empty state
      shows when nothing is selected.
      DoD: core-flow test in validation.md passes.
      Verified 2026-10-10: CDP-driven DOM events updated the results
      placeholder; empty state rendered on first load.
- [x] **Synthetic demo data** — `src/data/network.json` with stations,
      edges, modes, statuses, sourced durations, scenarios; labelled
      synthetic via `meta` block.
      Acceptance: loads with no network request (bundled import).
      DoD: verified in built bundle; no fetch calls in network tab.
      Verified 2026-10-10: station/edge strings present in the built
      JS bundle; selectors populated (2 scenarios, 8 stations).
- [x] **Local persistence** — scenario + destination survive refresh;
      graceful degradation when storage is unavailable.
      Acceptance: refresh keeps selection; storage pill reflects reality.
      DoD: refresh test passes.
      Verified 2026-10-10: CDP test confirmed localStorage values and
      restoration after a hard reload; degradation path covered by the
      storage wrapper's in-memory fallback (code-verified).
- [x] **Offline readiness** — no external fonts/icons/scripts/tiles;
      service worker caches shell + assets; app renders from cache.
      Acceptance: `dist/` contains no external URLs; manual
      airplane-mode reload test passes (see validation.md).
      DoD: both automated and manual checks green.
      Verified 2026-10-10: dist/ URL scan clean; SW controlled the page
      with cache routerelay-shell-v1; hard reload under
      Network.emulateNetworkConditions(offline:true) rendered the full
      app from cache.
- [x] **Specification docs** — requirements, design, tasks, validation,
      decisions, idea-patterns, README, AGENTS.md.
      Acceptance: all files exist and are consistent.
      DoD: reviewed once against the mission brief.
      Verified 2026-10-10: all eight files written and cross-checked.
- [ ] **Git baseline** — `.gitignore` correct, no secrets staged,
      meaningful baseline commit on `main`.
      Acceptance: `git status` clean; `git log` shows the commit.
      DoD: commit exists locally; push documented (not executed).

## P1 — improvements only after P0 passes

- [ ] **Route engine** — graph build, scenario-aware edge removal,
      Dijkstra with hop-cost fallback for unknown durations.
      Acceptance: for sc01, a path avoiding e02 is produced; for a
      destination made unreachable, the app says so plainly.
- [ ] **Route rendering** — ordered station list, per-edge mode and
      duration, synthetic/unknown durations marked.
- [ ] **Data hygiene** — JSON schema validation at load; clear error
      state if bundled data is malformed.
- [ ] **Challenge adaptation** — re-scope requirements/tasks to the
      announced challenge; possibly regenerate demo data.

## P2 — explicitly deferred

- [ ] Multi-leg / multimodal journeys (walking, bus interchange).
- [ ] User-reported incidents (would need a backend — out of scope).
- [ ] i18n, theming, accessibility audit beyond basics.
- [ ] Automated browser tests (Playwright) — heavy for a 2-hour event.
- [ ] Real GTFS import pipeline and data-provenance tooling.
- [ ] Background sync, push notifications, install prompt UX.
