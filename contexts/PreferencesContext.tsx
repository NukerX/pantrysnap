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
import { PreferencesSchema, type Preferences } from "@/lib/types";

type PreferencesContextValue = {
  preferences: Preferences;
  hydrated: boolean;
  setCuisines: (cuisines: string[]) => void;
  setDietary: (dietary: string[]) => void;
  setDislikedIngredients: (items: string[]) => void;
  toggleCuisine: (c: string) => void;
  toggleDietary: (d: string) => void;
  reset: () => void;
};

const DEFAULT: Preferences = { cuisines: [], dietary: [], dislikedIngredients: [] };

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadValue(STORAGE_KEYS.preferences, PreferencesSchema, DEFAULT);
    setPreferences(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveValue(STORAGE_KEYS.preferences, preferences);
  }, [preferences, hydrated]);

  const setCuisines = useCallback(
    (cuisines: string[]) => setPreferences((p) => ({ ...p, cuisines })),
    [],
  );

  const setDietary = useCallback(
    (dietary: string[]) => setPreferences((p) => ({ ...p, dietary })),
    [],
  );

  const setDislikedIngredients = useCallback(
    (dislikedIngredients: string[]) =>
      setPreferences((p) => ({ ...p, dislikedIngredients })),
    [],
  );

  const toggleCuisine = useCallback((c: string) => {
    setPreferences((p) => ({
      ...p,
      cuisines: p.cuisines.includes(c)
        ? p.cuisines.filter((x) => x !== c)
        : [...p.cuisines, c],
    }));
  }, []);

  const toggleDietary = useCallback((d: string) => {
    setPreferences((p) => ({
      ...p,
      dietary: p.dietary.includes(d) ? p.dietary.filter((x) => x !== d) : [...p.dietary, d],
    }));
  }, []);

  const reset = useCallback(() => setPreferences(DEFAULT), []);

  const value = useMemo(
    () => ({
      preferences,
      hydrated,
      setCuisines,
      setDietary,
      setDislikedIngredients,
      toggleCuisine,
      toggleDietary,
      reset,
    }),
    [preferences, hydrated, setCuisines, setDietary, setDislikedIngredients, toggleCuisine, toggleDietary, reset],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be inside PreferencesProvider");
  return ctx;
}
