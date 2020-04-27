import Incident from '@/models/Incident';

const AppState = {
  currentIncidentId: null,
};

// getters
const getters = {
  currentIncident: (state) =>
    state.currentIncidentId ? Incident.find(state.currentIncidentId) : null,
};

// actions
const actions = {};

// mutations
const mutations = {
  setCurrentIncidentId(state, currentIncidentId) {
    state.currentIncidentId = currentIncidentId
      ? parseInt(currentIncidentId)
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
