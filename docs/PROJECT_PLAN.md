# The Pantry — Plan

_Last updated: 2026-06-11 · Status: Phases 1–7 shipped_

## What this is

The Pantry is a **personal** meal-planning app (just for the author) that replaces a
messy Google Drive recipe folder. It keeps recipes structured and makes the **weekly
shopping list build itself**: pick your meals, get an aisle-grouped list that's combined
across recipes, scaled to your household, and (later) filtered for allergies. The first
run is a **local web app** — runs in a browser from a local dev server, works on a laptop
now and is shaped to work on a phone once cross-device sync is added later. No accounts,
no sharing, local data only to start.

## Core data the app tracks

- **Grocery items** — the canonical things you buy (e.g. "onion", "chopped tomatoes").
  Each belongs to an **aisle/section** and has a default **unit/size** (g, ml, can, pack,
  each…) so quantities are always meaningful.
- **Recipes** — name, description, instructions, servings, tags, favourite flag, optional
  notes/source, and a list of **ingredients** (each a quantity + unit of a grocery item).
- **Weekly plan** — meals chosen for a week, optionally assigned to days, with the option
  to cook a different number of servings than the recipe default.
- **Shopping list** — generated from a week's plan; combined, scaled, aisle-grouped;
  supports check-off and ad-hoc items.
- **Settings** — grocery items to avoid (allergies), configured per-item on the
  supermarket's aisle pages (no dedicated settings page; no household-size setting).

## Key behaviours

- **List builds itself:** every line carries a quantity **and its unit/size**, never just
  a name. Same grocery item is combined across all planned meals, scaled to household size
  (or a per-meal serving override), and **summed by unit** — two recipes each needing a
  can of chopped tomatoes show as "2 cans chopped tomatoes". Same-unit amounts merge into
  one summed line; **mismatched units stay separate** (no unit conversion for now).
- **Aisle grouping:** the list is grouped by aisle and ordered the way you walk a store,
  so shopping is one pass. Aisles are **fully editable** from the start.
- **Catalogue-first ingredients:** adding an ingredient always means picking an existing
  grocery item (or quick-adding a new one with its aisle/unit), so every ingredient has a
  known aisle and unit that the shopping list can rely on.
- **Allergy-aware** (later): recipes containing excluded items are flagged and kept out of
  suggestions and the randomiser.
- **Randomiser** (later): shuffleable random suggestions, dragged onto days to fill the week.
- **Suggestions** (later): surface favourites/recipes not cooked recently.

## Feature groups

- **Recipe library** — recipe CRUD, ingredients, tags, favourites; later: search, tag
  filtering, paste/import.
- **Grocery catalogue** — grocery items, units, and editable aisles, all on one
  **Supermarket** page (reorderable aisles that click through to their items); quick-add
  during recipe authoring.
- **Planning** — weekly plan, manual meal selection, day assignment, serving overrides.
- **Shopping list** — generation, combination, scaling, aisle grouping, check-off, ad-hoc
  items, "already have".
- **Discovery** — randomiser and not-recently-cooked suggestions.
- **Allergies** — per-item "Avoid" flags on the supermarket's aisle pages; allergy-aware
  flagging and filtering.

## Phases

Built in priority order. Each phase leaves the app independently usable.

### Phase 1 — Recipe Library + Grocery Catalogue (simplest runnable slice)
**Goal:** Open the app and build a real recipe library — create, view, and edit recipes
with structured, catalogue-backed ingredients.
**Includes:**
- Create / list / view / edit recipes: name, description, servings, instructions, tags,
  favourite flag, optional notes/source.
- Ingredients are **catalogue-first**: pick a grocery item + quantity + unit, with
  **quick-add** of a new grocery item (and its aisle/unit) inline.
- Manage grocery items and their aisle; **aisles fully editable** (add/rename/reorder).
- A seeded starter catalogue of common grocery items and a starter aisle list to build on.
**Explicitly not yet:** no search/filtering, no paste/import, no planner, no shopping
list, no nutrition entry, no allergy handling.
**How we'll run & test it locally:** start a local dev server and open it in a browser;
create a few recipes, quick-add some grocery items, edit an aisle, reload and confirm the
data persists locally.

### Phase 2 — Recipe Library polish
**Goal:** Make a growing library easy to navigate and faster to fill.
**Includes:**
- Browse with **search** and **tag filtering**.
- **Paste / import a recipe**: paste recipe text and turn it into a structured recipe
  (the simple foundation for richer importing later — no social/sharing layer).
**Explicitly not yet:** URL scraping import (parked).
**How we'll run & test it locally:** with ~10 recipes, search by name, filter by a tag,
and paste a recipe block to create one without typing every field.

