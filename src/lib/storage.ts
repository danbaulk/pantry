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
    const parsed = JSON.parse(raw) as PantryData
    // Minimal forward-compat guard. Only v1 exists today.
    if (parsed.version !== 1) {
      throw new Error(`Unsupported pantry data version: ${parsed.version}`)
    }
    return parsed
  } catch (err) {
    console.error('Failed to read pantry data, re-seeding.', err)
    const seeded = buildSeedData()
    save(seeded)
    return seeded
  }
}

export function save(data: PantryData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function clearAll(): void {
  localStorage.removeItem(STORAGE_KEY)
}
