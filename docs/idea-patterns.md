# Idea patterns — organizer example areas

The organizers listed six example challenge areas. The starter
app is **generic** (local JSON + local persistence + offline
shell) so it can adopt any of them quickly. Do not implement all
six; pick the closest match when the real challenge is announced
—or discard these patterns entirely if the challenge differs.

## Pattern 1 — Metro Operations: offline fault logger

- **Problem:** staff/passengers log faults (signal, door, track)
  with timestamp, location, severity; the log persists offline.
- **Minimum viable workflow:** pick station → pick fault type →
  add note → submit → appears in local list; count shown.
- **Required local data:** station list, fault-type taxonomy,
  severity scale.
- **Major assumptions:** no backend; "logging" means local record
  (export/share later); no live propagation to operators.
- **Acceptance tests:** M1 render; log entry survives refresh;
  list renders newest-first; works in airplane mode after cache.

## Pattern 2 — Metro Operations: coach-crowding guide

- **Problem:** riders see which coach/zone is typically crowded
  so they can spread out.
- **Minimum viable workflow:** pick line + time band → view
  per-coach crowding level (low/medium/high) → guidance text.
- **Required local data:** line → coach count, typical crowding
  matrix by time band.
- **Major assumptions:** crowding values are *typical* (synthetic
  unless sourced), not live; guidance is advisory.
- **Acceptance tests:** every combination renders a level; levels
  are labelled "typical, not live"; data loads offline.

## Pattern 3 — Metro Operations: delay propagation simulator

- **Problem:** model how an incident on one segment delays
  downstream stations/lines.
- **Minimum viable workflow:** pick incident segment + start time
  → run deterministic simulation on bundled graph → show affected
  edges/stations and per-edge delay estimates.
- **Required local data:** station graph, edge travel times,
  transfer edges, a simple propagation rule (documented).
- **Major assumptions:** simulation is illustrative; delays are
  computed, not observed; rule must be stated in UI.
- **Acceptance tests:** incident propagates along connected edges;
  output labelled "simulation"; re-run is deterministic.

## Pattern 4 — City Public Transport: last-mile station-to-destination

- **Problem:** from a given station, suggest how to reach a
  nearby destination (walk / cycle / ride-hail options).
- **Minimum viable workflow:** pick station → pick destination
  → show estimated walking time + named nearby places.
- **Required local data:** station → nearby-places list with
  walking minutes (synthetic estimates).
- **Major assumptions:** no maps/GPS; distances are estimates;
  no real-time availability of ride-hail.
- **Acceptance tests:** every station has destinations; times
  labelled estimated; works offline.

## Pattern 5 — City Public Transport: bus connection feasibility

- **Problem:** given a metro disruption, is a bus connection
  feasible between two points?
- **Minimum viable workflow:** pick origin station + destination
  station → view candidate bus links (if any in data) with
  frequency/walk time → feasibility verdict (yes/limited/no).
- **Required local data:** station → bus-stop links, route names,
  typical frequency, walk minutes.
- **Major assumptions:** bus data is static/typical; "feasible"
  is computed from static data, not live availability; must never
  claim a bus is currently running.
- **Acceptance tests:** verdict logic is transparent; "no data"
  case renders honestly; offline-capable.

## Pattern 6 — City Public Transport: offline journey card

- **Problem:** a saved, offline-readable journey card: route,
  steps, fares, contingency notes for the whole trip.
- **Minimum viable workflow:** build a journey (segments) →
  save as a card → view it offline → share/export as text.
- **Required local data:** the journey segments themselves
  (user-entered or computed), plus optional fare table.
- **Major assumptions:** fares, if shown, are a static table
  (synthetic unless sourced); card is a record, not a ticket.
- **Acceptance tests:** card survives refresh + airplane mode;
  export produces readable plain text; fares labelled with source.

## Decision guide — challenge keywords → pattern

| Keywords in the announcement | Closest pattern |
|------------------------------|-----------------|
| fault, issue, report, log, incident, defect | 1 — fault logger |
| crowd, crowding, occupancy, load, coach, capacity | 2 — crowding guide |
| delay, propagation, knock-on, ripple, simulate, impact | 3 — delay propagation |
| last-mile, station-to-destination, directions, nearby, walk | 4 — last-mile |
| bus, connection, feasibility, feeder, interchange | 5 — bus connection |
| journey card, offline card, itinerary, ticket, saved trip | 6 — journey card |
| none of the above | closest pattern as a starting point, or a new one — re-scope docs first |

When the challenge is announced: read it for the intended user
and operational problem → map to a pattern → update
requirements/design/tasks/validation → build **one** complete
P0 workflow → add secondary features only after the core passes.
