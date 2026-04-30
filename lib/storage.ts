/**
 * Typed localStorage wrapper.
 * - Namespaced keys: `pantrysnap:v1:*`
 * - SSR-safe (no-op when window is undefined)
 * - Validates with Zod on read; resets to default on parse errors
 *
 * To add a real backend later, replace the read/write internals here.
 */
import type { ZodTypeAny } from "zod";

const NAMESPACE = "pantrysnap:v1";

function key(name: string): string {
  return `${NAMESPACE}:${name}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Schemas with `.default()` produce asymmetric input/output types in Zod, so we
 * accept any ZodTypeAny here and trust the caller's `T` matches the schema's output.
 */
export function loadValue<T>(name: string, schema: ZodTypeAny, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key(name));
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      console.warn(`[storage] schema mismatch on "${name}"; resetting`, result.error);
      return fallback;
    }
    return result.data as T;
  } catch (err) {
    console.warn(`[storage] failed to read "${name}"`, err);
    return fallback;
  }
}

export function saveValue<T>(name: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key(name), JSON.stringify(value));
  } catch (err) {
    console.warn(`[storage] failed to write "${name}"`, err);
  }
}

export function clearAll(): void {
  if (!isBrowser()) return;
  const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(NAMESPACE));
  keys.forEach((k) => window.localStorage.removeItem(k));
}

export const STORAGE_KEYS = {
  pantry: "pantry",
  scans: "scans",
  preferences: "preferences",
  ratings: "ratings",
  shopping: "shopping",
  appState: "appState",
} as const;
