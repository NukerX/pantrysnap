/**
 * Recipes service.
 * Reads from a static local JSON dataset.
 *
 * To plug in a real recipe API later, replace the body of `loadRecipes`
 * with a fetch call. Keep the return type as `Recipe[]`.
 */
import recipesData from "@/data/recipes.json";
import { RecipeSchema, type Recipe } from "@/lib/types";

let cache: Recipe[] | null = null;

export async function loadRecipes(): Promise<Recipe[]> {
  if (cache) return cache;
  const parsed = (recipesData as unknown[]).map((r) => RecipeSchema.parse(r));
  cache = parsed;
  return parsed;
}

export async function loadRecipe(id: string): Promise<Recipe | null> {
  const all = await loadRecipes();
  return all.find((r) => r.id === id) ?? null;
}
