import { NavLink, Navigate, Route, Routes } from 'react-router-dom'
import { RecipeList } from './components/RecipeList'
import { RecipeDetail } from './components/RecipeDetail'
import { RecipeEditor } from './components/RecipeEditor'
import { RecipeImport } from './components/RecipeImport'
import { CatalogueManager } from './components/CatalogueManager'
import { AisleManager } from './components/AisleManager'
import { WeeklyPlanner } from './components/WeeklyPlanner'

const navLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-green-100 text-green-800' : 'text-gray-600 hover:bg-gray-100'
  }`

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-3">
          <NavLink to="/planner" className="text-lg font-bold text-green-700">
            🥫 The Pantry
          </NavLink>
          <nav className="flex gap-1">
            <NavLink to="/planner" className={navLink}>
              Planner
            </NavLink>
            <NavLink to="/recipes" className={navLink}>
              Recipes
            </NavLink>
            <NavLink to="/catalogue" className={navLink}>
              Catalogue
            </NavLink>
            <NavLink to="/aisles" className={navLink}>
              Aisles
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/planner" replace />} />
          <Route path="/recipes" element={<RecipeList />} />
          <Route path="/recipes/new" element={<RecipeEditor />} />
          <Route path="/recipes/import" element={<RecipeImport />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/recipes/:id/edit" element={<RecipeEditor />} />
          <Route path="/planner" element={<WeeklyPlanner />} />
          <Route path="/catalogue" element={<CatalogueManager />} />
          <Route path="/aisles" element={<AisleManager />} />
          <Route path="*" element={<Navigate to="/planner" replace />} />
        </Routes>
      </main>
    </div>
  )
}
