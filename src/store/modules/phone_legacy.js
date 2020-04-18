const AppState = {
  currentAgentId: localStorage.getItem('currentAgentId'),
  // currentSocket: new WebSocket('wss://c01-con.vacd.biz:8080/'),
  user: {},
  call: {},
  caller: {},
  gateway: {},
  needsWelcome: true,
  callState: 'AWAY',
  languages: [],
};

// getters
const getters = {
  getCallState: (state) => state.callState,
  getCaller: (state) => state.caller,
  getUser: (state) => state.user,
  getGateway: (state) => state.gateway,
  getCallCenterAccessible: (state) => {
    if (state.user == null) {
      return false;
    }
    return state.user.willing_to_receive_calls;
  },
  getLanguages: (state) => state.languages,
};

// actions
const actions = {};

// mutations
const mutations = {
  setCurrentAgentId(state, currentAgentId) {
    state.currentAgentId = currentAgentId
      ? parseInt(currentAgentId)
      : currentAgentId;
    localStorage.setItem('currentAgentId', currentAgentId);
  },
  setUser(state, user) {
    state.user = user;
  },
  setCall(state, call) {
    state.call = call;
  },
  setCaller(state, caller) {
    state.caller = caller;
  },
  setGateway(state, gateway) {
    state.gateway = gateway;
  },
  seenWelcome(state) {
    state.needsWelcome = false;
  },
  needsWelcome(state) {
    state.needsWelcome = true;
  },
  setState(state, newState) {
    state.callState = newState;
  },
  setLanguages(state, languages) {
    state.languages = languages;
  },
};

export default {
  namespaced: true,
  state: AppState,
  getters,
  actions,
  mutations,
};
