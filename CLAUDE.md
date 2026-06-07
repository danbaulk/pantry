# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Pantry is a **personal, local-first** meal-planning app (single author, no accounts).
The end goal is that the **weekly shopping list builds itself**: pick meals, get an
aisle-grouped, scaled, unit-summed list. Current code is **Phase 1** only: the recipe
library + grocery catalogue. The weekly planner, shopping list, search/filter, import,
nutrition, and allergy handling are later phases — see `docs/PROJECT_PLAN.md` for the
full roadmap before adding anything beyond Phase 1.

## Commands

```bash
npm run dev      # Vite dev server (http://localhost:5173)
npm run build    # tsc -b typecheck + production build — run this to verify types
npm run lint     # eslint
npm run preview  # serve the production build
```

There is **no test runner** configured. `npm run build` (typecheck) + `npm run lint` are
the verification gates.

## Stack

React 19 + Vite 6 + TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`, no config file),
React Router v7. Client-only SPA, no backend.

## Architecture

**Single source of truth is `PantryData`** (`src/types.ts`): `{ version, aisles,
groceryItems, recipes }`. The three entities form a strict dependency chain:

- `Recipe.ingredients[]` reference a `GroceryItem` by `itemId` (catalogue-first: an
  ingredient is always a quantity + unit applied to an existing grocery item).
- `GroceryItem.aisleId` references an `Aisle`.

This chain drives **referential-integrity guards on delete**: `deleteItem` refuses if any
recipe uses the item; `deleteAisle` refuses if any grocery item is in the aisle. Both
return a `DeleteResult` (`{ ok: true } | { ok: false; reason }`) instead of throwing —
callers surface `reason` to the user. Preserve this pattern for any new cross-entity delete.

**State flows through one React context.** `PantryProvider` (`src/state/PantryProvider.tsx`)
holds the entire `PantryData` in one `useState` and exposes all reads/mutations via
`PantryContextValue` (`src/state/context.ts`). Components consume it with the `usePantry()`
hook — never read/write storage or context directly. All mutations are immutable
`setData((d) => ...)` updates. `createdAt` is preserved and `updatedAt` is refreshed on
recipe edits.

**Persistence is isolated to `src/lib/storage.ts`** (localStorage key `pantry:data`).
`PantryProvider` auto-saves the whole blob on every change via an effect (skipping the
initial load). On first run or on parse/version failure, `buildSeedData()` (`src/lib/seed.ts`)
seeds starter aisles + grocery items. `PantryData.version` is `1`; `load()` rejects other
versions — bump the version and add migration logic here if the shape changes. This file
is the intended swap point for a real backend later, so keep persistence out of components.

**Aisle ordering:** aisles carry an `order` field (store walk-order). Use `sortedAisles`
from context for display; `moveAisle` reassigns contiguous `order` values on each swap.

## Conventions

- Routes live in `src/App.tsx`; the home page is the planner and unknown paths redirect to `/planner`.
- Shared Tailwind class strings (`btn`, `btnPrimary`, `input`, `card`, …) live in
  `src/components/ui.ts` — reuse these instead of re-writing class strings.
- `UNITS` (`src/lib/units.ts`) is a **suggestion list only** (datalist), not a constraint;
  free-text units are allowed.
- IDs come from `newId()` (`src/lib/ids.ts`).
- British spelling is used throughout (catalogue, favourite, aisle).
