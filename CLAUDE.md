# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Pantry is a **personal, local-first** meal-planning app (single author, no accounts).
The end goal is that the **weekly shopping list builds itself**: pick meals, get an
aisle-grouped, scaled, unit-summed list. **All six phases are done**: the recipe library +
grocery catalogue (Phase 1), recipe search/tag filtering + paste-import (Phase 2), the
manual weekly planner with per-meal serving overrides (Phase 3), the **shopping list**
that derives an aisle-grouped, scaled, unit-summed checklist from the plan with ad-hoc
items, "already have", and tick-off (Phase 4), the **randomiser + suggestions + allergy
settings** (Phase 5), and a round of **UX refinements** (Phase 6: the catalogue + aisle
pages merged into one **Supermarket** section, allergen "Avoid" toggles on its aisle
pages, drag-and-drop aisle reordering, planner polish). A nutrition-tracking Phase 6 was
built, trialled, and **rejected** — see the decisions log. See `docs/PROJECT_PLAN.md`
for the full roadmap and decisions log before starting new work.

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
groceryItems, recipes, plan }`. The three catalogue entities form a strict dependency chain:

- `Recipe.ingredients[]` reference a `GroceryItem` by `itemId` (catalogue-first: an
  ingredient is always a quantity + unit applied to an existing grocery item).
- `GroceryItem.aisleId` references an `Aisle`.

This chain drives **referential-integrity guards on delete**: `deleteItem` refuses if any
recipe uses the item; `deleteAisle` refuses if any grocery item is in the aisle. Both
return a `DeleteResult` (`{ ok: true } | { ok: false; reason }`) instead of throwing —
callers surface `reason` to the user. A successful `deleteItem` also **cascades** the id out
of `settings.excludedItemIds` (the allergy list never holds a dangling item). Preserve this
pattern for any new cross-entity delete.

**The weekly plan** is `PantryData.plan` (`WeeklyPlan = { meals: PlannedMeal[] }`). A
`PlannedMeal` references a recipe by `recipeId`, with an optional `day` (undefined =
unassigned bucket) and an optional `servings` override (undefined = recipe default).
Mutations live on the context: `addMeal`, `removeMeal`, `setMealDay`, `setMealServings`.
`deleteRecipe` **cascades** — it drops any planned meals for that recipe so the
plan never holds a dangling `recipeId`; the planner also defensively skips meals whose recipe
no longer resolves. There is no integrity guard blocking recipe deletion (unlike items/aisles).

**The shopping list is fully derived from the plan; the user only stores reconciliation
input.** `PantryData.shopping` is `{ have }` — a `Record<lineKey, number>` of how much of
each requirement you already own (`lineKey` is `` `${itemId}::${unit}` ``).
`buildShoppingList()` (`src/lib/shoppingList.ts`) computes the buy list live: it scales each
meal's ingredients by `(servings ?? recipe.servings) / recipe.servings` and sums per
`(itemId, unit)` (`buildRequirements`), then subtracts `have`, **dropping lines that net to
≤ 0**. Mismatched units stay separate (no conversion). Grouping mirrors `buildItemsByAisle`
(with an "Other" fallback for an unresolvable item). The page (`ShoppingList.tsx`) is a
**two-column layout**: the aisle-grouped buy list (plain text, no checkboxes), and an
**"Already have" column** with one row per recipe requirement (`buildHaveRows`, recipe items
only — never the whole catalogue). Each row has −/+ steppers plus a ✓ that **maxes `have` to
`need`** (the way to "tick off" a line — it nets to zero and leaves the buy list); − brings
it back. Context mutations: `setHave(lineKey, qty)` (0 deletes the key) and `clearHave()`
(the "Reset already have" button). (A "Want extra" section is parked.)

**Randomiser, suggestions & allergies are pure logic in `src/lib/suggest.ts`.** A recipe is
**flagged** (`recipeHasExcludedItem`) when any ingredient's `itemId` is in
`PantryData.settings.excludedItemIds` (the only stored Phase-5 state — grocery items to
avoid, managed per-item via the "Avoid" toggle on the **supermarket's aisle pages** /
`toggleExcludedItem`; there is no Settings page).
The context exposes the derived **`excludedItemIds: Set<ID>`** (like `sortedAisles`) —
consume that rather than re-deriving a Set from `data.settings`. Flagged recipes show a red
**`<AllergyBadge>`** in the library list, detail, and on their planner meal tiles, and are
**hard-excluded** from the
suggestion strip and suggestions (one private `candidateRecipes` predicate in `suggest.ts`
defines "suggestible") — but still appear, badged, in the manual `AddRecipeModal` list. The
planner's randomiser is a **`<SuggestionStrip>`** at the top of the page: three random
allergy-safe recipes not in the plan (`pickRandomSuggestions`, uniformly random —
favourites get no priority — with `avoidIds` so **Shuffle** visibly re-rolls). Strip state
is **ephemeral** — `WeeklyPlanner` holds the IDs in component state (nothing persisted) and
heals them via the pure `refillSuggestions` (drops suggestions that get
planned/deleted/flagged, tops back up, and returns the input array unchanged so the state
setter can bail out). Planning is **drag-and-drop** (native HTML5, helpers in
`src/lib/dnd.ts` — one JSON payload under a custom MIME type, a three-way
`recipe | meal | aisle` union also used for aisle reordering): drag a suggestion onto a
`DayRow` to `addMeal` (its slot refills), drag a `MealCard` between days (or the Unassigned
row) to `setMealDay`. Drop handlers check the payload `type` explicitly so a grown union
can't misroute. **Suggestions** (`suggestedRecipes`, shown in `AddRecipeModal`) are
allergy-safe recipes **not already in the plan** (recency is plan-as-proxy — there is no
cook history), favourites first. `filterRecipes` stays allergy-agnostic; allergy logic
lives only in `suggest.ts`.

**State flows through one React context.** `PantryProvider` (`src/state/PantryProvider.tsx`)
holds the entire `PantryData` in one `useState` and exposes all reads/mutations via
`PantryContextValue` (`src/state/context.ts`). Components consume it with the `usePantry()`
hook — never read/write storage or context directly. All mutations are immutable
`setData((d) => ...)` updates. `createdAt` is preserved and `updatedAt` is refreshed on
recipe edits.

**Persistence is isolated to `src/lib/storage.ts`** (localStorage key `pantry:data`).
`PantryProvider` auto-saves the whole blob on every change via an effect (skipping the
initial load). On first run or on a parse failure, `buildSeedData()` (`src/lib/seed.ts`)
seeds starter aisles + grocery items. `PantryData.version` is currently `4`; on load,
`migrate()` upgrades older blobs one step at a time via `step()` (v1→v2 backfilled the empty
`plan`, v2→v3 the empty `shopping` list, v3→v4 the empty `settings`) so an old blob chains
all the way up; an unknown
version throws → re-seed. When the shape changes, **bump `CURRENT_VERSION` and add a new
`case` to `step()`** that backfills the new fields. This file is the intended swap point
for a real backend later, so keep persistence out of components.

**The supermarket section owns aisles and the grocery catalogue.** `Supermarket`
(`/supermarket`) lists every aisle in walk-order; each row **clicks through** to
`AisleDetail` (`/supermarket/:aisleId`) where the aisle is renamed/deleted (delete still
guarded) and its items are added (aisle implied by the page), edited (the edit row keeps
an aisle select, so saving can move an item to another aisle — it leaves the page),
avoided, or deleted. `/catalogue` and `/aisles` redirect to `/supermarket`.

**Aisle ordering:** aisles carry an `order` field (store walk-order). Use `sortedAisles`
from context for display. Reordering is **drag-and-drop on the Supermarket page** (an
`{ type: 'aisle' }` payload via `src/lib/dnd.ts`; rows drag by a ⠿ handle so the
click-through link doesn't start drags; insert-before-row semantics plus a dashed end
drop-zone shown mid-drag). `moveAisle(id, toIndex)` splices the aisle in front of the row
currently at `toIndex` (pass `sortedAisles.length` for the end) and reassigns contiguous
`order` values; self/adjacent drops no-op.

## Conventions

- Routes live in `src/App.tsx`; the home page is the planner and unknown paths redirect to `/planner`.
- Shared Tailwind class strings (`btn`, `btnPrimary`, `input`, `card`, `label`, `labelSmall`,
  `ingredientRow`, `tagBadge`, `stepBtn`, …) live in `src/components/ui.ts` — reuse these
  instead of re-writing class strings.
- Reuse the shared helpers rather than re-deriving them:
  - `buildItemsByAisle(sortedAisles, groceryItems)` (`src/lib/itemsByAisle.ts`) groups catalogue
    items by aisle for any picker/list; `<ItemSelect>` renders that grouping as a `<select>` with
    the `NEW_ITEM` quick-add sentinel (`src/lib/constants.ts`). `<AisleSelect>` and `<UnitSelect>`
    are the picker components for aisle / unit fields (both with a disabled placeholder option).
  - `parseTags(text)` (`src/lib/tags.ts`); `pluralize(word, count)`, `formatQuantity(n)` and
    `roundQuantity(n)` (`src/lib/format.ts`) — use these for any displayed/scaled quantity.
  - Recipe form state goes through `useRecipeForm` (`src/hooks/useRecipeForm.ts`); build the save
    payload with `formToRecipeInput(state)`. Used by `RecipeEditor` — which is also the import
    target: `RecipeImport` parses pasted text straight into an editor draft (no separate review
    screen), passing parsed ingredient names as `hints` so `IngredientEditor` can flag/label the
    rows it couldn't auto-match to the catalogue.
  - `<Modal>` (overlay + click-outside) and `<ErrorMessage>` (red banner) for those UI patterns.
- `UNITS` (`src/lib/units.ts`) is the **exhaustive, fixed unit list** — units are select-only
  (no free text) and the list isn't user-editable. Always enter a unit via `<UnitSelect>`. The
  parser's `UNIT_ALIASES` (`src/lib/parseRecipe.ts`) must only map to members of `UNITS`; if you
  add a unit, add it to `UNITS` first. (`defaultUnit`/`Ingredient.unit` stay typed as `string`
  so legacy values still load; `UnitSelect` shows an unknown stored value but won't add it back.)
- IDs come from `newId()` (`src/lib/ids.ts`).
- British spelling is used throughout (catalogue, favourite, aisle).
