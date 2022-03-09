const AppState = {
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
  callType: null,
  languages: [],
  callHistory: null,
};

// getters
const getters = {
  getCallState: (state) => state.callState,
  getCallType: (state) => state.callType,
  getCaller: (state) => state.caller,
  getIncomingCall: (state) => state.incomingCall,
  getOutgoingCall: (state) => state.outgoingCall,
  getUser: (state) => state.user,
  getGateway: (state) => state.gateway,
  isTakingCalls: (state) => {
    return state.callState !== 'AWAY';
  },
  isNotTakingCalls: (state) => {
    return !(state.callState !== 'AWAY');
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
  isTransitioning: (state) => {
    return state.callState === 'TRANSITION';
  },
  getLanguages: (state) => state.languages,
};

// actions
const actions = {};

// mutations
const mutations = {
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
  setCallType(state, newType) {
    state.callType = newType;
  },
  clearCall(state) {
    state.call = null;
    state.incomingCall = null;
    state.outgoingCall = null;
    state.caller = null;
    state.callType = null;
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
  setCallHistory(state, callHistory) {
    state.callHistory = callHistory;
  },
  resetState(state) {
    Object.assign(state, {
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
      callType: null,
      languages: [],
      callHistory: null,
    });
  },
};

export default {
  namespaced: true,
  state: AppState,
  getters,
  actions,
  mutations,
};
