import type State from '@vuex-orm/core/dist/src/model/contracts/State';

const AppState = {
  worksitesLoading: false,
};

// Getters
const getters = {};

// Actions
const actions = {};

// Mutations
const mutations = {
  setWorksitesLoading(state: State, worksitesLoading: boolean) {
    state.worksitesLoading = worksitesLoading;
  },
};

export default {
  namespaced: true,
  state: AppState,
  getters,
  actions,
  mutations,
};
