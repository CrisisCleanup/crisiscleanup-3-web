import { useI18n } from 'vue-i18n';
import { i18n } from '../main';

/**
 * Convert rem to pixels.
 * @param rem
 * @returns {number}
 */
export const convertRemToPixels = (rem) => {
  return (
    rem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
  );
};

/**
 * Simple formatting for amounts.
 * @param num
 * @returns {number}
 */
export function nFormatter(number_) {
  if (!number_) return 0;
  if (number_ >= 1_000_000_000) {
    return `${(number_ / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}G`;
  }

  if (number_ >= 1_000_000) {
    return `${(number_ / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }

  if (number_ >= 1000) {
    return `${(number_ / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }

  return number_;
}

export function formatCmsItem(text) {
  return text.replaceAll(/{(.*?)}/g, (m, translation) => {
    return i18n.global.t(translation);
  });
}

export function numeral(value: number, type: string | null = null) {
  let formatter = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
  if (type === 'currency') {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
  if (type === 'percentage') {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  return formatter.format(value || 0);
}
