/**
 * actions.js
 * Ring Central Actions
 */
import * as RCService from '@/services/rc.service.js';
import Logger from '@/utils/log';
import * as types from './types';

const Log = Logger({
  name: 'rc.store',
  middlewares: [
    (result) => {
      result.unshift('[rc.store] ');
      return result;
    },
  ],
});

const initialize = async ({ commit, getters: { client } }) => {
  let rc = client;
  if (client) {
    return client;
  }
  rc = RCService.initRingCentral();
  commit(types.SET_RC_CLIENT, rc);
  return rc;
};

const authenticate = async ({ commit, getters: { client } }) => {
  Log.debug('authenticating RC user...');
  const auth = RCService.authenticate(client);
  if (!auth) {
    return commit(types.SET_AUTH_STATUS, false);
  }
  return commit(types.SET_AUTH_STATUS, true);
};

export default {
  initialize,
  authenticate,
};
