import { UNITS } from '../lib/units'

/** Rendered once at app root; referenced by inputs via list="unit-options". */
export function UnitDatalist() {
  return (
    <datalist id="unit-options">
      {UNITS.map((u) => (
        <option key={u} value={u} />
      ))}
    </datalist>
  )
}
