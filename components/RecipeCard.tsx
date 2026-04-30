"use client";

import Link from "next/link";
import { useRatings } from "@/contexts/RatingsContext";
import type { Recipe } from "@/lib/types";

export function RecipeCard({
  recipe,
  missingCount,
  totalRequired,
}: {
  recipe: Recipe;
  missingCount: number;
  totalRequired: number;
}) {
  const { getRating, setRating } = useRatings();
  const rating = getRating(recipe.id);
  const havePct = totalRequired > 0 ? Math.round(((totalRequired - missingCount) / totalRequired) * 100) : 0;

  return (
    <Link
      href={`/recipes/${recipe.id}`}
      className="group block bg-white dark:bg-ink-900 rounded-3xl shadow-card hover:shadow-cardHover transition-shadow p-4 active:scale-[0.99]"
    >
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-3xl shrink-0">
          {recipe.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-ink-900 dark:text-ink-50 leading-tight truncate">
              {recipe.title}
            </h3>
            <div className="flex gap-1 shrink-0" onClick={(e) => e.preventDefault()}>
              <button
                type="button"
                aria-label="Thumbs up"
                onClick={(e) => {
                  e.preventDefault();
                  setRating(recipe.id, rating === 1 ? 0 : 1);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  rating === 1
                    ? "bg-brand-100 dark:bg-brand-900/60 text-brand-600 dark:text-brand-300"
                    : "text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill={rating === 1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22V11" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Thumbs down"
                onClick={(e) => {
                  e.preventDefault();
                  setRating(recipe.id, rating === -1 ? 0 : -1);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                  rating === -1
                    ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300"
                    : "text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800"
                }`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill={rating === -1 ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 15v4a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2v13" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400">
            <span className="font-medium">{recipe.cuisine}</span>
            <span>•</span>
            <span>{recipe.timeMinutes} min</span>
            <span>•</span>
            <span className="capitalize">{recipe.difficulty}</span>
          </div>
          <div className="mt-2.5">
            {missingCount === 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/40 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                Have everything
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Missing {missingCount} ({havePct}% ready)
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
