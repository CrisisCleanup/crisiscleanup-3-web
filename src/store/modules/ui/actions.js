/**
 * UI Store Actions.
 *
 */
import Logger from '@/utils/log';
import * as Sentry from '@sentry/browser';
import * as types from './types';

const Log = Logger({
  name: 'ui.store',
  middlewares: [
    (result) => {
      result.unshift('[ui.store] ');
      return result;
    },
  ],
});

const validateBrowser = async ({ commit, getters: { isBrowserIE } }) => {
  if (isBrowserIE) {
    Log.warn('unsupported browser detected!');
    Sentry.setExtra('site_banner', 'browser_unsupported');
    commit(types.SET_BANNER, {
      enabled: true,
      text: this.$t('info.ie_not_supported'),
      type: types.BannerTypes.ERROR,
    });
  }
};

const dismissBanner = async ({ commit }) => {
  Log.debug('dismissing banner!');
  commit(types.SET_BANNER, {
    enabled: false,
  });
};

export default {
  validateBrowser,
  dismissBanner,
};
