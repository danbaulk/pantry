import type { PantryData } from '../types'
import { buildDataFromPack } from './dataPack'
import { starterPack } from '../data/starterPack'

/**
 * Build a fresh seeded dataset with freshly minted ids from the bundled starter pack
 * (the author's recipes + the catalogue and aisles they imply). The pack is name-keyed;
 * `buildDataFromPack` mints the ids and validates every reference resolves.
 */
export function buildSeedData(): PantryData {
  return buildDataFromPack(starterPack)
}
