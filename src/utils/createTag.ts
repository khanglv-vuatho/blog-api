export const createSlug = (value: string): string => {
  return (
    value
      .toLowerCase() // Convert to lowercase
      // Trim leading and trailing whitespace
      .normalize('NFD') // Normalize the string
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
      .replace(/đ/g, 'd') // Replace 'đ' with 'd'
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with a single hyphen
      .replace(/^-+|-+$/g, '')
  ) // Remove leading or trailing hyphens
}
