# The Pantry — Plan

_Last updated: 2026-06-07 · Status: discovery_

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
  notes/source, a list of **ingredients** (each a quantity + unit of a grocery item), and
  **nutrition per serving** (calories, protein, other macros).
- **Weekly plan** — meals chosen for a week, optionally assigned to days, with the option
  to cook a different number of servings than the recipe default.
- **Shopping list** — generated from a week's plan; combined, scaled, aisle-grouped;
  supports check-off and ad-hoc items.
- **Settings** — household size and any allergies / items to exclude.

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
- **Randomiser** (later): auto-fill a week from favourites, then re-roll or swap any meal.
- **Suggestions** (later): surface favourites/recipes not cooked recently.

## Feature groups

- **Recipe library** — recipe CRUD, ingredients, tags, favourites; later: search, tag
  filtering, paste/import.
- **Grocery catalogue** — grocery items, units, and editable aisles; quick-add during
  recipe authoring.
- **Planning** — weekly plan, manual meal selection, day assignment, serving overrides.
- **Shopping list** — generation, combination, scaling, aisle grouping, check-off, ad-hoc
  items, "already have".
- **Discovery** — randomiser and not-recently-cooked suggestions.
- **Allergies / settings** — household size, excluded items, allergy-aware filtering.
- **Nutrition** — per-serving entry and roll-up across the plan.

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
- **Randomise** a week from favourites; **re-roll** or **swap** any single meal.
- **Suggestions**: surface favourites / recipes not cooked recently.
- **Allergy settings** (excluded items) + **allergy-aware** flagging and filtering of
  recipes out of suggestions and the randomiser.
**Explicitly not yet:** —
**How we'll run & test it locally:** mark some favourites, randomise a week, re-roll a
meal, add an allergy and confirm matching recipes are flagged and excluded.

### Phase 6 — Nutrition
**Goal:** See the macros of what you've planned.
**Includes:**
- Record **nutrition per serving** on each recipe (calories, protein, other macros), by
  hand.
- Show those figures on the recipe detail.
- **Roll up** across the weekly plan — per day and for the week — scaled to
  servings/household size.
**Explicitly not yet:** auto-filled nutrition from a food database (parked).
**How we'll run & test it locally:** enter nutrition on a few recipes, plan a week, and
confirm per-day and weekly totals scale correctly.

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
- **Auto-filled nutrition** via a per-ingredient food database, instead of hand entry.

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
