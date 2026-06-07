import type { PantryData } from '../types'
import { buildSeedData } from './seed'

const STORAGE_KEY = 'pantry:data'

/**
 * The single place that touches localStorage. Keeping all persistence here means
 * the eventual swap to a real backend (productionise step) is localised to this file.
 */
export function load(): PantryData {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seeded = buildSeedData()
    save(seeded)
    return seeded
  }

  try {
    const parsed = JSON.parse(raw)
    const migrated = migrate(parsed)
    // Persist the upgraded shape so the migration only runs once.
    if (migrated.version !== parsed.version) save(migrated)
    return migrated
  } catch (err) {
    console.error('Failed to read pantry data, re-seeding.', err)
    const seeded = buildSeedData()
    save(seeded)
    return seeded
  }
}

/**
 * Bring a stored blob up to the current version. Each step backfills the fields a
 * version introduced; unknown versions throw so the caller can re-seed.
 */
function migrate(parsed: { version?: number } & Record<string, unknown>): PantryData {
  switch (parsed.version) {
    case 1:
      // v2 introduced the weekly plan (Phase 3).
      return {
        ...parsed,
        version: 2,
        plan: { meals: [] },
      } as unknown as PantryData
    case 2: {
      // Defensively backfill in case an older v2 blob predates a field.
      const data = parsed as unknown as PantryData
      return { ...data, plan: data.plan ?? { meals: [] } }
    }
    default:
      throw new Error(`Unsupported pantry data version: ${parsed.version}`)
  }
}

export function save(data: PantryData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
