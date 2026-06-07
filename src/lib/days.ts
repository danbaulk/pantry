import type { DayOfWeek } from '../types'

/**
 * Days of the week in display order (Mon→Sun), used for the planner grid columns
 * and the day pickers. Mirrors the convenience-list shape of UNITS.
 */
export const DAYS: Array<{ key: DayOfWeek; label: string }> = [
  { key: 'mon', label: 'Monday' },
  { key: 'tue', label: 'Tuesday' },
  { key: 'wed', label: 'Wednesday' },
  { key: 'thu', label: 'Thursday' },
  { key: 'fri', label: 'Friday' },
  { key: 'sat', label: 'Saturday' },
  { key: 'sun', label: 'Sunday' },
]

/** The DayOfWeek key for a date, treating Monday as the start of the week. */
export function dayKey(date: Date): DayOfWeek {
  return DAYS[(date.getDay() + 6) % 7].key
}

/** Dates for the current Mon→Sun week, keyed by weekday. */
export function currentWeekDates(today: Date = new Date()): Record<DayOfWeek, Date> {
  const monday = new Date(today)
  monday.setHours(0, 0, 0, 0)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
  const out = {} as Record<DayOfWeek, Date>
  DAYS.forEach((d, i) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    out[d.key] = date
  })
  return out
}
