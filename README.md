# The Pantry

A personal, local-first meal-planning app. **Phase 1** is the recipe library + grocery
catalogue: create recipes with catalogue-backed ingredients, manage grocery items, and
edit aisles. See [`docs/PROJECT_PLAN.md`](docs/PROJECT_PLAN.md) for the full roadmap.

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

## What you can do (Phase 1)

- **Recipes** — create / view / edit / delete recipes (name, description, servings,
  instructions, tags, favourite, notes, source).
- **Catalogue-first ingredients** — every ingredient picks a grocery item (with quantity +
  unit); a new item can be **quick-added** inline without leaving the recipe.
- **Catalogue** — manage grocery items and their aisle + default unit.
- **Aisles** — add, rename, reorder (walk-order), and delete aisles.

All data persists in the browser and survives reloads. To reset, clear the site's
localStorage (or run `localStorage.removeItem('pantry:data')` in the dev console).

## Not in Phase 1

Search/filter, paste/import, weekly planner, shopping list, nutrition, and allergy
handling are later phases.