### Phase 3 — Weekly Planner (manual)
**Goal:** Plan a week of meals by hand.
**Includes:**
- A weekly view; add meals by hand, with optional assignment to days.
- **Per-meal serving override** (cook more/fewer than the recipe default).
- **Household size** setting introduced here (used for scaling).
**Explicitly not yet:** randomiser, suggestions, allergy filtering.
**How we'll run & test it locally:** plan a week from existing recipes, set household
size, override servings on one meal, reload and confirm the plan persists.

### Phase 4 — Shopping List
**Goal:** Turn a week's plan into a shop-ready list — the headline payoff.
**Includes:**
- Generate an **aisle-grouped** checklist from the week's plan, **combined** across
  recipes and **scaled** to household size / per-meal overrides (sum same-unit lines;
  keep mismatched units separate).
- Add ad-hoc items by hand.
- Mark items you **already have** so they drop off the list.
- **Tick items off** as you shop; regenerate when the plan changes.
**Explicitly not yet:** unit conversion (parked).
**How we'll run & test it locally:** from a planned week, generate the list; confirm two
recipes' cans of tomatoes merge to "2 cans", lines are aisle-grouped, an ad-hoc item adds,
and check-off / "already have" work.

### Phase 5 — Randomiser, Suggestions & Allergies
**Goal:** Help the week fill itself and respect dietary limits.
**Includes:**
- A **suggestion strip** at the top of the planner: three completely random recipes, with
  a **Shuffle** to re-roll them.
- **Drag and drop**: drag a suggestion onto a day to plan it; drag planned meals between
  days to rearrange the week.
- **Allergy settings** (excluded items) + **allergy-aware** flagging and filtering of
  recipes out of suggestions.
**Explicitly not yet:** —
**How we'll run & test it locally:** mark some favourites, shuffle the suggestions, drag
one onto a day, drag a meal to another day, add an allergy and confirm matching recipes
are flagged and excluded.

### Phase 6 — UX refinements
**Goal:** Post-trial polish across the planner, catalogue, and aisles.
**Includes:**
- Planner: remove the "Clear week" button; the meal tile's "Remove" becomes a **bin
  icon** (🗑); allergen recipes get the same red **allergen badge** on their planner
  tiles as in the library.
- The grocery catalogue and aisle pages merge into one **Supermarket** page:
  drag-reorderable aisle rows (handle-only + a move-to-end drop zone, replacing the
  up/down arrows) that **click through** to an aisle's items — rename/delete the aisle
  and add/edit/avoid/delete its items there.
- Allergen config moves **onto the supermarket's aisle pages** (a per-item "Avoid"
  toggle); the separate Settings page is removed.
**Explicitly not:** nutrition — built, trialled, rejected (see decisions log).
**How we'll run & test it locally:** plan a week and bin a meal from its tile; open an
aisle from the supermarket, mark an item "Avoid", and confirm its recipes get badged on
the planner and drop out of suggestions; drag an aisle row to reorder and confirm the
aisle list and shopping list follow.

### Phase 7 — Supermarket profiles
**Goal:** Per-store aisle orderings, so the shopping list can match whichever
supermarket you're walking.
**Includes:**
- Multiple **supermarket profiles** (e.g. "Tesco", "M&S") — all sharing the one aisle
  catalogue, each holding its own walk-order of it.
- A **tab strip** on the Supermarket page to switch the active profile, with inline
  add / rename / delete (guarded: never below one profile).
- The active profile drives `sortedAisles` app-wide — the supermarket page, all
  pickers, and the shopping list follow it.
**Explicitly not (yet):** the full "shopping mode" (picking the store from the shopping
page) — parked; the data model already supports it.
**How we'll run & test it locally:** add a second profile, drag an aisle into a
different position on it, switch tabs and confirm the supermarket page and shopping
list re-order per profile while the other profile is untouched.

## Local-first build ethos

Phase 1 should be implementable with the **simplest tools that work** — a minimal local
dev server and local persistence (e.g. local files or browser storage) instead of a real
database — so the app runs locally and can be iterated on in minutes. The exact stack is a
build-time decision and is deliberately left open here; the only fixed choice is the
**local web app** form factor.

## Deferred to productionise

- Cross-device sync / accounts (plan on laptop, shop on phone with shared data) — the
  first run is deliberately local-only.
- Platform / packaging choices (installable app, native wrapper).
- Real database, hosting, auth, hardening, and scale.
- Formal tech-stack selection.

## Parked for later (product, not infra)

- Recipe sharing / multi-user / public discovery (the social layer — copying *from other
  users*, building on the basic paste/import in Phase 2).
