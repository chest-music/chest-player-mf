/**
 * Capitalize first letter of a word
 * From share repository for compatibility
 * @param {string} word 
 * @returns {string}
 */
export const capitalize = (word) => {
  if (typeof word !== "string" || word.length === 0) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};