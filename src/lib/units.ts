/**
 * The exhaustive, fixed set of units. This is the single source of truth: units
 * are chosen from here via <UnitSelect> only — there is no free-text entry, and
 * the list isn't user-editable. The paste-parser's UNIT_ALIASES
 * (src/lib/parseRecipe.ts) must only ever map to members of this list, so every
 * imported unit is valid. Ordered weight → volume → count/pack for the dropdown.
 */
export const UNITS = [
  // Weight
  'g',
  'kg',
  'oz',
  'lb',
  // Volume
  'ml',
  'l',
  'tsp',
  'tbsp',
  'cup',
  // Count / pack
  'each',
  'can',
  'jar',
  'pack',
  'bunch',
  'clove',
  'slice',
  'pinch',
  'handful',
  'sprig',
] as const

export type Unit = (typeof UNITS)[number]

/** Whether a stored value is one of the known units. */
export function isKnownUnit(value: string): value is Unit {
  return (UNITS as readonly string[]).includes(value)
}
