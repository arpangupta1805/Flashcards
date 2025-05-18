/**
 * Validates if a string is a valid UUID
 * @param id The string to validate
 * @returns True if the string is a valid UUID, false otherwise
 */
export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}; 