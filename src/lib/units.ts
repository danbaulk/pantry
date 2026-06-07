/**
 * Suggested units, surfaced in dropdowns/datalists. Free text is still allowed —
 * this is a convenience list, not a hard constraint.
 */
export const UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'tsp',
  'tbsp',
  'each',
  'can',
  'pack',
  'bunch',
  'clove',
  'slice',
  'pinch',
] as const

export type Unit = (typeof UNITS)[number]
