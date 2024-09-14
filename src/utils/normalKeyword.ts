export const normalizeKeyword = (keyword: string) => {
  return (keyword as string)
    .normalize('NFD')
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace('đ', 'd')
    .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
    .trim() // Trim leading and trailing spaces
}
