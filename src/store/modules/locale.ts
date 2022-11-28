import State from "@vuex-orm/core/dist/src/model/contracts/State";

const AppState = {
  language: null,
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  setLanguage(state: State, language: any) {
    state.language = language;
  },
};

export default {
  namespaced: true,
  state: AppState,
  getters,
  actions,
  mutations,
};
