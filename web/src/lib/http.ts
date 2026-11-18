/** The StudySense API client (api/README.md). */
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** A response the API answered with an error status, so callers can tell "not found" apart from "unreachable". */
export class HttpError extends Error {
  constructor(readonly status: number) {
    super(`Request failed: ${status}`);
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new HttpError(res.status);
  return (res.status === 204 ? undefined : await res.json()) as T;
}
