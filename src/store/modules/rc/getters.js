/**
 * getters.js
 * RingCentral Store
 * Getters
 */

const client = (state) => (state.client ? state.client : null);

const isAuthenticated = (state) => state.authenticated;

export default {
  client,
  isAuthenticated,
};
