const AppState = {
  currentAgentId: localStorage.getItem('currentAgentId'),
  user: {},
  call: null,
  incomingCall: null,
  outgoingCall: null,
  stats: {},
  agentStats: {},
  caller: null,
  gateway: {},
  needsWelcome: true,
  callState: 'AWAY',
  languages: [],
};

// getters
const getters = {
  getCallState: (state) => state.callState,
  getCaller: (state) => state.caller,
  getIncomingCall: (state) => state.incomingCall,
  getOutgoingCall: (state) => state.outgoingCall,
  getUser: (state) => state.user,
  getGateway: (state) => state.gateway,
  isTakingCalls: (state) => {
    return state.callState !== 'AWAY';
  },
  isOnCall: (state) => {
    return (
      state.callState === 'ENGAGED-INBOUND' ||
      state.callState === 'ENGAGED-OUTBOUND'
    );
  },
  isInboundCall: (state) => {
    return state.callState === 'ENGAGED-INBOUND';
  },
  isOutboundCall: (state) => {
    return state.callState === 'ENGAGED-OUTBOUND';
  },
  getLanguages: (state) => state.languages,
};

// actions
const actions = {};

// mutations
const mutations = {
  setCurrentAgentId(state, currentAgentId) {
    if (!currentAgentId) {
      localStorage.removeItem('currentAgentId');
      return;
    }
    state.currentAgentId = currentAgentId
      ? parseInt(currentAgentId)
      : currentAgentId;
    localStorage.setItem('currentAgentId', currentAgentId);
  },
  setUser(state, user) {
    state.user = user;
  },
  setCurrentCall(state, call) {
    state.call = call;
  },
  setIncomingCall(state, call) {
    state.incomingCall = call;
  },
  setOutgoingCall(state, call) {
    state.outgoingCall = call;
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
  setGeneralStats(state, stats) {
    state.stats = stats;
  },
  setAgentStats(state, stats) {
    state.agentStats = stats;
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
