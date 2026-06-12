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

/**
 * The seven days starting from `today` (a rolling week), each with its label and
 * actual date (today + i). The first entry is always today, so the planner reads
 * top-down from now rather than from a fixed Monday.
 */
export function weekFromToday(
  today: Date = new Date(),
): Array<{ key: DayOfWeek; label: string; date: Date }> {
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  const startIndex = (today.getDay() + 6) % 7 // index of today within DAYS (Mon→Sun)
  return DAYS.map((_, i) => {
    const day = DAYS[(startIndex + i) % DAYS.length]
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    return { key: day.key, label: day.label, date }
  })
}
