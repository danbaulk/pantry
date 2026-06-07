import { UNITS, isKnownUnit } from '../lib/units'
import { input } from './ui'

interface Props {
  value: string
  onChange: (value: string) => void
}

/**
 * Fixed-list unit picker. Units are select-only (no free text) — the options are
 * the exhaustive UNITS list. A legacy value that isn't in the list is shown so it
 * isn't silently lost, but it can only be replaced with a known unit.
 */
export function UnitSelect({ value, onChange }: Props) {
  return (
    <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>
        unit…
      </option>
      {value && !isKnownUnit(value) && <option value={value}>{value}</option>}
      {UNITS.map((u) => (
        <option key={u} value={u}>
          {u}
        </option>
      ))}
    </select>
  )
}
