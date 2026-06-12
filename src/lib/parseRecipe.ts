/**
 * Offline, heuristic recipe parser. Turns pasted free-text into a best-effort
 * structured draft that the user reviews and corrects before saving — it is
 * deliberately lenient, not exact. No network, no dependencies (the "simple
 * foundation" for richer import later; URL scraping / API parsing stay parked).
 */

export interface ParsedIngredient {
  /** The original line, kept so the user can sanity-check the parse. */
  raw: string
  quantity: number
  unit: string
  name: string
}

export interface ParsedRecipe {
  name: string
  servings: number
  instructions: string
  /** Where the recipe came from (URL or free text); empty when no source line found. */
  source: string
  ingredients: ParsedIngredient[]
}

/**
 * Tokens we recognise as units, each mapped to a canonical form. Every target
 * here MUST be a member of UNITS (src/lib/units.ts) — units are select-only
 * app-wide, so an imported unit that wasn't in the list couldn't be represented.
 * A word is only treated as a unit if it's in here — so "2 eggs" stays qty 2 /
 * unit "each" / name "eggs", while "2 cups flour" becomes qty 2 / unit "cup" /
 * name "flour". An unrecognised leading word falls back to unit "each".
 */
const UNIT_ALIASES: Record<string, string> = {
  g: 'g', gram: 'g', grams: 'g', gr: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg', kilo: 'kg', kilos: 'kg',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  lb: 'lb', lbs: 'lb', pound: 'lb', pounds: 'lb',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml', millilitres: 'ml',
  l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  tsp: 'tsp', tsps: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  tbsp: 'tbsp', tbsps: 'tbsp', tbs: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  cup: 'cup', cups: 'cup',
  can: 'can', cans: 'can', tin: 'can', tins: 'can',
  jar: 'jar', jars: 'jar',
  pack: 'pack', packs: 'pack', packet: 'pack', packets: 'pack',
  bunch: 'bunch', bunches: 'bunch',
  clove: 'clove', cloves: 'clove',
  slice: 'slice', slices: 'slice',
  pinch: 'pinch', pinches: 'pinch',
  handful: 'handful', handfuls: 'handful',
  sprig: 'sprig', sprigs: 'sprig',
}

const SECTION_HEADERS = ['ingredients', 'method', 'instructions', 'directions', 'steps']

// Leading-quantity matcher: mixed "1 1/2", fraction "1/2", range "2-3", decimal "0.5".
const QUANTITY_RE = /^\s*(\d+\s+\d+\/\d+|\d+\/\d+|\d+\s*[-–]\s*\d+|\d+(?:\.\d+)?)\s*(.*)$/

// "Source: <url or text>" label, or a line that is nothing but a URL.
const SOURCE_LABEL_RE = /^source\s*[:\-–]\s*(.+)$/i
const BARE_URL_RE = /^https?:\/\/\S+$/i

/** Extract the source value from a line, or null if it isn't a source line. */
function parseSourceLine(line: string): string | null {
  const labelled = line.match(SOURCE_LABEL_RE)
  if (labelled) return labelled[1].trim()
  if (BARE_URL_RE.test(line)) return line
  return null
}

function normaliseHeader(line: string): string {
  return line.trim().toLowerCase().replace(/[:\-–.]+$/, '').trim()
}

function isSectionHeader(line: string): boolean {
  return SECTION_HEADERS.includes(normaliseHeader(line))
}

/** Parse a leading quantity, returning the numeric value and the remaining text. */
function parseQuantity(line: string): { quantity: number; rest: string } | null {
  const m = line.match(QUANTITY_RE)
  if (!m) return null
  const token = m[1].trim()
  const rest = m[2].trim()

  let quantity: number
  const mixed = token.match(/^(\d+)\s+(\d+)\/(\d+)$/)
  const fraction = token.match(/^(\d+)\/(\d+)$/)
  const range = token.match(/^(\d+)\s*[-–]\s*(\d+)$/)
  if (mixed) {
    quantity = Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3])
  } else if (fraction) {
    quantity = Number(fraction[1]) / Number(fraction[2])
  } else if (range) {
    quantity = Number(range[1]) // take the lower end of a range
  } else {
    quantity = Number(token)
  }
  // Round messy fractions to 2dp so we don't surface 0.3333333.
  quantity = Math.round(quantity * 100) / 100
  return { quantity, rest }
}

