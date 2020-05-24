/**
 * UI Store Types.
 *
 */

import * as types from './types';

export default {
  [types.SET_BANNER](state, newState) {
    state.siteBanner = {
      ...state.siteBanner,
      ...newState,
    };
  },
};
