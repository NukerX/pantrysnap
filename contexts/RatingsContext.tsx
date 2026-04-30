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
import { RecipeRatingsSchema, type RecipeRatings } from "@/lib/types";

type RatingsContextValue = {
  ratings: RecipeRatings;
  hydrated: boolean;
  setRating: (recipeId: string, rating: 1 | -1 | 0) => void;
  getRating: (recipeId: string) => 1 | -1 | 0;
  reset: () => void;
};

const RatingsContext = createContext<RatingsContextValue | null>(null);

export function RatingsProvider({ children }: { children: ReactNode }) {
  const [ratings, setRatings] = useState<RecipeRatings>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadValue(STORAGE_KEYS.ratings, RecipeRatingsSchema, {});
    setRatings(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveValue(STORAGE_KEYS.ratings, ratings);
  }, [ratings, hydrated]);

  const setRating = useCallback((recipeId: string, rating: 1 | -1 | 0) => {
    setRatings((prev) => {
      const next = { ...prev };
      if (rating === 0) {
        delete next[recipeId];
      } else {
        next[recipeId] = rating;
      }
      return next;
    });
  }, []);

  const getRating = useCallback(
    (recipeId: string): 1 | -1 | 0 => ratings[recipeId] ?? 0,
    [ratings],
  );

  const reset = useCallback(() => setRatings({}), []);

  const value = useMemo(
    () => ({ ratings, hydrated, setRating, getRating, reset }),
    [ratings, hydrated, setRating, getRating, reset],
  );

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) throw new Error("useRatings must be inside RatingsProvider");
  return ctx;
}
