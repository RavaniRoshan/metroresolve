// MetroResolve — sync adapter.
// Pushes locally-created/updated cases to a configurable HTTP endpoint.
//
// Guarantees:
// - A case is marked "synced" ONLY after the server acknowledges it (2xx).
// - Retries use an Idempotency-Key (the case id) so retries never create
//   duplicate records — the endpoint must deduplicate on that key.
// - 4xx (except 429) is a permanent failure: no blind retry.
// - Network errors, 429 and 5xx are retried with backoff.
// - If no endpoint is configured, records are retained locally and can be
//   exported as JSON. Nothing is ever claimed as synced.

export interface SyncConfig {
  endpoint: string | null;
  timeoutMs: number;
  maxAttempts: number;
}

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  endpoint: null,
  timeoutMs: 8000,
  maxAttempts: 3,
};

export interface SyncOutcome {
  caseId: string;
  status: 'synced' | 'failed';
  attempts: number;
  acknowledgedAt?: string;
  error?: string;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

import type { CaseRecord } from './cases';

export async function syncCase(
  record: CaseRecord,
  config: SyncConfig,
): Promise<SyncOutcome> {
  if (!config.endpoint) {
    return {
      caseId: record.id,
      status: 'failed',
      attempts: 0,
      error: 'No sync endpoint configured — record retained locally',
    };
  }

  let attempts = 0;
  let lastError = 'unknown error';

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    attempts = attempt;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs);
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': record.id,
        },
        body: JSON.stringify({ ...record, idempotencyKey: record.id }),
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (response.ok) {
        return {
          caseId: record.id,
          status: 'synced',
          attempts,
          acknowledgedAt: new Date().toISOString(),
        };
      }

      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        // Server rejected the payload — retrying identical data cannot help.
        return {
          caseId: record.id,
          status: 'failed',
          attempts,
          error: `Server rejected the case (HTTP ${response.status})`,
        };
      }

      lastError = `HTTP ${response.status}`;
    } catch (err) {
      clearTimeout(timer);
      lastError =
        err instanceof Error && err.name === 'AbortError'
          ? `Timed out after ${config.timeoutMs}ms`
          : `Network error: ${err instanceof Error ? err.message : 'offline'}`;
    }

    if (attempt < config.maxAttempts) {
      await delay(500 * attempt);
    }
  }

  return {
    caseId: record.id,
    status: 'failed',
    attempts,
    error: `Failed after ${attempts} attempt(s): ${lastError}`,
  };
}
