import State from "@vuex-orm/core/dist/src/model/contracts/State";

const AppState = {
  worksitesLoading: false,
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
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
