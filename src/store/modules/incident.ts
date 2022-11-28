import Incident from "../../models/Incident";
import State from "@vuex-orm/core/dist/src/model/contracts/State";

const AppState = {
  currentIncidentId: null,
};

// getters
const getters = {
  currentIncidentId: (state: State) => state.currentIncidentId,

  currentIncident: (state: State) =>
    state.currentIncidentId ? Incident.find(state.currentIncidentId) : null,
};

// actions
const actions = {};

// mutations
const mutations = {
  setCurrentIncidentId(state: State, currentIncidentId: string) {
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