/** Pull a unit off the front of `rest` if the first word is a recognised unit. */
function splitUnitAndName(rest: string): { unit: string; name: string } {
  const words = rest.split(/\s+/)
  const first = words[0]?.toLowerCase().replace(/\.$/, '') ?? ''
  if (first && UNIT_ALIASES[first]) {
    return { unit: UNIT_ALIASES[first], name: cleanName(words.slice(1).join(' ')) }
  }
  return { unit: 'each', name: cleanName(rest) }
}

/** Tidy an ingredient name: drop a leading "of", a trailing prep clause, and notes. */
function cleanName(name: string): string {
  return name
    .replace(/\(.*?\)/g, '') // remove parenthetical notes
    .split(',')[0] // drop trailing prep clause ("onion, diced" -> "onion")
    .replace(/^of\s+/i, '') // "cloves of garlic" -> "garlic"
    .trim()
}

export function parseRecipe(text: string): ParsedRecipe {
  const rawLines = text.split(/\r?\n/)
  const lines = rawLines.map((l) => l.trim())

  // Source: first "Source: ..." / bare-URL line anywhere.
  let source = ''
  for (const line of lines) {
    const parsed = line ? parseSourceLine(line) : null
    if (parsed) {
      source = parsed
      break
    }
  }

  // Title: first non-empty line that isn't a header, a servings/source line, or quantity-led.
  let name = ''
  for (const line of lines) {
    if (!line) continue
    if (isSectionHeader(line)) continue
    if (/serves?\b|servings?\b/i.test(line)) continue
    if (parseSourceLine(line)) continue
    if (parseQuantity(line)) continue
    name = line
    break
  }

  // Servings: first "serves N" / "N servings" anywhere.
  let servings = 2
  for (const line of lines) {
    const m = line.match(/serves?\s+(\d+)/i) ?? line.match(/(\d+)\s+servings?/i)
    if (m) {
      servings = Number(m[1])
      break
    }
  }

  // Section boundaries. If an explicit "ingredients" header exists, trust it;
  // otherwise fall back to classifying each line by whether it's quantity-led.
  const ingredientsHeaderIdx = lines.findIndex(
    (l) => normaliseHeader(l) === 'ingredients',
  )
  const methodHeaderIdx = lines.findIndex((l) =>
    ['method', 'instructions', 'directions', 'steps'].includes(normaliseHeader(l)),
  )

  const ingredients: ParsedIngredient[] = []
  const instructionLines: string[] = []

  lines.forEach((line, idx) => {
    if (!line || isSectionHeader(line)) return
    if (line === name) return
    if (/^serves?\s+\d+/i.test(line) || /^\d+\s+servings?/i.test(line)) return
    if (parseSourceLine(line)) return

    const inIngredientSection =
      ingredientsHeaderIdx !== -1 &&
      idx > ingredientsHeaderIdx &&
      (methodHeaderIdx === -1 || idx < methodHeaderIdx)
    const inMethodSection = methodHeaderIdx !== -1 && idx > methodHeaderIdx

    const parsed = parseQuantity(line)

    // Header-driven classification takes priority; otherwise quantity-led = ingredient.
    if (inMethodSection) {
      instructionLines.push(line)
      return
    }
    if (inIngredientSection || (ingredientsHeaderIdx === -1 && parsed)) {
      if (parsed) {
        const { unit, name: ingName } = splitUnitAndName(parsed.rest)
        ingredients.push({ raw: line, quantity: parsed.quantity, unit, name: ingName })
      } else {
        // Unquantified ingredient line ("Salt and pepper") inside a list.
        ingredients.push({ raw: line, quantity: 1, unit: 'each', name: cleanName(line) })
      }
      return
    }
    instructionLines.push(line)
  })

  return {
    name,
    servings,
    instructions: instructionLines.join('\n'),
    source,
    ingredients,
  }
}
