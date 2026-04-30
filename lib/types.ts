import { z } from "zod";

// ---------- Pantry ----------
export const PantryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(0),
  unit: z.string().default(""),
  category: z.string().default("Other"),
  updatedAt: z.number(),
});
export type PantryItem = z.infer<typeof PantryItemSchema>;

// ---------- Scans ----------
export const DetectedItemSchema = z.object({
  name: z.string(),
  quantity: z.number().min(0).default(1),
  unit: z.string().default(""),
  category: z.string().default("Other"),
  confidence: z.number().min(0).max(1).default(0.8),
});
export type DetectedItem = z.infer<typeof DetectedItemSchema>;

export const ScanSchema = z.object({
  id: z.string(),
  imageDataUrl: z.string().optional(), // may be omitted to save quota
  createdAt: z.number(),
  detectedItems: z.array(DetectedItemSchema),
});
export type Scan = z.infer<typeof ScanSchema>;

// ---------- Preferences ----------
export const PreferencesSchema = z.object({
  cuisines: z.array(z.string()).default([]),
  dietary: z.array(z.string()).default([]),
  dislikedIngredients: z.array(z.string()).default([]),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

// ---------- Recipe Ratings ----------
export const RecipeRatingsSchema = z.record(z.string(), z.union([z.literal(1), z.literal(-1)]));
export type RecipeRatings = z.infer<typeof RecipeRatingsSchema>;

// ---------- Shopping ----------
export const ShoppingItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().min(0).default(1),
  unit: z.string().default(""),
  checked: z.boolean().default(false),
});
export type ShoppingItem = z.infer<typeof ShoppingItemSchema>;

// ---------- App State ----------
export const AppStateSchema = z.object({
  onboarded: z.boolean().default(false),
  theme: z.enum(["light", "dark"]).default("light"),
});
export type AppState = z.infer<typeof AppStateSchema>;

// ---------- Recipes (static dataset) ----------
export const RecipeIngredientSchema = z.object({
  name: z.string(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  optional: z.boolean().optional(),
});
export type RecipeIngredient = z.infer<typeof RecipeIngredientSchema>;

export const RecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  cuisine: z.string(),
  tags: z.array(z.string()).default([]),
  timeMinutes: z.number(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  servings: z.number().default(2),
  ingredients: z.array(RecipeIngredientSchema),
  steps: z.array(z.string()),
  emoji: z.string().default("🍽️"),
  description: z.string().optional(),
});
export type Recipe = z.infer<typeof RecipeSchema>;

// ---------- Constants ----------
export const CUISINES = [
  "Mexican",
  "Italian",
  "Indian",
  "Japanese",
  "American",
  "Mediterranean",
  "Thai",
  "Chinese",
] as const;

export const DIETARY_FLAGS = [
  "vegetarian",
  "vegan",
  "gluten-free",
  "dairy-free",
  "nut-free",
  "low-carb",
] as const;

export const CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Pantry",
  "Spices",
  "Grains",
  "Frozen",
  "Beverages",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
