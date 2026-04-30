"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { usePantry } from "@/contexts/PantryContext";
import { useRatings } from "@/contexts/RatingsContext";
import { useShopping } from "@/contexts/ShoppingContext";
import { loadRecipe } from "@/services/recipes";
import { matchRecipe } from "@/lib/match";
import type { Recipe } from "@/lib/types";

export default function RecipeDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { items: pantry } = usePantry();
  const { ratings, setRating } = useRatings();
  const { addMany } = useShopping();
  const { show } = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    loadRecipe(params.id).then((r) => {
      if (r) setRecipe(r);
      else setNotFound(true);
    });
  }, [params?.id]);

  const match = useMemo(
    () => (recipe ? matchRecipe(recipe, pantry) : null),
    [recipe, pantry],
  );

  if (notFound) {
    return (
      <>
        <AppHeader title="Recipe" />
        <main className="px-4 py-12 text-center">
          <p className="text-ink-500 dark:text-ink-400">Recipe not found.</p>
          <div className="mt-6">
            <Button onClick={() => router.push("/recipes")}>Back to recipes</Button>
          </div>
        </main>
      </>
    );
  }

  if (!recipe || !match) {
    return (
      <>
        <AppHeader title="Recipe" />
        <main className="px-4 py-12 text-center text-ink-500 text-sm">Loading…</main>
      </>
    );
  }

  const rating = ratings[recipe.id] ?? 0;

  const addMissingToList = () => {
    const missing = recipe.ingredients
      .filter((i) => !i.optional)
      .filter((i) => match.missing.includes(i.name));
    if (missing.length === 0) {
      show("Nothing missing — you have it all!");
      return;
    }
    addMany(
      missing.map((m) => ({ name: m.name, quantity: m.quantity ?? 1, unit: m.unit ?? "" })),
    );
    show(`Added ${missing.length} item${missing.length === 1 ? "" : "s"} to shopping list`);
  };

  return (
    <>
      <AppHeader
        title=""
        right={
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-semibold text-brand-600 dark:text-brand-400 px-2 py-1"
          >
            ← Back
          </button>
        }
      />
      <main className="px-4 pt-2 pb-4">
        <div className="bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/40 dark:to-brand-800/30 rounded-3xl p-8 flex flex-col items-center text-center mb-4">
          <div className="text-7xl mb-2">{recipe.emoji}</div>
          <div className="text-xs uppercase tracking-wider font-semibold text-brand-700 dark:text-brand-300">
            {recipe.cuisine}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-ink-900 dark:text-ink-50">
            {recipe.title}
          </h1>
          {recipe.description && (
            <p className="mt-2 text-sm text-ink-700 dark:text-ink-300 max-w-xs">
              {recipe.description}
            </p>
          )}
          <div className="mt-3 flex gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-ink-900/60 text-ink-700 dark:text-ink-200 font-medium">
              ⏱ {recipe.timeMinutes} min
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-ink-900/60 text-ink-700 dark:text-ink-200 font-medium capitalize">
              {recipe.difficulty}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/80 dark:bg-ink-900/60 text-ink-700 dark:text-ink-200 font-medium">
              {recipe.servings} servings
            </span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setRating(recipe.id, rating === 1 ? 0 : 1)}
            className={`flex-1 py-2.5 rounded-2xl font-semibold transition ${
              rating === 1
                ? "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
                : "bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 shadow-card"
            }`}
          >
            👍 Like
          </button>
          <button
            type="button"
            onClick={() => setRating(recipe.id, rating === -1 ? 0 : -1)}
            className={`flex-1 py-2.5 rounded-2xl font-semibold transition ${
              rating === -1
                ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                : "bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-300 shadow-card"
            }`}
          >
            👎 Skip
          </button>
        </div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-ink-900 dark:text-ink-50">Ingredients</h2>
            <span className="text-xs text-ink-500 dark:text-ink-400">
              {match.haveCount}/{match.totalRequired} ready
            </span>
          </div>
          <ul className="bg-white dark:bg-ink-900 rounded-2xl shadow-card divide-y divide-ink-100 dark:divide-ink-800">
            {recipe.ingredients.map((ing, i) => {
              const isMissing = match.missing.includes(ing.name);
              return (
                <li key={i} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      ing.optional
                        ? "bg-ink-100 dark:bg-ink-800 text-ink-400"
                        : isMissing
                          ? "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300"
                          : "bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300"
                    }`}
                  >
                    {ing.optional ? "○" : isMissing ? "!" : "✓"}
                  </span>
                  <div className="flex-1">
                    <div
                      className={`font-medium ${
                        ing.optional
                          ? "text-ink-500 dark:text-ink-400"
                          : "text-ink-900 dark:text-ink-50"
                      }`}
                    >
                      {ing.name}
                      {ing.optional && (
                        <span className="text-xs text-ink-400 ml-1.5 font-normal">
                          optional
                        </span>
                      )}
                    </div>
                    {(ing.quantity || ing.unit) && (
                      <div className="text-xs text-ink-500 dark:text-ink-400">
                        {ing.quantity ?? ""}
                        {ing.unit ? ` ${ing.unit}` : ""}
                      </div>
                    )}
                  </div>
                  {!ing.optional && isMissing && (
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                      Need
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
          {match.missing.length > 0 && (
            <div className="mt-3">
              <Button fullWidth variant="secondary" onClick={addMissingToList}>
                Add {match.missing.length} missing item
                {match.missing.length === 1 ? "" : "s"} to shopping list
              </Button>
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="font-bold text-ink-900 dark:text-ink-50 mb-3">Steps</h2>
          <ol className="bg-white dark:bg-ink-900 rounded-2xl shadow-card divide-y divide-ink-100 dark:divide-ink-800">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-3 px-4 py-3">
                <span className="w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-ink-800 dark:text-ink-200 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-6 bg-white dark:bg-ink-900 rounded-2xl shadow-card p-4">
          <h2 className="font-bold text-ink-900 dark:text-ink-50 mb-2">Nutrition</h2>
          <p className="text-xs text-ink-500 dark:text-ink-400">
            Nutrition data placeholder — wire up a real API later.
          </p>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {[
              { label: "Calories", value: "—" },
              { label: "Protein", value: "—" },
              { label: "Carbs", value: "—" },
              { label: "Fat", value: "—" },
            ].map((n) => (
              <div key={n.label} className="text-center bg-ink-50 dark:bg-ink-800 rounded-xl py-2">
                <div className="text-sm font-bold text-ink-900 dark:text-ink-50">{n.value}</div>
                <div className="text-[10px] uppercase text-ink-500 dark:text-ink-400 tracking-wider">
                  {n.label}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
