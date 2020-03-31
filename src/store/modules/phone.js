import { EventBus } from '@/event-bus';
import Pda from '@/models/Pda';
import Worksite from '@/models/Worksite';
import * as ConnectService from '@/services/acs.service';
import * as SSO from '@/services/sso.service';
import { PhoneApi } from '@/utils/api';
import Logger from '@/utils/log';
import axios from 'axios';
import { camelCase } from 'lodash';

const Log = Logger({
  name: 'phone.store',
  middlewares: [
    (result) => {
      result.unshift('[phone.store] ');
      return result;
    },
  ],
});

const PhoneState = {
  agent: null,
  agentState: ConnectService.STATES.OFFLINE,
  contact: {
    id: null,
    duration: null,
    state: null,
    attributes: {
      pdas: [],
      worksites: [],
      callerId: null,
    },
  },
  controller: {
    currentCase: {
      id: null,
      type: null,
    },
  },
  agentConfig: null,
  metrics: {},
  connectRunning: false,
  connectAuthed: false,
  streams: null,
  popupOpen: false,
  credentials: SSO.retrieveCredentials(),
};

// getters
const getters = {
  agentId: (state) => (state.agent ? state.agent.agent_id : null),
  agentState: (state) =>
    state.agentState !== null
      ? state.agentState
      : ConnectService.STATES.OFFLINE,
  connectRunning: (state) => state.connectRunning, // is connect initialized?
  connectReady: (state) => state.connectRunning && state.agentConfig !== null, // is connect done w/ init and auth?
  popupOpen: (state) => state.popupOpen,
  authToken: (state) =>
    state.credentials ? state.credentials.AccessToken : '',
  agentAvailable: (state) =>
    state.agentState === ConnectService.STATES.ROUTABLE,
  callIncoming: (state) =>
    [ConnectService.STATES.INCOMING, ConnectService.STATES.CONNECTING].includes(
      state.contact ? state.contact.state : null,
    ),
  contactState: (state) =>
    state.contact.id ? state.contact.state : ConnectService.STATES.POLLING,
  contactAttributes: (state) =>
    state.contact.attributes ? state.contact.attributes : {},
  callerId: (state) =>
    state.contact.attributes ? state.contact.attributes.callerId : '',
  pdas: (state) =>
    state.contact.attributes ? state.contact.attributes.pdas : [],
  worksites: (state) =>
    state.contact.attributes ? state.contact.attributes.worksites : [],
  callDuration: (state) => (state.contact ? state.contact.duration : 0),
  currentPdaId: (state) => {
    const {
      controller: { currentCase },
    } = state;
    if (currentCase.type === 'pda') {
      return currentCase.id;
    }
    return null;
  },
  currentCase: (state) => {
    const {
      controller: {
        currentCase: { id, type },
      },
    } = state;
    if (id) {
      if (type === 'pda') {
        return Pda.find(id);
      }
      return Worksite.find(id);
    }
    return null;
  },
};

// actions
const actions = {
  async getRealtimeMetrics({ commit }) {
    const resp = await axios.get(PhoneApi('metrics'));
    const newState = {};
    resp.data.results.map(({ name, value }) => {
      newState[camelCase(name)] = parseFloat(value);
      return newState;
    });
    // custom metrics
    const metric = ConnectService.METRICS;
    const needed =
      newState[metric.CONTACTS_QUEUED] - newState[metric.AVAILABLE];
    newState[metric.NEEDED] = needed >= 0 ? needed : 0;
    commit('setMetrics', newState);
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
      onRefresh: (agent) => {
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
    });
    ConnectService.bindContactEvents({
      onRefresh: (contact) => {
        // Keep our contact state
        // in sync with connect
        const contactId = contact.getContactId();
        const contactState = contact.getStatus();
        const duration = contact.getStatusDuration();
        const contactAttrs = contact.getAttributes();
        const { pdas, worksites, callerID } = contactAttrs;
        Log.debug('got contact attributes:', contactAttrs);
        Log.debug('contact refresh: ', contactState);
        const workSites = worksites.value.split(',').filter((v) => v !== '');
        const Pdas = pdas.value.split(',').filter((v) => v !== '');
        const attributes = {
          callerId: callerID.value,
          worksites: workSites,
          pdas: Pdas,
        };
        EventBus.$emit(ConnectService.EVENTS.INBOUND, attributes);
        commit('setContact', {
          id: contactId,
          duration,
          state: contactState.type,
          attributes,
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
  async syncCallDuration({ commit }) {
    const agent = ConnectService.getAgent();
    const [contact] = agent.getContacts();
    commit('setContact', {
      duration: contact.getStatusDuration(),
    });
  },
  async setCurrentCase({ commit }, currentCase) {
    commit('setCurrentCase', currentCase);
  },
};

// mutations
const mutations = {
  setAgent(state, agent) {
    state.agent = agent;
  },
  setMetrics(state, newState) {
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
  setCurrentCase(state, currentCase) {
    state.controller.currentCase = {
      ...state.controller.currentCase,
      ...currentCase,
    };
  },
};

export default {
  namespaced: true,
  state: PhoneState,
  getters,
  actions,
  mutations,
};
