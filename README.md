# The Pantry

A personal, local-first meal-planning app. The end goal is that the **weekly shopping list
builds itself**: pick meals, get an aisle-grouped, scaled, unit-summed list. Phases 1–3 are
done (recipe library, grocery catalogue, search/import, and a manual weekly planner); the
shopping list is next. See [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) for the full roadmap.

## Stack

- React + Vite + TypeScript (client-only SPA)
- Tailwind CSS v4
- Persistence: browser **localStorage** (key `pantry:data`) — no server, no accounts.
  This is deliberately simple for now; a real backend/sync is a later (productionise) step.

## Run locally

```bash
npm install
npm run dev
```

Open the printed URL (default http://localhost:5173). The catalogue and aisles are seeded
on first load.

Other scripts:

```bash
npm run build   # typecheck + production build
npm run lint    # eslint
npm run preview # serve the production build
```

## What you can do

- **Weekly planner** — the home page. Add recipes to each day of the week (or an unassigned
  bucket), override servings per meal, and clear the week. Deleting a recipe removes it from
  the plan automatically.
- **Recipes** — create / view / edit / delete recipes (name, description, servings,
  instructions, tags, favourite, notes, source). Search by name/tag/ingredient and filter by
  favourites or tags.
- **Catalogue-first ingredients** — every ingredient picks a grocery item (with quantity +
  unit); a new item can be **quick-added** inline without leaving the recipe.
- **Paste / import** — paste recipe text and it opens straight in the editor as a draft, with
  ingredients auto-matched to the catalogue. Unmatched ones are flagged (with their parsed
  name) so you can pick or quick-add them before saving.
- **Catalogue** — manage grocery items and their aisle + default unit.
- **Aisles** — add, rename, reorder (walk-order), and delete aisles.

All data persists in the browser and survives reloads. To reset, clear the site's
localStorage (or run `localStorage.removeItem('pantry:data')` in the dev console).

## Coming next

The shopping list (Phase 4) will generate an aisle-grouped, scaled, unit-summed checklist
from the week's plan. Later phases add a randomiser / suggestions / allergy handling, and
nutrition. See [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md).
