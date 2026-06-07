/** Shared Tailwind class strings so buttons/inputs stay consistent across the app. */

export const btn =
  'inline-flex items-center justify-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'

export const btnPrimary = `${btn} bg-green-600 text-white hover:bg-green-700`
export const btnSecondary = `${btn} border border-gray-300 bg-white text-gray-700 hover:bg-gray-50`
export const btnDanger = `${btn} text-red-600 hover:bg-red-50`

export const input =
  'w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500'

export const label = 'block text-sm font-medium text-gray-700 mb-1'

export const card = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm'
