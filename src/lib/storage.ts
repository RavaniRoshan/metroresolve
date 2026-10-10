const MEMORY_FALLBACK = new Map<string, string>();

export function storageAvailable(): boolean {
  try {
    const key = 'routerelay:probe';
    window.localStorage.setItem(key, '1');
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * localStorage wrapper that degrades gracefully: if storage is unavailable
 * (private mode, quota, disabled), reads return null and writes fall back to
 * an in-memory map so the app keeps working for the session.
 */
export const storage = {
  available:
    typeof window !== 'undefined' ? storageAvailable() : false,
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return MEMORY_FALLBACK.get(key) ?? null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      MEMORY_FALLBACK.set(key, value);
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      MEMORY_FALLBACK.delete(key);
    }
  },
};
