import { useI18n } from 'vue-i18n';

/**
 * Convert rem to pixels.
 * @param rem
 * @returns {number}
 */
export const convertRemToPixels = (rem) => {
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
};

/**
 * Simple formatting for amounts.
 * @param num
 * @returns {number}
 */
export function nFormatter(num) {
  if (!num) return 0;
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1).replace(/\.0$/, '')}G`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return num;
}

export function formatCmsItem(text) {
  return text.replaceAll(/\{(.*?)\}/g, (m, translation) => {
    return useI18n().t(translation);
  });
}
