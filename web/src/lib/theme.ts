"use client";

import { useSyncExternalStore } from "react";
import { THEME_KEY } from "./themeScript";

/**
 * Light or dark. An explicit choice is stored on this device and set as html[data-theme]; with no choice,
 * the system setting decides (globals.css follows prefers-color-scheme), and keeps following it live.
 */
export type Theme = "light" | "dark";

const CHANGE = "studysense:theme";
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

function current(): Theme {
  const chosen = document.documentElement.dataset.theme;
  if (chosen === "light" || chosen === "dark") return chosen;
  return matchMedia(SYSTEM_DARK).matches ? "dark" : "light";
}

function subscribe(onChange: () => void) {
  const system = matchMedia(SYSTEM_DARK);
  system.addEventListener("change", onChange);
  window.addEventListener(CHANGE, onChange);
  return () => {
    system.removeEventListener("change", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

/** The theme in effect, or null before hydration (the server cannot know it). */
export function useTheme(): Theme | null {
  return useSyncExternalStore(subscribe, current, () => null);
}

export function setTheme(next: Theme) {
  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Storage blocked: the choice still holds for this page.
    }
    window.dispatchEvent(new Event(CHANGE));
  };

  // Cross-fade the whole page where the browser can; otherwise swap at once.
  const calm = document.documentElement.dataset.motion !== "on";
  if (calm || !("startViewTransition" in document)) apply();
  else document.startViewTransition(apply);
}
