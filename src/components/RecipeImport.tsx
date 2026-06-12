import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Ingredient } from '../types'
import { usePantry } from '../state/usePantry'
import type { RecipeInput } from '../state/context'
import { parseRecipe } from '../lib/parseRecipe'
import { matchItem } from '../lib/matchItem'
import { btnPrimary, btnSecondary, input } from './ui'

/**
 * Paste a recipe, parse it offline (src/lib/parseRecipe), auto-match each
 * ingredient to the catalogue, then open it straight in the normal RecipeEditor
 * as a draft — there's no separate review step. Unmatched ingredients land in the
 * editor as empty-item rows flagged with their parsed name (passed as `hints`),
 * so the one save path handles manual and imported recipes alike.
 */
export function RecipeImport() {
  const navigate = useNavigate()
  const { data } = usePantry()
  const [text, setText] = useState('')

  function handleParse() {
    const result = parseRecipe(text)

    const ingredients: Ingredient[] = []
    // Parsed names, aligned to `ingredients`, so the editor can label unmatched rows.
    const hints: string[] = []
    for (const ing of result.ingredients) {
      const match = matchItem(ing.name, data.groceryItems)
      ingredients.push({ itemId: match?.id ?? '', quantity: ing.quantity, unit: ing.unit })
      hints.push(ing.name)
    }

    const draft: RecipeInput = {
      name: result.name,
      servings: result.servings,
      instructions: result.instructions.trim() || undefined,
      source: result.source || undefined,
      tags: [],
      favourite: false,
      ingredients,
    }
    navigate('/recipes/new', { state: { draft, hints } })
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Paste / import a recipe</h1>
      <p className="text-sm text-gray-500">
        Paste recipe text below (title, servings, an ingredient list, and method). We'll
        parse it and open it in the editor, matching ingredients to your catalogue where we
        can — you finish off any unmatched ones there.
      </p>
      <textarea
        className={`${input} min-h-64 font-mono`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          'Spaghetti Bolognese\nServes 4\n\nIngredients\n400g spaghetti\n2 cans chopped tomatoes\n1 onion, diced\n\nMethod\nFry the onion, add everything else, simmer.'
        }
      />
      <div className="flex gap-2">
        <button type="button" className={btnPrimary} disabled={!text.trim()} onClick={handleParse}>
          Parse &amp; open in editor
        </button>
        <button type="button" className={btnSecondary} onClick={() => navigate('/recipes')}>
          Cancel
        </button>
      </div>
    </div>
  )
}
