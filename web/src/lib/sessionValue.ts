import { useSyncExternalStore } from "react";

/**
 * A small value kept in sessionStorage for this visit only and shared by every feature that reads it.
 * Persistence is undecided (docs/AGENTS.md §14.7), so nothing outlives the tab, and when storage is blocked the
 * value still works in memory for the current page.
 */
export function createSessionValue<T>(key: string, fallback: T, parse: (raw: unknown) => T | null) {
  const listeners = new Set<() => void>();
  let memory: T | null = null;
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  function read(): T {
    if (memory !== null) return memory;
    let raw: string | null = null;
    try {
      raw = window.sessionStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    try {
      cachedValue = (raw && parse(JSON.parse(raw))) || fallback;
    } catch {
      cachedValue = fallback;
    }
    return cachedValue;
  }

  function write(value: T) {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      memory = null;
    } catch {
      memory = value;
    }
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useValue(): [T, (value: T) => void] {
    const value = useSyncExternalStore(subscribe, read, () => fallback);
    return [value, write];
  }

  /** Like useValue, but null until the browser's value is known, for screens that must not flash a default. */
  function useKnownValue(): T | null {
    return useSyncExternalStore<T | null>(subscribe, read, () => null);
  }

  return { useValue, useKnownValue, write };
}
