// MetroResolve — optional local Ollama inference adapter.
//
// OFF by default. The deterministic rule-based engine (lib/nlp.ts) is the
// primary intelligence and is always available. This adapter only runs when
// explicitly enabled AND the configured model is actually installed locally
// (verified via GET /api/tags). It never contacts anything except
// localhost:11434 — no cloud service is used.
//
// On any error, timeout, or invalid response the caller MUST fall back to
// the rule-based engine without blocking the user.

export interface OllamaStatus {
  daemon: boolean;
  configuredModel: string;
  modelInstalled: boolean;
  installedModels: string[];
  error?: string;
}

export interface OllamaTriage {
  department?: string;
  urgency?: number;
  reasons?: string[];
  draft?: string;
}

const DAEMON_URL = 'http://localhost:11434';

function withTimeout(signal: AbortSignal, ms: number): { signal: AbortSignal; cancel: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const onAbort = () => controller.abort();
  signal.addEventListener('abort', onAbort);
  return { signal: controller.signal, cancel: () => { clearTimeout(timer); signal.removeEventListener('abort', onAbort); } };
}

export async function checkOllama(model: string): Promise<OllamaStatus> {
  try {
    const { signal, cancel } = withTimeout(new AbortController().signal, 3000);
    const res = await fetch(`${DAEMON_URL}/api/tags`, { signal });
    cancel();
    if (!res.ok) {
      return { daemon: true, configuredModel: model, modelInstalled: false, installedModels: [], error: `Ollama responded HTTP ${res.status}` };
    }
    const data = (await res.json()) as { models?: { name: string }[] };
    const installedModels = (data.models || []).map((m) => m.name);
    return {
      daemon: true,
      configuredModel: model,
      modelInstalled: installedModels.some((name) => name === model || name.startsWith(`${model}:`)),
      installedModels,
    };
  } catch (err) {
    return {
      daemon: false,
      configuredModel: model,
      modelInstalled: false,
      installedModels: [],
      error: err instanceof Error ? err.message : 'Cannot reach local Ollama',
    };
  }
}

const TRIAGE_PROMPT = (text: string) =>
  `Classify this metro passenger complaint. Reply with JSON ONLY, no prose:
{"department": one of "Safety" | "Cleanliness" | "Fare" | "Lifts" | "Staff Behaviour", "urgency": integer 0-100, "reasons": ["short reason strings"], "draft": "a short polite acknowledgement in the SAME language as the complaint, clearly stating it is a draft"}

Complaint: """${text}"""`;

export async function triageWithOllama(
  text: string,
  model: string,
  timeoutMs = 8000,
): Promise<OllamaTriage> {
  const { signal, cancel } = withTimeout(new AbortController().signal, timeoutMs);
  try {
    const res = await fetch(`${DAEMON_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: TRIAGE_PROMPT(text), format: 'json', stream: false }),
      signal,
    });
    if (!res.ok) {
      throw new Error(`Ollama HTTP ${res.status}`);
    }
    const data = (await res.json()) as { response?: string };
    const raw = data.response || '';
    // The model may wrap the JSON in prose; extract the first {...} block.
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model returned no JSON object');
    const parsed = JSON.parse(match[0]) as OllamaTriage;
    const triage: OllamaTriage = {};
    if (typeof parsed.department === 'string') triage.department = parsed.department;
    if (typeof parsed.urgency === 'number' && Number.isFinite(parsed.urgency)) {
      triage.urgency = Math.max(0, Math.min(100, Math.round(parsed.urgency)));
    }
    if (Array.isArray(parsed.reasons)) triage.reasons = parsed.reasons.map(String);
    if (typeof parsed.draft === 'string' && parsed.draft.trim().length > 0) triage.draft = parsed.draft;
    return triage;
  } finally {
    cancel();
  }
}
