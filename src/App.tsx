import { useEffect, useMemo, useState } from 'react';
import { getMeta, getScenarios, getStations } from './lib/data';
import { storage } from './lib/storage';

const SCENARIO_KEY = 'routerelay:scenario';
const DESTINATION_KEY = 'routerelay:destination';

export default function App() {
  const meta = useMemo(() => getMeta(), []);
  const scenarios = useMemo(() => getScenarios(), []);
  const stations = useMemo(() => getStations(), []);

  const [scenarioId, setScenarioId] = useState<string>(() =>
    storage.get(SCENARIO_KEY) ?? '',
  );
  const [destinationId, setDestinationId] = useState<string>(() =>
    storage.get(DESTINATION_KEY) ?? '',
  );

  useEffect(() => {
    if (scenarioId) storage.set(SCENARIO_KEY, scenarioId);
    else storage.remove(SCENARIO_KEY);
  }, [scenarioId]);

  useEffect(() => {
    if (destinationId) storage.set(DESTINATION_KEY, destinationId);
    else storage.remove(DESTINATION_KEY);
  }, [destinationId]);

  const scenario = scenarios.find((s) => s.id === scenarioId);
  const destination = stations.find((s) => s.id === destinationId);

  return (
    <div className="shell">
      <header className="header">
        <div>
          <h1>RouteRelay</h1>
          <p className="tagline">Offline-first metro journey recovery</p>
        </div>
        <span className="badge demo">DEMO MODE</span>
      </header>

      <div className="statusbar" role="status">
        <span className="pill">Data: local · synthetic</span>
        <span className="pill warn">Live data: not connected</span>
        <span className="pill">
          Storage: {storage.available ? 'local (persistent)' : 'session-only'}
        </span>
      </div>

      <main className="grid">
        <section className="panel" aria-label="Scenario selection">
          <h2>1 · Affected segment (incident)</h2>
          <label htmlFor="scenario">Incident (simulated)</label>
          <select
            id="scenario"
            value={scenarioId}
            onChange={(e) => setScenarioId(e.target.value)}
          >
            <option value="">— Select an incident —</option>
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {scenario && <p className="hint">{scenario.description}</p>}

          <h2>2 · Destination</h2>
          <label htmlFor="destination">Destination station</label>
          <select
            id="destination"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
          >
            <option value="">— Select a destination —</option>
            {stations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </section>

        <section className="panel results" aria-label="Route recovery results">
          <h2>Route recovery</h2>
          {!scenario && !destination ? (
            <div className="empty">
              <p>
                <strong>No scenario selected yet.</strong>
              </p>
              <p>
                Choose a simulated incident and a destination to see
                alternative-route options here.
              </p>
            </div>
          ) : (
            <div className="placeholder">
              <p>
                Scenario: <strong>{scenario?.name ?? '—'}</strong>
              </p>
              <p>
                Destination: <strong>{destination?.name ?? '—'}</strong>
              </p>
              <p className="hint">
                Placeholder — the route-calculation engine is not implemented
                yet (see docs/tasks.md, P1). Any route shown later in this
                area is unverified demo data, not a real-world transport
                alternative.
              </p>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <p>
          All network data on this screen is <strong>synthetic demo data</strong>{' '}
          (source: {meta.source}, generated {meta.generated}). Not live, not
          verified. {meta.notes}
        </p>
      </footer>
    </div>
  );
}
