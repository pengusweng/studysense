import { createSessionValue } from "./sessionValue";

/**
 * A random id for this visit, so logged events from one visit can be grouped. It names no one and is replaced
 * when the visit is cleared.
 */
function newId(): string {
  return crypto.randomUUID();
}

const store = createSessionValue<string>("studysense.visitId", "", (raw) =>
  typeof raw === "string" && /^[0-9a-f-]{36}$/i.test(raw) ? raw : null,
);

export function readVisitId(): string {
  const current = store.read();
  if (current) return current;
  const id = newId();
  store.write(id);
  return id;
}

export const rotateVisitId = () => store.write(newId());
