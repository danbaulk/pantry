# The Pantry

A personal, local-first meal-planning app. Pick your meals for the week and the **shopping
list builds itself**: an aisle-grouped, scaled, unit-summed list combined across recipes.
No accounts, no server — all data lives in your browser.

## Stack

- React 19 + Vite 6 + TypeScript (client-only SPA)
- Tailwind CSS v4
- React Router v7
- Persistence: browser **localStorage** (key `pantry:data`) — no backend, no accounts.

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). The aisles and grocery catalogue are
seeded on first load.

Other scripts:

```bash
npm run build   # typecheck + production build
npm run lint    # eslint
npm run preview # serve the production build
```

## What you can do

- **Weekly planner** — the home page. A suggestion strip offers random allergy-safe recipes;
  drag one onto a day to plan it, drag planned meals between days (or the unassigned bucket)
  to rearrange, and override servings per meal. Flagged recipes show an allergen badge on
  their tiles. Deleting a recipe removes it from the plan automatically.
- **Recipes** — create / view / edit / delete recipes (name, description, servings,
  instructions, tags, favourite, notes, source). Search by name / tag / ingredient and filter
  by favourites or tags.
- **Catalogue-first ingredients** — every ingredient picks a grocery item (with quantity +
  unit); a new item can be **quick-added** inline without leaving the recipe.
- **Paste / import** — paste recipe text and it opens straight in the editor as a draft, with
  ingredients auto-matched to the catalogue. Unmatched ones are flagged (with their parsed
  name) so you can pick or quick-add them before saving.
- **Supermarket** — aisles and the grocery catalogue in one place. Drag-reorder aisles into
  walk-order; click an aisle to rename / delete it and manage its items (add, edit, delete,
  or mark **Avoid** for allergies). **Supermarket profiles** let you keep a separate aisle
  walk-order per store, switched app-wide from a tab strip.
- **Shopping list** — derived live from the week's plan: combined across recipes, scaled to
  each meal's servings, summed per unit, and grouped by aisle in walk-order. An **"Already
  have"** column lets you reconcile what you own so it drops off the buy list, and tick lines
  off as you shop.
- **Allergy-aware** — mark grocery items "Avoid" and any recipe using them is flagged and
  kept out of the randomiser and suggestions.

All data persists in the browser and survives reloads. To reset, clear the site's
localStorage (or run `localStorage.removeItem('pantry:data')` in the dev console).
