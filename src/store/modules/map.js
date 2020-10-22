const mapState = {
  autocompleteToken: null,
};

// getters
const getters = {
  autocompleteToken: (state) => {
    return state.autocompleteToken;
  },
};

// actions
const actions = {};

// mutations
const mutations = {
  setAutocompleteToken(state, token) {
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
