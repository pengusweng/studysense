import { createSessionValue } from "./sessionValue";

/**
 * A one-shot message carried across a navigation, for a confirmation that happened on the page just left.
 * The next screen reads it once and clears it, so it never comes back on reload.
 */
const store = createSessionValue<string>("studysense.flash", "", (raw) => (typeof raw === "string" ? raw : null));

export function setFlash(message: string) {
  store.write(message);
}

/** Returns the waiting message, if any, and clears it. */
export function takeFlash(): string {
  const message = store.read();
  if (message) store.write("");
  return message;
}