- Import a recipe from a **URL** (scraping) — an upgrade on the Phase 2 paste/import.
- **Unit conversion** in shopping-list aggregation.
- **Shopping mode** — pick which supermarket you're in from the shopping page and the
  list re-orders to that store's walk (quick profile switch, no need to change the
  app-wide active profile). The Phase 7 data model already supports it: `orderAisles()`
  is pure/per-profile and `buildShoppingList(…, sortedAisles)` takes the ordering as a
  parameter.
- **Nutrition tracking** — built and trialled as the original Phase 6 (per-serving
  macros + planner roll-up), then rejected and reverted (2026-06-11); subsumes the
  earlier auto-filled-nutrition-database idea.

## Happy path (how we'll know it works, end to end)

Create ~5 recipes → mark 3 as favourites → plan a week (randomise once it exists, else by
hand) → tweak one meal's servings → generate the shopping list → confirm it's
aisle-grouped, combined, and scaled to household size, with ad-hoc add and check-off
working.

## Open questions

- None blocking. (Storage mechanism and exact stack are intentionally deferred to the
  Phase 1 build.)

## Way-future monetisation idea

> Not a concern now — noted so it isn't lost.

The structured ingredient + aisle data and the planning engine could be offered to
**supermarket sites / apps**: they populate it with their own product and aisle-layout
data and use the shopping-list flow as a **cross-sell** surface (suggesting their products
against planned meals). The Pantry becomes the meal-planning layer feeding a retailer's
basket rather than just a personal tool.

## Decisions log

- **2026-06-11** — Phase 7: **supermarket profiles**. A profile
  (`SupermarketProfile = { id, name, aisleIds }`) is one user-named **ordering of the
  shared aisle catalogue** — per-profile aisle _sets_ were considered and rejected
  (they'd force a per-profile aisle assignment on every grocery item). `Aisle.order` is
  **removed**; walk-order lives in each profile's `aisleIds` and `PantryData` gains
  top-level `supermarkets` + `activeSupermarketId` (**not** inside `settings`, which
  semantically is the allergy list and whose storage coercion rebuilds it as exactly
  `{ excludedItemIds }`). Version bump to **5**; the v4→v5 step builds one
  "My supermarket" profile from the old order and strips the field. `sortedAisles` keeps
  its name/type but is now the **active** profile's order via the pure, read-time
  self-healing `orderAisles()` (`src/lib/supermarkets.ts` — drops dangling ids, appends
  missing aisles), so every existing consumer (pickers, shopping list) needed zero
  changes. Cascades follow the house convention: `createAisle` appends to **all**
  profiles, `deleteAisle` drops the id from all; `deleteSupermarket` is guarded (never
  below one profile, `DeleteResult`) and reassigns the active id when the active store
  is deleted. UI is a **tab strip** on the Supermarket page (`SupermarketTabs.tsx`):
  tabs switch the active profile app-wide (the shopping list follows immediately), ✎
  live-rename + ✕ delete on the active tab, inline "+" add (the new profile copies the
  active ordering and becomes active). The full **shopping mode** (per-trip store pick
  on the shopping page) is parked — the model already supports it.
- **2026-06-11** — Catalogue + Aisles merged into one **Supermarket** section (route
  `/supermarket`; the old `/catalogue` and `/aisles` routes redirect there).
  `Supermarket` lists the drag-reorderable aisle rows, each **clicking through** to
  `AisleDetail` (`/supermarket/:aisleId`): aisle rename and (guarded) delete move into
  that page, the add-item form is **scoped to the aisle** (no aisle picker — the page
  implies it), and the item rows (unit, "Avoid" toggle, edit, delete) live there. The
  item **edit row keeps its aisle select**, so editing is how an item moves between
  aisles (it leaves the page on save). The `aisleHeading` ui string went with the old
  grouped catalogue view. No data-shape change.
- **2026-06-11** — Phase 6 repurposed: **nutrition tracking was built, trialled for
  real, and rejected** ("not a fan") — fully reverted, moved to parked. Phase 6 is now
  **ad-hoc UX refinements**: (1) the planner's "Clear week" button removed (`clearPlan`
  mutation removed as orphaned, per the 2026-06-10 precedent); (2) the meal tile's
  "Remove" is a 🗑 bin icon; (3) planner meal tiles show the red allergen badge like the
  library; (4) allergen config moved from the Settings page to a per-item **"Avoid"
  toggle on the grocery catalogue page** — the Settings page (and its "Clear all" /
  `clearExcludedItems`) removed, `/settings` falls into the wildcard redirect;
  `PantryData.settings` is **unchanged** (no version bump); (5) aisle reordering is
  **drag-and-drop** — `DragPayload` gains `{ type: 'aisle' }`, rows drag by a ⠿ handle
  only (the rename input keeps text selection), drop inserts before the target row, a
  dashed end zone (shown mid-drag) moves a row last, and `moveAisle(id, 'up' | 'down')`
  is re-signatured to **`moveAisle(id, toIndex)`** (splice + contiguous `order`
  reassign; self/adjacent drops no-op). Keyboard reordering is dropped — consistent
  with the planner dnd's desktop/mouse-only stance.
