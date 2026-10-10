# RouteRelay — Design (provisional)

## Application architecture

```
index.html                static shell, no external resources
src/main.tsx              React mount + production-only SW registration
src/App.tsx               shell: header, status pills, selectors, results placeholder
src/lib/data.ts           typed accessors over bundled JSON
src/lib/storage.ts        localStorage wrapper with in-memory fallback
src/data/network.json     synthetic demo network (bundled at build time)
public/sw.js              minimal service worker (cache-first + network fallback)
```

- **Single-page, no router.** Two panels: scenario selection and
  route-recovery results. Enough for the MVP; a router is unnecessary.
- **Data is imported, not fetched.** `import network from
  './data/network.json'` (with `resolveJsonModule`) bundles the dataset
  into the JS chunk, so loading data requires **zero** network requests.
- **State:** two React state values (scenario id, destination id),
  mirrored to localStorage. No global store needed at this size.

## Local data format

```jsonc
{
  "meta": { "title": "...", "source": "synthetic-demo-data",
            "verified": false, "simulation": true,
            "generated": "2026-10-10", "notes": "..." },
  "stations": [{ "id": "st01", "name": "...", "lines": ["BL"] }],
  "edges": [{ "id": "e01", "from": "st01", "to": "st02",
              "bidirectional": true, "mode": "metro",
              "status": "normal",
              "durationMinutes": 3, "durationSource": "synthetic-estimate" }],
  "scenarios": [{ "id": "sc01", "name": "...", "description": "...",
                  "status": "simulated", "affectedEdges": ["e02"] }]
}
```

Design points:
- Every duration carries its own `durationSource`; `null` means
  "no duration known" rather than an invented number.
- `meta.verified` and `scenario.status: "simulated"` make the
  synthetic provenance machine-readable, not just a comment.

## Station graph and connection-edge model

- Stations are nodes; edges are (usually bidirectional) segments.
- A scenario lists `affectedEdges`; a route calculation must treat
  those edges as removed (status override) when planning.
- Bidirectional edges are modelled once with `bidirectional: true`;
  directed edges would set it `false` and be traversable one way only.

## Route-calculation approach (P1, not yet built)

1. Build an adjacency list from `edges`, excluding edges whose status
   is disrupted (either natively or via the active scenario's
   `affectedEdges`).
2. Run Dijkstra (weights = `durationMinutes` when known, otherwise a
   uniform hop cost of 1 so unknown durations don't break planning).
3. Render the path as an ordered station list with per-edge mode and
   duration, and **explicitly mark** any edge whose duration is
   synthetic/unknown.
4. If no path exists, say so plainly and list the blocked segment.

## Offline behavior and local persistence

- First load must be online (to fetch the shell + register the SW);
  afterwards the app runs from the service-worker cache, including
  airplane mode.
- `public/sw.js`: install → precache `/` and `/index.html`; fetch →
  cache-first for same-origin GET, network fallback that populates the
  cache; navigation failures fall back to `/index.html`. Simple and
  stable; no background sync, no live-data caching.
- Selection state persists in localStorage under `routerelay:*` keys.
- If localStorage is unavailable (private mode, quota, disabled),
  `src/lib/storage.ts` falls back to an in-memory map: the app keeps
  working for the session and the UI shows "Storage: session-only".

## Error states and graceful degradation

- No scenario selected → friendly empty state (never a blank panel).
- Scenario selected, destination not → results area shows the scenario
  and prompts for a destination.
- Storage unavailable → session-only mode, no crash, no warning spam.
- SW registration failure → app still works online; failure is silent
  by design (logged, not surfaced).
- Unknown/stale bundled data → UI always labels data as synthetic;
  there is no path by which stale data could be mistaken for live.

## Graph route vs verified real-world alternative

**Hard distinction.** A route computed from this bundled graph is a
*demonstration of a calculation*, not a verified real-world transport
alternative. The app must never claim:

- that a computed path is currently rideable (no live status exists),
- that synthetic durations are real journey times,
- that replacement buses, feeders, or walk paths exist or are available.

Before any real-world use, the dataset would need an authoritative
source (official GTFS / operator data) and the UI would need to label
verified vs estimated segments per-edge.
