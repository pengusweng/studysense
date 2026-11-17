"use client";

import { useSyncExternalStore } from "react";

const KEY = "studysense.howItWorksHidden";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    return window.sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Whether "How a session goes" is folded away. Kept for this visit only, like every other choice
 * (docs/AGENTS.md §14.7). `null` until the browser value is known, so the slot never flashes.
 */
export function useHowItWorks() {
  const hidden = useSyncExternalStore<boolean | null>(subscribe, read, () => null);

  function setHidden(next: boolean) {
    try {
      if (next) window.sessionStorage.setItem(KEY, "1");
      else window.sessionStorage.removeItem(KEY);
    } catch {
      /* not remembered; fine */
    }
    listeners.forEach((l) => l());
  }

  return { hidden, setHidden };
}
