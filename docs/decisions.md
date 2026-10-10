# RouteRelay — Architectural decisions

## D1. Web application, not Android

**Decision:** React + Vite + TypeScript PWA, not a native Android app.
**Reasons:** event is ~2 hours, solo; web needs no SDK, emulator,
device signing, or install friction; judges can open a URL (and
airplane mode works identically). Android tooling would consume
the entire budget before any feature exists.
**Revisit if:** the announced challenge explicitly requires a
native/on-device app or hardware sensors.

## D2. Core workflow must not depend on an API

**Decision:** all data is bundled JSON imported at build time;
the app has no fetch calls in its critical path.
**Reasons:** connectivity is intermittent and judges may enable
airplane mode; a demo that dies offline fails the event.
Bundling also removes CORS, auth, and server-ops work.
**Revisit if:** the challenge *requires* live data — then the
architecture gains a clearly-labelled optional sync layer, with
offline still the default.

## D3. Simulated incidents must be visibly labelled

**Decision:** a persistent DEMO MODE badge, "Data: local ·
synthetic" pill, per-scenario "simulated" status, and a footer
provenance line.
**Reasons:** presenting synthetic data as real is dishonest and
could mislead a judge or passenger; visible labels are cheap and
build trust.
**Revisit if:** real, sourced data replaces the demo dataset —
then labels must switch to the real provenance, not disappear.

## D4. No speculative ETAs or replacement transport as verified

**Decision:** durations are either sourced (`durationSource`
field) or `null`; the UI never invents journey times, bus
availability, or rideability.
**Reasons:** unverified ETAs can cause real harm (missed rides,
wrong expectations); a hackathon demo gains nothing from fake
precision.
**Revisit if:** authoritative data (official GTFS/operator feed)
is supplied — then each value carries its source and the UI
distinguishes verified vs estimated per edge.

## D5. Hand-rolled service worker over vite-plugin-pwa

**Decision:** ~50-line SW with cache-first + network fallback,
precaching only `/` and `/index.html`.
**Reasons:** fewest dependencies and failure modes; hashed assets
are cached on first load via the fetch handler, which is enough
for a small single-page app.
**Revisit if:** the app grows (many routes, large assets) — then
a precache manifest (vite-plugin-pwa) becomes worth the dependency.

## D6. localStorage with graceful degradation

**Decision:** tiny `storage` wrapper that probes availability and
falls back to an in-memory map.
**Reasons:** private mode / quota / disabled storage must never
crash the demo; session-only persistence is an acceptable降级.
(Redundancy note: "degradation" intended, mixed-language slip —
read as "acceptable degradation".)
**Revisit if:** P1 adds complex state — then consider a small
state library, but only with a concrete need.

## D7. Provisional until the challenge is announced

**Decision:** the entire product concept (journey recovery,
station graph, incident workflow) is a *candidate*, held in
`docs/idea-patterns.md` as one of six patterns.
**Reasons:** the actual challenge may match a different pattern;
keeping the starter generic (local JSON, local persistence,
offline shell) maximizes adaptability.
**Revisit:** immediately upon announcement — see the Hackathon
Start Procedure in README.md.
