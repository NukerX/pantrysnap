/**
 * Ingredient name normalization for forgiving matching.
 * - lowercases, trims, strips punctuation
 * - strips simple plurals
 * - small alias map for common variants
 */

const ALIASES: Record<string, string> = {
  tomatoes: "tomato",
  "cherry tomato": "tomato",
  "cherry tomatoes": "tomato",
  "roma tomato": "tomato",
  "roma tomatoes": "tomato",
  "diced tomatoes": "tomato",
  "crushed tomatoes": "tomato",
  "tomato sauce": "tomato",

  potatoes: "potato",
  "sweet potato": "sweet potato",
  "sweet potatoes": "sweet potato",

  onions: "onion",
  "yellow onion": "onion",
  "white onion": "onion",
  "red onion": "onion",
  "green onion": "scallion",
  "green onions": "scallion",
  scallions: "scallion",

  "bell pepper": "bell pepper",
  "bell peppers": "bell pepper",
  "red bell pepper": "bell pepper",
  "green bell pepper": "bell pepper",

  garlic: "garlic",
  "garlic clove": "garlic",
  "garlic cloves": "garlic",

  chickpeas: "chickpea",
  "garbanzo beans": "chickpea",
  "garbanzo bean": "chickpea",

  "black beans": "black bean",

  "olive oil": "olive oil",
  "extra virgin olive oil": "olive oil",
  evoo: "olive oil",

  butter: "butter",
  "unsalted butter": "butter",
  "salted butter": "butter",

  "soy sauce": "soy sauce",
  shoyu: "soy sauce",

  cilantro: "cilantro",
  coriander: "cilantro",
  "fresh coriander": "cilantro",

  parsley: "parsley",
  "flat-leaf parsley": "parsley",

  lemons: "lemon",
  limes: "lime",

  "bread crumbs": "breadcrumbs",
  "panko bread crumbs": "panko",
  "panko breadcrumbs": "panko",

  "ground beef": "ground beef",
  beef: "beef",
  chicken: "chicken",
  "chicken breast": "chicken",
  "chicken thigh": "chicken",
  "chicken thighs": "chicken",
  "chicken breasts": "chicken",

  rice: "rice",
  "white rice": "rice",
  "brown rice": "rice",
  "jasmine rice": "rice",
  "basmati rice": "rice",

  pasta: "pasta",
  spaghetti: "pasta",
  penne: "pasta",
  fusilli: "pasta",
  rigatoni: "pasta",
  linguine: "pasta",
  fettuccine: "pasta",

  "all-purpose flour": "flour",
  "bread flour": "flour",

  egg: "eggs",
  egg_: "eggs",
};

export function normalizeIngredient(name: string): string {
  if (!name) return "";
  let s = name.toLowerCase().trim();
  // strip punctuation
  s = s.replace(/[.,;:!?()+"']/g, " ").replace(/\s+/g, " ").trim();
  if (ALIASES[s]) return ALIASES[s];
  // strip a simple trailing plural 's' if not in alias map
  if (s.endsWith("es") && !ALIASES[s]) {
    const stem = s.slice(0, -2);
    if (ALIASES[stem]) return ALIASES[stem];
  }
  if (s.endsWith("s") && !ALIASES[s]) {
    const stem = s.slice(0, -1);
    if (ALIASES[stem]) return ALIASES[stem];
    // if no alias, return the depluralized stem for a forgiving match
    if (stem.length >= 3) return stem;
  }
  return s;
}

export function ingredientsMatch(a: string, b: string): boolean {
  const na = normalizeIngredient(a);
  const nb = normalizeIngredient(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  // partial match — pantry "cherry tomato" should match recipe "tomato"
  if (na.includes(nb) || nb.includes(na)) return true;
  return false;
}
