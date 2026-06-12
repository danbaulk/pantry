import type { PantryData, SupermarketProfile } from '../types'
import { buildSeedData } from './seed'
import { newId } from './ids'
import { DEFAULT_SUPERMARKET_NAME } from './supermarkets'

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

const CURRENT_VERSION = 5

type AnyBlob = { version?: number } & Record<string, unknown>

/**
 * Bring a stored blob up to the current version, applying one step at a time so an
 * old blob chains through every upgrade (v1→v2→…→v5). Each step backfills the fields
 * its version introduced; an unknown version throws so the caller can re-seed.
 */
function migrate(parsed: AnyBlob): PantryData {
  let blob = parsed
  while (blob.version !== CURRENT_VERSION) {
    blob = step(blob)
  }
  // Defensively coerce fields in case a current-version blob predates them, or
  // carries a superseded shape (e.g. an early Phase-4 `shopping` shape before
  // `have` became a keyed map). Anything malformed resets to a safe empty value,
  // so old local dev blobs self-heal on load.
  const data = blob as unknown as PantryData
  const s = data.shopping as Partial<PantryData['shopping']> | undefined
  const validShopping = !!s && typeof s.have === 'object' && s.have !== null && !Array.isArray(s.have)
  const settings = data.settings as Partial<PantryData['settings']> | undefined
  const validSettings = !!settings && Array.isArray(settings.excludedItemIds)
  // The provider relies on `supermarkets` never being empty and the active id
  // always resolving — rebuild a default profile from the aisle array if needed.
  const rawProfiles = data.supermarkets as Partial<SupermarketProfile>[] | undefined
  const validSupermarkets =
    Array.isArray(rawProfiles) &&
    rawProfiles.length > 0 &&
    rawProfiles.every(
      (s) => !!s && typeof s.id === 'string' && typeof s.name === 'string' && Array.isArray(s.aisleIds),
    )
  const supermarkets: SupermarketProfile[] = validSupermarkets
    ? (rawProfiles as SupermarketProfile[])
    : [{ id: newId(), name: DEFAULT_SUPERMARKET_NAME, aisleIds: data.aisles.map((a) => a.id) }]
  const activeSupermarketId = supermarkets.some((s) => s.id === data.activeSupermarketId)
    ? data.activeSupermarketId
    : supermarkets[0].id
  return {
    ...data,
    plan: data.plan && Array.isArray(data.plan.meals) ? data.plan : { meals: [] },
    shopping: validShopping ? { have: data.shopping.have } : { have: {} },
    settings: validSettings ? { excludedItemIds: settings.excludedItemIds! } : { excludedItemIds: [] },
    supermarkets,
    activeSupermarketId,
  }
}

function step(blob: AnyBlob): AnyBlob {
  switch (blob.version) {
    case 1:
      // v2 introduced the weekly plan (Phase 3).
      return { ...blob, version: 2, plan: { meals: [] } }
    case 2:
      // v3 introduced the shopping list (Phase 4).
      return { ...blob, version: 3, shopping: { have: {} } }
    case 3:
      // v4 introduced allergy/excluded-item settings (Phase 5).
      return { ...blob, version: 4, settings: { excludedItemIds: [] } }
    case 4: {
      // v5 introduced supermarket profiles (Phase 7): walk-order moved off
      // Aisle.order into per-profile aisleIds. Build one default profile from the
      // old global order and retire the field.
      const aisles = (Array.isArray(blob.aisles) ? blob.aisles : []) as Array<
        { id: string; order?: number } & Record<string, unknown>
      >
      const sorted = [...aisles].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      const profile = {
        id: newId(),
        name: DEFAULT_SUPERMARKET_NAME,
        aisleIds: sorted.map((a) => a.id),
      }
      return {
        ...blob,
        version: 5,
        aisles: aisles.map((a) => {
          const rest = { ...a }
          delete rest.order
          return rest
        }),
        supermarkets: [profile],
        activeSupermarketId: profile.id,
      }
    }
    default:
      throw new Error(`Unsupported pantry data version: ${blob.version}`)
  }
}

export function save(data: PantryData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
