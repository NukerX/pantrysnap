"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadValue, saveValue, STORAGE_KEYS } from "@/lib/storage";
import { AppStateSchema, type AppState } from "@/lib/types";

type ThemeContextValue = {
  appState: AppState;
  hydrated: boolean;
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  setOnboarded: (v: boolean) => void;
  reset: () => void;
};

const DEFAULT: AppState = { onboarded: false, theme: "light" };

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadValue(STORAGE_KEYS.appState, AppStateSchema, DEFAULT);
    setAppState(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveValue(STORAGE_KEYS.appState, appState);
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", appState.theme === "dark");
    }
  }, [appState, hydrated]);

  const setTheme = useCallback(
    (theme: "light" | "dark") => setAppState((s) => ({ ...s, theme })),
    [],
  );

  const toggleTheme = useCallback(() => {
    setAppState((s) => ({ ...s, theme: s.theme === "dark" ? "light" : "dark" }));
  }, []);

  const setOnboarded = useCallback(
    (onboarded: boolean) => setAppState((s) => ({ ...s, onboarded })),
    [],
  );

  const reset = useCallback(() => setAppState(DEFAULT), []);

  const value = useMemo(
    () => ({ appState, hydrated, setTheme, toggleTheme, setOnboarded, reset }),
    [appState, hydrated, setTheme, toggleTheme, setOnboarded, reset],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be inside ThemeProvider");
  return ctx;
}
