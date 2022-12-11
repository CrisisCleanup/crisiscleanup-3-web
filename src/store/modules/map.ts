import type State from '@vuex-orm/core/dist/src/model/contracts/State';

const mapState = {
  autocompleteToken: null,
};

// Getters
const getters = {
  autocompleteToken(state: State) {
    return state.autocompleteToken;
  },
};

// Actions
const actions = {};

// Mutations
const mutations = {
  setAutocompleteToken(state: State, token: string) {
    state.autocompleteToken = token;
  },
};

export default {
  namespaced: true,
  state: mapState,
  getters,
  actions,
  mutations,
};
