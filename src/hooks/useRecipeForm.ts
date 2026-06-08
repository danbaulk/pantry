import { useReducer } from 'react'
import type { Ingredient } from '../types'
import type { RecipeInput } from '../state/context'
import { parseTags } from '../lib/tags'

/** The editable fields of a recipe form (tags kept as raw comma text while editing). */
export interface RecipeFormState {
  name: string
  description: string
  servings: number
  instructions: string
  tagsText: string
  favourite: boolean
  notes: string
  source: string
  ingredients: Ingredient[]
}

/** Build initial form state from an existing recipe / imported draft (or blank). */
function formFromRecipe(input?: Partial<RecipeInput>): RecipeFormState {
  return {
    name: input?.name ?? '',
    description: input?.description ?? '',
    servings: input?.servings ?? 2,
    instructions: input?.instructions ?? '',
    tagsText: (input?.tags ?? []).join(', '),
    favourite: input?.favourite ?? false,
    notes: input?.notes ?? '',
    source: input?.source ?? '',
    ingredients: input?.ingredients ?? [],
  }
}

/** Turn form state into a save-ready RecipeInput (trims text, parses tags). */
export function formToRecipeInput(s: RecipeFormState): RecipeInput {
  return {
    name: s.name.trim(),
    description: s.description.trim() || undefined,
    servings: Number(s.servings) || 1,
    instructions: s.instructions.trim() || undefined,
    tags: parseTags(s.tagsText),
    favourite: s.favourite,
    notes: s.notes.trim() || undefined,
    source: s.source.trim() || undefined,
    ingredients: s.ingredients,
  }
}

/**
 * Form state for the recipe editor/import review. `set` merges a partial patch,
 * collapsing the many individual field useStates into one reducer.
 */
export function useRecipeForm(initial?: Partial<RecipeInput>) {
  const [state, set] = useReducer(
    (prev: RecipeFormState, patch: Partial<RecipeFormState>) => ({ ...prev, ...patch }),
    initial,
    formFromRecipe,
  )
  return { state, set }
}
