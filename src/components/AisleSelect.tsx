import type { Aisle } from '../types'
import { input } from './ui'

interface Props {
  value: string
  onChange: (value: string) => void
  aisles: Aisle[]
}

/** Aisle picker with a disabled "aisle…" placeholder, mirroring <UnitSelect>. */
export function AisleSelect({ value, onChange, aisles }: Props) {
  return (
    <select className={input} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="" disabled>
        aisle…
      </option>
      {aisles.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  )
}
