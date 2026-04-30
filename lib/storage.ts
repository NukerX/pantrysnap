/**
 * Typed localStorage wrapper.
 * - Namespaced keys: `pantrysnap:v1:*`
 * - SSR-safe (no-op when window is undefined)
 * - Validates with Zod on read; resets to default on parse errors
 *
 * To add a real backend later, replace the read/write internals here.
 */
import { z } from "zod";

const NAMESPACE = "pantrysnap:v1";

function key(name: string): string {
  return `${NAMESPACE}:${name}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadValue<T>(name: string, schema: z.ZodType<T>, fallback: T): T {
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
    return result.data;
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
