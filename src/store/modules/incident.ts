import type State from '@vuex-orm/core/dist/src/model/contracts/State';
import Incident from '../../models/Incident';

const AppState = {
  currentIncidentId: null,
};

// Getters
const getters = {
  currentIncidentId: (state: State) => state.currentIncidentId,

  currentIncident: (state: State) =>
    state.currentIncidentId ? Incident.find(state.currentIncidentId) : null,
};

// Actions
const actions = {};

// Mutations
const mutations = {
  setCurrentIncidentId(state: State, currentIncidentId: string) {
    state.currentIncidentId = currentIncidentId
      ? Number.parseInt(currentIncidentId)
      : currentIncidentId;
  },
};

export default {
  namespaced: true,
  state: AppState,
  getters,
  actions,
  mutations,
};
