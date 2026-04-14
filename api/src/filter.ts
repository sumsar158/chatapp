export const normalizeWord = (word: string): string => word.trim().toLowerCase()

export const isFiltered = (content: string, blockedWords: string[]): boolean => {
  const normalized = content.toLowerCase()
  return blockedWords
    .map(normalizeWord)
    .filter(Boolean)
    .some((blocked) => normalized.includes(blocked))
}
