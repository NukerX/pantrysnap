/**
 * Recipe matching engine.
 * Given a user's pantry, classifies each recipe into one of:
 *   - have_all   (missing 0)
 *   - need_few   (missing 1-3)
 *   - far        (missing 4+)
 * Excludes optional ingredients from missing-count.
 */
import type { Recipe, PantryItem, Preferences, RecipeRatings } from "./types";
import { ingredientsMatch, normalizeIngredient } from "./normalize";

export type MatchResult = {
  recipe: Recipe;
  missing: string[];
  haveCount: number;
  totalRequired: number;
};

export function matchRecipe(recipe: Recipe, pantry: PantryItem[]): MatchResult {
  const missing: string[] = [];
  let haveCount = 0;
  const required = recipe.ingredients.filter((i) => !i.optional);
  for (const ing of required) {
    const found = pantry.some((p) => ingredientsMatch(p.name, ing.name) && p.quantity > 0);
    if (found) {
      haveCount += 1;
    } else {
      missing.push(ing.name);
    }
  }
  return { recipe, missing, haveCount, totalRequired: required.length };
}

export function matchAllRecipes(recipes: Recipe[], pantry: PantryItem[]): MatchResult[] {
  return recipes.map((r) => matchRecipe(r, pantry));
}

export type LaneId = "have_all" | "need_few" | "wild_card";

export type Lanes = {
  have_all: MatchResult[];
  need_few: MatchResult[];
  wild_card: MatchResult[];
};

/**
 * Builds the three recipe lanes.
 * Honors preferences and ratings:
 *  - thumbed-down recipes are excluded from all lanes
 *  - preferred cuisines float to the top within each lane
 *  - wild_card biases toward preferred cuisines but can include any recipe
 */
export function buildLanes(
  recipes: Recipe[],
  pantry: PantryItem[],
  preferences: Preferences,
  ratings: RecipeRatings,
  options: { wildCardSize?: number; seed?: number } = {},
): Lanes {
  const { wildCardSize = 6, seed = Date.now() } = options;
  const matches = matchAllRecipes(recipes, pantry);

  const dislikedIds = new Set(
    Object.entries(ratings)
      .filter(([, v]) => v === -1)
      .map(([k]) => k),
  );
  const dislikedIngredients = preferences.dislikedIngredients.map(normalizeIngredient);

  const passes = matches.filter((m) => {
    if (dislikedIds.has(m.recipe.id)) return false;
    // exclude if recipe contains a strongly disliked ingredient
    const recipeIngs = m.recipe.ingredients.map((i) => normalizeIngredient(i.name));
    if (dislikedIngredients.some((d) => recipeIngs.includes(d))) return false;
    return true;
  });

  const cuisineRank = (cuisine: string) => {
    const idx = preferences.cuisines.indexOf(cuisine);
    return idx === -1 ? 999 : idx;
  };

  const liked = (id: string) => (ratings[id] === 1 ? -1 : 0);

  const sortByPref = (a: MatchResult, b: MatchResult) => {
    const pa = cuisineRank(a.recipe.cuisine);
    const pb = cuisineRank(b.recipe.cuisine);
    if (pa !== pb) return pa - pb;
    const la = liked(a.recipe.id);
    const lb = liked(b.recipe.id);
    if (la !== lb) return la - lb;
    if (a.missing.length !== b.missing.length) return a.missing.length - b.missing.length;
    return a.recipe.timeMinutes - b.recipe.timeMinutes;
  };

  const have_all = passes.filter((m) => m.missing.length === 0).sort(sortByPref);
  const need_few = passes
    .filter((m) => m.missing.length >= 1 && m.missing.length <= 3)
    .sort(sortByPref);

  // Wild card: random but biased toward preferred cuisines
  const wildCandidates = passes.slice();
  // Shuffle deterministically given the seed
  const rng = mulberry32(seed);
  for (let i = wildCandidates.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [wildCandidates[i], wildCandidates[j]] = [wildCandidates[j], wildCandidates[i]];
  }
  // Apply preference bias by stable-sorting preferred cuisines first
  wildCandidates.sort((a, b) => cuisineRank(a.recipe.cuisine) - cuisineRank(b.recipe.cuisine));
  const wild_card = wildCandidates.slice(0, wildCardSize);

  return { have_all, need_few, wild_card };
}

// Small deterministic PRNG
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
