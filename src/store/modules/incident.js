const AppState = {
  currentIncidentId: null,
};

// getters
const getters = {};

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
