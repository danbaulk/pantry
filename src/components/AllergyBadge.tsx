import { allergenBadge } from './ui'

/** Small red pill shown on recipes that use an excluded (allergen) grocery item. */
export function AllergyBadge() {
  return (
    <span title="Contains an excluded item" className={allergenBadge}>
      ⚠ allergen
    </span>
  )
}
