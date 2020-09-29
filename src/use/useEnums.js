// @flow
/**
 * Enums Hook
 */

import { ICONS, ICON_MAP } from '@/constants';

export default () => {
  return {
    enums: {
      icons: ICONS,
      iconSvgs: ICON_MAP,
    },
  };
};
