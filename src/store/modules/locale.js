const AppState = {
  language: null,
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  setLanguage(state, language) {
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