- **2026-06-10** — Phase 5 planner UX redesigned (before merge): the per-meal 🎲 swap and
  the "Randomise empty days" button are **replaced by a suggestion strip** at the top of
  the planner — three random allergy-safe recipes not in the plan (uniformly random; a
  favourites-first bias was tried and dropped because small libraries pinned favourites in
  the strip) with a **Shuffle** button — plus **native HTML5 drag-and-drop** (no library,
  desktop/mouse
  only): drag a suggestion onto a day to plan it (its slot refills), drag meal cards
  between days (and the Unassigned bucket) to rearrange. Strip state is ephemeral
  component state, nothing persisted. `fillWeekMeals`/`pickSwapRecipe` and the
  `addMeals`/`setMealRecipe` context mutations were removed with the old design.
- **2026-06-08** — Phase 5 randomiser/suggestions/allergies: **allergy state is a single
  `PantryData.settings.excludedItemIds`** (grocery items to avoid), managed on a new
  **Settings page**. A recipe is **flagged** when it uses any excluded item; flagged recipes
  get a red badge in the library + detail and are **hard-excluded** from the randomiser and
  suggestions (but still selectable, badged, in the manual add modal). The **randomiser fills
  empty days only** (never disturbs manual picks), drawing **allergy-safe favourites first,
  then other recipes**; each meal has a 🎲 **swap**. **Suggestions** = allergy-safe recipes
  **not already in the plan** — "not recently cooked" is **plan-as-proxy** since the app keeps
  no cook history. Randomiser/suggestion logic is pure in `src/lib/suggest.ts`; `filterRecipes`
  stays allergy-agnostic. Data `version` bumped to **4** with a v3→v4 migration backfilling
  empty `settings`.
- **2026-06-08** — Phase 4 shopping list: **fully-derived buy list + an "Already have"
  reconciliation column** (`PantryData.shopping = { have, checked }`). The list is always
  computed from the plan — `buildShoppingList` scales each meal by `(servings ??
  recipe.servings) / recipe.servings`, sums per (item, unit), then subtracts what the user
  has, dropping lines that net to ≤ 0; mismatched units stay separate. The page is **two
  columns**: the aisle-grouped buy list (plain text, no checkboxes) and an _Already have_
  column with one row per recipe requirement (recipe items only). Each row has −/+ steppers
  plus a ✓ that maxes `have` to `need` — that's how you "tick off" a line (it nets to zero and
  drops off); − brings it back. `have` is a `Record<itemId::unit, number>` (the only stored
  shopping state). **Superseded earlier attempts this session** — an always-live overlay, a
  generated-then-editable snapshot with "Regenerate", and a three-section have/extra model;
  this is dynamic (no staleness) and keeps "already have" scoped to the recipes. A **"Want
  extra" section is parked** for later. Data `version` is **3** with an iterative `migrate()`;
  the loader self-heals dev blobs carrying a superseded `shopping` shape.
- **2026-06-07** — Form factor: **local web app** (laptop now, phone-shaped for later
  sync). Chosen over desktop/CLI to fit the eventual laptop-plan / phone-shop goal.
- **2026-06-07** — Phase 1 trimmed to **recipe CRUD + grocery catalogue/aisle management**
  only; search/tag-filter and paste/import moved to a new Phase 2.
- **2026-06-07** — **Aisles fully editable from the start** (not a fixed list).
- **2026-06-07** — Ingredients are **catalogue-first with quick-add** (guarantees every
  ingredient has an aisle + unit for the shopping list).
- **2026-06-07** — **Randomiser & suggestions** split out of the planner into a later
  phase (Phase 5); manual planning ships first so the plan → shopping-list flow is reached
  by Phase 4.
- **2026-06-07** — Folded in the original ideation doc `docs/the-pantry-plan.md` (now
  removed as redundant); this plan is the single source of truth.
- **2026-06-07** — Phase 3 planner shipped as a **single rolling current-week plan** (no
  history), presented as a **calendar of the coming Mon→Sun week** and set as the app's
  **home page** (swapped with Recipes). You **click a day to add recipes** to it; each
  planned meal can be **scaled per day** (a servings override on top of the recipe's
  default). **No household-size setting** — scaling is per-meal only. Deleting a recipe
  **cascades** to remove its planned meals (the plan is transient data, unlike the
  catalogue's blocking delete guards). Data `version` bumped to **2** with a v1→v2
  migration in `storage.ts`.
