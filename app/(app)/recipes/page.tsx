"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { EmptyState } from "@/components/EmptyState";
import { RecipeCard } from "@/components/RecipeCard";
import { Chip } from "@/components/Chip";
import { Button } from "@/components/Button";
import { usePantry } from "@/contexts/PantryContext";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useRatings } from "@/contexts/RatingsContext";
import { loadRecipes } from "@/services/recipes";
import { buildLanes, type Lanes, type MatchResult } from "@/lib/match";
import type { Recipe } from "@/lib/types";

export default function RecipesPage() {
  const { items, hydrated } = usePantry();
  const { preferences, hydrated: prefsHydrated } = usePreferences();
  const { ratings, hydrated: ratingsHydrated } = useRatings();

  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState<string[]>([]);

  useEffect(() => {
    let alive = true;
    loadRecipes().then((r) => {
      if (alive) setRecipes(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  const allCuisines = useMemo(() => {
    if (!recipes) return [];
    const set = new Set(recipes.map((r) => r.cuisine));
    return Array.from(set).sort();
  }, [recipes]);

  const lanes: Lanes | null = useMemo(() => {
    if (!recipes || !hydrated || !prefsHydrated || !ratingsHydrated) return null;
    return buildLanes(recipes, items, preferences, ratings, { wildCardSize: 6 });
  }, [recipes, items, preferences, ratings, hydrated, prefsHydrated, ratingsHydrated]);

  const filterMatches = (matches: MatchResult[]): MatchResult[] => {
    const q = search.trim().toLowerCase();
    return matches.filter((m) => {
      if (cuisineFilter.length > 0 && !cuisineFilter.includes(m.recipe.cuisine)) return false;
      if (q) {
        const inTitle = m.recipe.title.toLowerCase().includes(q);
        const inIngs = m.recipe.ingredients.some((i) => i.name.toLowerCase().includes(q));
        if (!inTitle && !inIngs) return false;
      }
      return true;
    });
  };

  if (!recipes || !lanes) {
    return (
      <>
        <AppHeader title="Recipes" />
        <main className="px-4 py-12 text-center text-ink-500 dark:text-ink-400 text-sm">
          Loading…
        </main>
      </>
    );
  }

  const filteredHaveAll = filterMatches(lanes.have_all);
  const filteredNeedFew = filterMatches(lanes.need_few);
  const filteredWildCard = filterMatches(lanes.wild_card);
  const totalShown = filteredHaveAll.length + filteredNeedFew.length + filteredWildCard.length;

  return (
    <>
      <AppHeader title="Recipes" />
      <main className="px-4 py-4">
        {items.length === 0 ? (
          <EmptyState
            title="Add some pantry items first"
            message="We need to know what you have before we can suggest recipes."
            mood="thinking"
            cta={
              <Link href="/scan">
                <Button>Scan your pantry</Button>
              </Link>
            }
          />
        ) : (
          <>
            <div className="relative mb-3">
              <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="search"
                placeholder="Search recipes or ingredients…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-50 placeholder-ink-400 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 mb-3">
              {allCuisines.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  size="sm"
                  active={cuisineFilter.includes(c)}
                  onClick={() =>
                    setCuisineFilter((f) =>
                      f.includes(c) ? f.filter((x) => x !== c) : [...f, c],
                    )
                  }
                />
              ))}
            </div>

            {totalShown === 0 ? (
              <EmptyState
                title="No recipes match"
                message="Try clearing filters or scanning more pantry items."
                mood="sleepy"
              />
            ) : (
              <>
                <Lane
                  title="You have everything"
                  subtitle="Cook tonight — no shopping needed."
                  emptyMsg="Once your pantry has more, full-match recipes appear here."
                  matches={filteredHaveAll}
                />
                <Lane
                  title="Just a few items short"
                  subtitle="1–3 ingredients away."
                  emptyMsg="No close matches right now."
                  matches={filteredNeedFew}
                />
                <Lane
                  title="Wild card"
                  subtitle="Adventurous picks tailored to your taste."
                  emptyMsg="No suggestions — try thumbing up a few recipes."
                  matches={filteredWildCard}
                />
              </>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Lane({
  title,
  subtitle,
  emptyMsg,
  matches,
}: {
  title: string;
  subtitle: string;
  emptyMsg: string;
  matches: MatchResult[];
}) {
  return (
    <section className="mb-6">
      <div className="mb-3">
        <h2 className="font-bold text-ink-900 dark:text-ink-50">{title}</h2>
        <p className="text-xs text-ink-500 dark:text-ink-400">{subtitle}</p>
      </div>
      {matches.length === 0 ? (
        <p className="text-sm text-ink-400 italic px-1 py-2">{emptyMsg}</p>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {matches.map((m) => (
            <li key={m.recipe.id}>
              <RecipeCard
                recipe={m.recipe}
                missingCount={m.missing.length}
                totalRequired={m.totalRequired}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
