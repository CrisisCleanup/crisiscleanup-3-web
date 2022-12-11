import type State from '@vuex-orm/core/dist/src/model/contracts/State';

const AppState = {
  language: null,
};

// Getters
const getters = {};

// Actions
const actions = {};

// Mutations
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
