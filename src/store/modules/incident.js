const state = {
  currentIncidentId: null,
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  setCurrentIncidentId(state, currentIncidentId) {
    state.currentIncidentId = currentIncidentId;
  },
};

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
