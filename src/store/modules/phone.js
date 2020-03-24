import * as ConnectService from '@/services/acs.service';
import * as SSO from '@/services/sso.service';
import { PhoneApi } from '@/utils/api';
import VueLog from '@dreipol/vue-log';
import axios from 'axios';
import { camelCase } from 'lodash';
import Vue from 'vue';

Vue.use(VueLog, {
  name: 'phone.store',
  middlewares: [
    result => {
      result.unshift('[phone.store] ');
      return result;
    },
  ],
});
const Log = Vue.log();

const PhoneState = {
  agent: null,
  agentState: ConnectService.STATES.OFFLINE,
  metrics: null,
  connectRunning: false,
  connectAuthed: false,
  streams: null,
  popupOpen: false,
  credentials: SSO.retrieveCredentials(),
};

// getters
const getters = {
  agentId: state => (state.agent ? state.agent.agent_id : null),
  connectRunning: state => state.connectRunning, // is connect initialized?
  connectReady: state => !!state.streams, // is connect done w/ init and auth?
  popupOpen: state => state.popupOpen,
  authToken: state => (state.credentials ? state.credentials.AccessToken : ''),
  agentAvailable: state => state.agentState === ConnectService.STATES.AVAILABLE,
};

// actions
const actions = {
  async getRealtimeMetrics({ commit }) {
    const resp = await axios.get(PhoneApi('metrics'));
    commit('setMetrics', resp.data.results);
    return resp;
  },
  async initConnect({ commit }, htmlEl) {
    try {
      ConnectService.initConnect({
        htmlEl,
        config: { authToken: getters.authToken(PhoneState) },
        onAuth: () =>
          commit('setConnectState', { running: true, authed: true }),
        // refresh session
        onTimeout: () => this.setPopup(true),
      });
    } catch (e) {
      /**
       * @todo Debug Hidden ValueError on ACS Init
       * @body aws-connect-streams consistently raises a ValueError on startup.
       *       Seems to be harmless...
       */
      Log.error(e);
    }
    ConnectService.initAgent({
      onRefresh: agent => commit('setAgentState', { newState: null, agent }),
      onAuth: () => commit('setConnectState', { running: true, authed: true }),
    });
  },
  async setPopup({ commit }, state = true) {
    Log.debug('setting popup:', state);
    ConnectService.setPopup({ open: state });
    commit('setPopupState', state);
  },
  async setAgentState({ commit }, state) {
    ConnectService.setAgentState(state);
    commit('setAgentState', { newState: state });
  },
};

// mutations
const mutations = {
  setAgent(state, agent) {
    state.agent = agent;
  },
  setMetrics(state, metrics) {
    const newState = {};
    metrics.map(({ name, value }) => {
      newState[camelCase(name)] = parseFloat(value);
      return newState;
    });
    state.metrics = newState;
  },
  setAgentState(state, { newState, agent }) {
    let agentState = newState;
    if (agent) {
      agentState = agent.getState();
      agentState = ConnectService.parseAgentState(agentState);
    }
    Log.debug('new state inbound:', agentState);
    state.agentState = agentState;
  },
  setConnectState(state, { running, authed }) {
    state.connectRunning = running;
    state.connectAuthed = authed;
  },
  setPopupState(state, newState) {
    state.popupOpen = newState;
  },
};

export default {
  namespaced: true,
  state: PhoneState,
  getters,
  actions,
  mutations,
};
