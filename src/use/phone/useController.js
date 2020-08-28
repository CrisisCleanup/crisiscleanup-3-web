// @flow
/**
 * Use Controller Hook
 */

import { useState, useActions, useGetters } from '@u3u/vue-hooks';

export default () => {
  const getters = {
    ...useGetters('phone.controller', [
      'activeCaseId',
      'activeCaseType',
      'modifiedCaseIds',
    ]),
  };

  const state = {
    ...useState('phone.controller', ['status', 'view']),
  };

  const actions = {
    ...useActions('phone.controller', [
      'addCase',
      'setCase',
      'setView',
      'updateStatus',
      'closeContact',
    ]),
  };

  return {
    getters,
    state,
    actions,
  };
};
