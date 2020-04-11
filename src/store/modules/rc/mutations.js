/**
 * mutations.js
 * RingCentral Store
 * Mutations
 */

import * as types from './types';

export default {
  [types.SET_RC_CLIENT](state, client) {
    state.client = client;
  },
  [types.SET_AUTH_STATUS](state, newState) {
    state.authenticated = newState;
  },
};
