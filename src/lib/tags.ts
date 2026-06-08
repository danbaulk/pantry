/** Parse a comma-separated tag input into a trimmed, empty-free list. */
export function parseTags(text: string): string[] {
  return text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}
