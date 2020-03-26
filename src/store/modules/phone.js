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
  contact: {
    id: null,
    duration: null,
    state: null,
  },
  agentConfig: null,
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
  agentState: state =>
    state.agentState !== null
      ? state.agentState
      : ConnectService.STATES.OFFLINE,
  connectRunning: state => state.connectRunning, // is connect initialized?
  connectReady: state => state.connectRunning && state.agentConfig !== null, // is connect done w/ init and auth?
  popupOpen: state => state.popupOpen,
  authToken: state => (state.credentials ? state.credentials.AccessToken : ''),
  agentAvailable: state => state.agentState === ConnectService.STATES.ROUTABLE,
  callIncoming: state =>
    [ConnectService.STATES.INCOMING, ConnectService.STATES.CONNECTING].includes(
      state.contact ? state.contact.state : null,
    ),
  contactState: state =>
    state.contact.id ? state.contact.state : ConnectService.STATES.POLLING,
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
      onRefresh: agent => {
        if (!getters.connectReady) {
          Log.debug('got initial agent agent!');
          commit('setConnectState', { running: true, authed: true });
        }
        commit('setAgentState', { newState: null, agent });
      },
      onAuth: (ag, agentConf) =>
        commit('setConnectState', {
          running: true,
          authed: true,
          config: agentConf,
        }),
      onStateChange: ({ agent, newState }) =>
        commit('setAgentState', { newState, agent }),
    });
    ConnectService.bindContactEvents({
      onRefresh: contact => {
        const contactId = contact.getContactId();
        const contactState = contact.getStatus();
        const duration = contact.getStatusDuration();
        Log.debug('contact refresh: ', contactState);
        commit('setContact', {
          id: contactId,
          duration,
          state: contactState.type,
        });
      },
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
    if (agent && newState === null) {
      agentState = agent.getState();
      agentState = ConnectService.parseAgentState(agentState);
    }
    Log.debug('new state inbound:', agentState);
    state.agentState = agentState;
  },
  setConnectState(state, { running, authed, config }) {
    state.connectRunning = running;
    state.connectAuthed = authed;
    state.agentConfig = config;
  },
  setPopupState(state, newState) {
    state.popupOpen = newState;
  },
  setContact(state, newState) {
    state.contact = { ...state.contact, ...newState };
  },
};

export default {
  namespaced: true,
  state: PhoneState,
  getters,
  actions,
  mutations,
};
