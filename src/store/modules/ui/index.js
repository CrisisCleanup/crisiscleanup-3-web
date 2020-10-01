/**
 * UI Store Root.
 *
 * Handles generic UI states.
 */

import actions from './actions';
import getters from './getters';
import mutations from './mutations';
import * as types from './types';

const getStateDefaults = () => ({
  browser: {
    userAgent: navigator.userAgent,
  },
  siteBanner: {
    enabled: false,
    text: '',
    component: null,
    type: types.BannerTypes.ERROR,
  },
});

const UIState = {
  ...getStateDefaults(),
};

export default {
  namespaced: true,
  state: UIState,
  actions,
  getters,
  mutations,
};
