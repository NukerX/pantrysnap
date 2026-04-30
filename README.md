# PantrySnap

A mobile-first PWA for tracking pantry inventory from photos and getting recipe suggestions.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS · localStorage (Zod-validated) · Service worker for offline shell.

> **No backend.** Everything lives in the browser. Mock AI detection. Local recipe dataset. Both designed to be swappable for real APIs later.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000 — the first launch goes through onboarding.

## Project structure

```
app/
  layout.tsx, providers.tsx, globals.css   # root shell + theme bootstrap
  page.tsx                                 # / → redirects to /pantry or /onboarding
  onboarding/                              # 3-step welcome flow
  (app)/                                   # authenticated-feeling app shell with bottom tab nav
    layout.tsx                             # bottom nav, redirect guard
    pantry/                                # pantry list + add/edit/delete
    scan/                                  # camera/upload + mock detection + review
    recipes/
      page.tsx                             # 3-lane suggestions (Have / Need few / Wild card)
      [id]/page.tsx                        # detail with ingredients/steps/thumbs
    shopping/                              # shopping list
    settings/                              # theme, prefs, reset
components/                                # presentational primitives
contexts/                                  # React Context providers (state + persistence)
lib/
  types.ts                                 # Zod schemas + TS types
  storage.ts                               # typed localStorage wrapper (single integration point)
  normalize.ts                             # ingredient name normalization + alias map
  match.ts                                 # recipe matching engine (3 lanes)
services/
  vision.ts                                # mock detection — REPLACE for real vision API
  recipes.ts                               # loads data/recipes.json — REPLACE for recipe API
data/
  recipes.json                             # 30 recipes across 8 cuisines
public/
  manifest.json, sw.js, favicon.svg
```

## Swapping in real APIs

### Real vision API (Google Vision, AWS Rekognition, OpenAI Vision)
Open `services/vision.ts` and replace the body of `detectItems()`:

```ts
export async function detectItems(file: File): Promise<DetectedItem[]> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch("/api/vision", { method: "POST", body: formData });
  const json = await res.json();
  return json.items;
}
```

You'll need to add a `/api/vision/route.ts` API route (Next.js App Router) that calls the real provider. Nothing else in the app changes.

### Real recipe API (Spoonacular, Edamam, custom)
Open `services/recipes.ts` and replace `loadRecipes()` to fetch from your endpoint. The matching engine, UI, and ratings logic all keep working unchanged.

### Real backend (auth + DB)
The single integration point is `lib/storage.ts`. Replace `loadValue` / `saveValue` with API calls and add a NextAuth setup. The contexts call those two functions exclusively.

## Data model

All data lives in `localStorage` under namespace `pantrysnap:v1:*`:

- `pantry` — `PantryItem[]` (id, name, quantity, unit, category, updatedAt)
- `scans` — `Scan[]` (kept slim — most recent only)
- `preferences` — `{ cuisines, dietary, dislikedIngredients }`
- `ratings` — `Record<recipeId, 1 | -1>`
- `shopping` — `ShoppingItem[]`
- `appState` — `{ onboarded, theme }`

All reads use Zod validation; schema drift falls back to defaults gracefully.

## Recipe matching

`lib/match.ts` produces three lanes from the user's pantry + preferences + ratings:

- **Have everything** — every required ingredient is in the pantry
- **Need a few** — missing 1–3 required ingredients
- **Wild card** — random selection biased toward preferred cuisines

Ingredient names normalize via `lib/normalize.ts`: lowercase + trim + small alias map (`tomatoes` ↔ `tomato`, `green onion` ↔ `scallion`, etc.). Optional ingredients don't count toward "missing".

Thumbed-down recipes are excluded from all lanes. Thumbed-up recipes float higher.

## PWA

- `public/manifest.json` — installable on iOS/Android
- `public/sw.js` — caches the app shell + recipes for offline browsing (registered only in production)
- iOS theme color and apple-web-app meta in `app/layout.tsx`

## Mascot

Currently an inline SVG component (`components/Mascot.tsx`). To swap in your own mascot image:
1. Drop the file at `public/mascot.png` (transparent PNG recommended)
2. In `Mascot.tsx`, replace the SVG body with `<img src="/mascot.png" alt="" className="w-full h-full" />`

## Notes

- localStorage caps around 5MB. Scan thumbnails are downscaled to ~256px to keep within budget.
- Service worker is registered only in production builds (`process.env.NODE_ENV === 'production'`).
- The app deliberately has no auth — single-user, single-device. Adding multi-device sync = backend integration above.
