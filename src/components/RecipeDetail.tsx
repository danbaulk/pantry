import { Link, useNavigate, useParams } from 'react-router-dom'
import { usePantry } from '../state/usePantry'
import { formatIngredient } from '../lib/format'
import { recipeHasExcludedItem } from '../lib/suggest'
import { AllergyBadge } from './AllergyBadge'
import { btnDanger, btnPrimary, btnSecondary, card, tagBadge } from './ui'

export function RecipeDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getRecipe, getItem, excludedItemIds, deleteRecipe } = usePantry()

  const recipe = id ? getRecipe(id) : undefined

  if (!recipe) {
    return (
      <div className="mx-auto max-w-2xl">
        <p className="text-gray-500">Recipe not found.</p>
        <Link to="/recipes" className="text-green-600 hover:underline">
          ← Back to recipes
        </Link>
      </div>
    )
  }

  function handleDelete() {
    if (!recipe) return
    if (confirm(`Delete "${recipe.name}"? This can't be undone.`)) {
      deleteRecipe(recipe.id)
      navigate('/recipes')
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/recipes" className="text-sm text-green-600 hover:underline">
        ← Back to recipes
      </Link>

      <div className="mt-2 mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-gray-900">
            {recipe.favourite && <span title="Favourite">⭐</span>}
            {recipe.name}
            {recipeHasExcludedItem(recipe, excludedItemIds) && <AllergyBadge />}
          </h1>
          {recipe.description && <p className="mt-1 text-gray-600">{recipe.description}</p>}
        </div>
        <div className="flex shrink-0 gap-2">
          <Link to={`/recipes/${recipe.id}/edit`} className={btnPrimary}>
            Edit
          </Link>
          <button className={btnDanger} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <span>{recipe.servings} servings</span>
        {recipe.tags.map((t) => (
          <span key={t} className={tagBadge}>
            {t}
          </span>
        ))}
      </div>

      <section className={`${card} mb-4`}>
        <h2 className="mb-2 font-semibold text-gray-800">Ingredients</h2>
        {recipe.ingredients.length === 0 ? (
          <p className="text-sm text-gray-400">No ingredients.</p>
        ) : (
          <ul className="space-y-1 text-gray-700">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>{formatIngredient(ing, getItem(ing.itemId))}</li>
            ))}
          </ul>
        )}
      </section>

      {recipe.instructions && (
        <section className={`${card} mb-4`}>
          <h2 className="mb-2 font-semibold text-gray-800">Instructions</h2>
          <p className="whitespace-pre-wrap text-gray-700">{recipe.instructions}</p>
        </section>
      )}

      {(recipe.notes || recipe.source) && (
        <section className={`${card} mb-4 text-sm text-gray-600`}>
          {recipe.notes && (
            <p className="whitespace-pre-wrap">
              <span className="font-semibold text-gray-800">Notes: </span>
              {recipe.notes}
            </p>
          )}
          {recipe.source && (
            <p className="mt-1">
              <span className="font-semibold text-gray-800">Source: </span>
              {recipe.source}
            </p>
          )}
        </section>
      )}

      <Link to="/recipes" className={btnSecondary}>
        ← Back to recipes
      </Link>
    </div>
  )
}
