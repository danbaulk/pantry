import { useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { usePantry } from '../state/usePantry'
import type { RecipeInput } from '../state/context'
import { formToRecipeInput, useRecipeForm } from '../hooks/useRecipeForm'
import { IngredientEditor } from './IngredientEditor'
import { ErrorMessage } from './ErrorMessage'
import { btnPrimary, btnSecondary, card, input, label } from './ui'

export function RecipeEditor() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { getRecipe, createRecipe, updateRecipe } = usePantry()

  const existing = id ? getRecipe(id) : undefined
  const isEdit = Boolean(existing)

  // When creating, an imported draft can seed the form (see RecipeImport); its
  // `hints` carry the parsed name for each ingredient so unmatched rows are labelled.
  const navState = existing ? null : (location.state as { draft?: RecipeInput; hints?: string[] } | null)
  const draft = navState?.draft
  const hints = navState?.hints

  const { state, set } = useRecipeForm(existing ?? draft)
  const [error, setError] = useState<string | null>(null)

  // Editing a route id that doesn't resolve to a recipe.
  if (id && !existing) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-gray-500">Recipe not found.</p>
      </div>
    )
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!state.name.trim()) {
      setError('Please give the recipe a name.')
      return
    }
    if (state.ingredients.some((ing) => !ing.itemId)) {
      setError('Every ingredient needs a grocery item selected (or remove the empty row).')
      return
    }

    const payload = formToRecipeInput(state)

    if (existing) {
      updateRecipe(existing.id, payload)
      navigate(`/recipes/${existing.id}`)
    } else {
      const newRecipeId = createRecipe(payload)
      navigate(`/recipes/${newRecipeId}`)
    }
  }

  return (
    <form onSubmit={handleSave} className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit recipe' : 'New recipe'}
      </h1>

      <ErrorMessage message={error} />

      <div className={`${card} space-y-4`}>
        <div>
          <label className={label}>Name</label>
          <input
            className={input}
            value={state.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </div>

        <div>
          <label className={label}>Description</label>
          <input
            className={input}
            value={state.description}
            onChange={(e) => set({ description: e.target.value })}
            placeholder="Short one-liner (optional)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Servings</label>
            <input
              type="number"
              min="1"
              className={input}
              value={state.servings}
              onChange={(e) => set({ servings: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                checked={state.favourite}
                onChange={(e) => set({ favourite: e.target.checked })}
              />
              Favourite ⭐
            </label>
          </div>
        </div>

        <div>
          <label className={label}>Tags</label>
          <input
            className={input}
            value={state.tagsText}
            onChange={(e) => set({ tagsText: e.target.value })}
            placeholder="comma, separated, tags"
          />
        </div>
      </div>

      <div className={card}>
        <IngredientEditor
          ingredients={state.ingredients}
          onChange={(ingredients) => set({ ingredients })}
          hints={hints}
        />
      </div>

      <div className={`${card} space-y-4`}>
        <div>
          <label className={label}>Instructions</label>
          <textarea
            className={`${input} min-h-32`}
            value={state.instructions}
            onChange={(e) => set({ instructions: e.target.value })}
            placeholder="Step-by-step method (optional)"
          />
        </div>
        <div>
          <label className={label}>Notes</label>
          <textarea
            className={`${input} min-h-20`}
            value={state.notes}
            onChange={(e) => set({ notes: e.target.value })}
            placeholder="Anything else (optional)"
          />
        </div>
        <div>
          <label className={label}>Source</label>
          <input
            className={input}
            value={state.source}
            onChange={(e) => set({ source: e.target.value })}
            placeholder="Where it came from (optional)"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" className={btnPrimary}>
          {isEdit ? 'Save changes' : 'Create recipe'}
        </button>
        <button
          type="button"
          className={btnSecondary}
          onClick={() => navigate(existing ? `/recipes/${existing.id}` : '/recipes')}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
