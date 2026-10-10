import network from '../data/network.json';

export interface Station {
  id: string;
  name: string;
  lines: string[];
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  bidirectional: boolean;
  mode: string;
  status: string;
  durationMinutes: number | null;
  durationSource: string | null;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  status: string;
  affectedEdges: string[];
}

export interface NetworkMeta {
  title: string;
  source: string;
  verified: boolean;
  simulation: boolean;
  generated: string;
  notes: string;
}

export interface NetworkData {
  meta: NetworkMeta;
  stations: Station[];
  edges: Edge[];
  scenarios: Scenario[];
}

const data = network as unknown as NetworkData;

export function getMeta(): NetworkMeta {
  return data.meta;
}

export function getStations(): Station[] {
  return data.stations;
}

export function getStation(id: string): Station | undefined {
  return data.stations.find((s) => s.id === id);
}

export function getEdges(): Edge[] {
  return data.edges;
}

export function getScenarios(): Scenario[] {
  return data.scenarios;
}

export function getScenario(id: string): Scenario | undefined {
  return data.scenarios.find((s) => s.id === id);
}
