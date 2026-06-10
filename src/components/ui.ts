/** Shared Tailwind class strings so buttons/inputs stay consistent across the app. */

export const btn =
  'inline-flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

export const btnPrimary = `${btn} bg-green-600 text-white hover:bg-green-700`
export const btnSecondary = `${btn} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`
export const btnDanger = `${btn} text-red-600 hover:bg-red-50`

export const input =
  'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

export const label = 'block text-sm font-medium text-gray-700 mb-1'

/** Smaller, lighter field label used inside compact rows (qty/unit/item pickers). */
export const labelSmall = 'mb-1 block text-xs text-gray-500'

export const card = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm'

/** Bordered container for a single editable ingredient/grocery row. */
export const ingredientRow = 'space-y-2 rounded-md border border-gray-200 p-3'

/** Shared pill geometry for the small badges below. */
const badge = 'rounded-full px-2 py-0.5 text-xs'

/** Small rounded tag/label badge (recipe tags). */
export const tagBadge = `${badge} bg-gray-100 text-gray-600`

/** Red warning badge (recipes containing an excluded/allergen item). */
export const allergenBadge = `${badge} bg-red-100 font-medium text-red-700`

/** Section heading for an aisle group (catalogue, settings). */
export const aisleHeading = 'text-sm font-semibold uppercase tracking-wide text-gray-500'

/** Fixed-width draggable planner tile (planned meals, suggestions) — add colours per use. */
export const dragTile = 'w-56 cursor-grab rounded-md border p-2 active:cursor-grabbing'

/** Square 6×6 stepper button (− / + / ✓ controls). */
export const stepBtn =
  'flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
