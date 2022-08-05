/**
 * Use Controller Hook
 */

import { mapGetters, mapState, mapActions, useStore } from 'vuex';
import { computed } from 'vue';

export default () => {
  const store = useStore();
  const phoneStoreKey = 'phone.controller';
  const getterKeys = [
    'activeCaseId',
    'activeCaseType',
    'activeIncidentId',
    'modifiedCaseIds',
  ] as const;
  const getters = getterKeys.reduce((acc, key) => {
    acc[key] = computed(() => store.getters[phoneStoreKey][key]);
    return acc;
  }, {} as Record<typeof getterKeys[number], any>);

  const stateKeys = [
    'status',
    'view',
    'isServingOutbounds',
    'currentOutbound',
    'historicMetrics',
    'metrics',
  ] as const;
  const state = stateKeys.reduce((acc, key) => {
    acc[key] = computed(() => store.state[phoneStoreKey][key]);
    return acc;
  }, {} as Record<typeof stateKeys[number], any>);

  const actionKeys = [
    'addCase',
    'setCase',
    'setView',
    'updateStatus',
    'closeContact',
    'serveOutbound',
    'setServingOutbounds',
    'updateHistoricMetrics',
    'updateCallerHistory',
    'updateMetrics',
  ] as const;
  const actions_ = actionKeys.reduce((acc, key) => {
    acc[key] = mapActions(phoneStoreKey, key);
    return acc;
  }, {} as Record<typeof actionKeys[number], any>);
  const actions = {
    ...mapActions('phone.controller', [
      'addCase',
      'setCase',
      'setView',
      'updateStatus',
      'closeContact',
      'serveOutbound',
      'setServingOutbounds',
      'updateHistoricMetrics',
      'updateCallerHistory',
      'updateMetrics',
    ]),
  };

  return {
    getters,
    state,
    actions,
  };
};
