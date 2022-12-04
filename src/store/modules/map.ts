import State from '@vuex-orm/core/dist/src/model/contracts/State';

const mapState = {
  autocompleteToken: null,
};

// getters
const getters = {
  autocompleteToken: (state: State) => {
    return state.autocompleteToken;
  },
};

// actions
const actions = {};

// mutations
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
