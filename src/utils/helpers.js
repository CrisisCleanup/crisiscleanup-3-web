/**
 * Convert rem to pixels.
 * @param rem
 * @returns {number}
 */
export const convertRemToPixels = (rem) => {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};
