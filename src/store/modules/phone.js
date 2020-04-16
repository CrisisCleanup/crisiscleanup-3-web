import { EventBus } from '@/event-bus';
import Agent from '@/models/Agent';
import Language from '@/models/Language';
import Pda from '@/models/Pda';
import PhoneOutbound from '@/models/PhoneOutbound';
import PhoneResource from '@/models/PhoneResource';
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

const getStateDefaults = () => ({
  contact: {
    id: null,
    duration: null,
    state: null,
    type: null,
    attributes: {
      pdas: [],
      worksites: [],
      outboundIds: [],
      callerId: null,
    },
  },
  externalContact: {
    contactId: null,
    resourceId: null,
    mobile: null,
    duration: null,
    conferenced: false,
  },
  controller: {
    contactId: null,
    outboundId: null,
    cases: {
      pdas: [],
      worksites: [],
    },
    resolved: false,
    currentCase: {
      id: null,
      type: null,
    },
    status: {
      id: null,
      notes: '',
    },
    actions: {
      currentKey: 'case',
    },
    currentPage: 'dashboard',
  },
});

/**
 * @todo Refactor Phone and Split into multiple Stores
 * @body Split into Controller, Agent, Contact substores.
 */

const PhoneState = {
  agent: {},
  agentState: ConnectService.STATES.OFFLINE,
  agentConfig: null,
  metrics: {},
  connectRunning: false,
  connectAuthed: false,
  streams: null,
  popupOpen: false,
  credentials: SSO.retrieveCredentials(),
  hydrated: false,
  ...getStateDefaults(),
};

// getters
const getters = {
  agentId: (state) => (state.agent ? state.agent.agent_id : null),
  agentState: (state) =>
    state.agentState !== null
      ? state.agentState
      : ConnectService.STATES.OFFLINE,
  agentStateTimestamp: (state) =>
    state.agentStateTimestamp ? Date.parse(state.agentStateTimestamp) : null,
  agent: (state) => (state.agent ? Agent.find(state.agent.agent_id) : null),
  connectRunning: (state) => state.connectRunning, // is connect initialized?
  connectReady: (state) => !!(state.connectRunning && state.agentConfig), // is connect done w/ init and auth?
  popupOpen: (state) => state.popupOpen,
  authToken: (state) =>
    state.credentials ? state.credentials.AccessToken : '',
  agentAvailable: (state) =>
    state.agentState === ConnectService.STATES.ROUTABLE,
  callIncoming: (state) =>
    [
      ConnectService.STATES.AGENT_CALLING,
      ConnectService.STATES.PENDING_CALL,
      ConnectService.STATES.AGENT_PENDING,
    ].includes(state.agentState),
  agentOnCall: (state) => state.agentState === ConnectService.STATES.ON_CALL,
  contactState: (state) =>
    state.contact.id ? state.contact.state : ConnectService.STATES.POLLING,
  contactAttributes: (state) =>
    state.contact.attributes ? state.contact.attributes : {},
  callerId: (state) =>
    state.contact.attributes ? state.contact.attributes.callerId : '',
  pdas: (state) => (state.controller ? state.controller.cases.pdas : []),
  worksites: (state) =>
    state.controller ? state.controller.cases.worksites : [],
  callDuration: (state) => (state.contact ? state.contact.duration : 0),
  extCallDuration: (state) =>
    state.externalContact ? state.externalContact.duration : 0,
  currentCases: (state) => (state.controller ? state.controller.cases : {}),
  currentPdaId: (state) => {
    const {
      controller: { currentCase },
    } = state;
    if (currentCase.type === 'pda') {
      return currentCase.id;
    }
    return null;
  },
  casesResolved: (state) =>
    state.controller ? state.controller.resolved : false,
  currentCaseId: (state) => {
    const {
      controller: {
        currentCase: { id },
      },
    } = state;
    if (id) {
      return id;
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
      switch (type) {
        case 'pda':
          return Pda.find(id);
        case 'worksite':
          return Worksite.find(id);
        default:
          return null;
      }
    }
    return null;
  },
  outboundIds: (state) =>
    state.contact.attributes ? state.contact.attributes.outboundIds : [],
  currentOutbound: (state) => {
    const {
      controller: { outboundId, currentCase },
    } = state;
    if (outboundId) {
      return PhoneOutbound.find(outboundId);
    }
    if (currentCase) {
      const caseIdx = state.contact.attributes.pdas.indexOf(
        state.controller.currentCase.id,
      );
      const id = state.contact.attributes.outboundIds.filter((outId, idx) =>
        idx === caseIdx ? outId : false,
      );
      if (id) {
        return PhoneOutbound.find(id[0]);
      }
    }

    return null;
  },
  currentCaseType: (state) =>
    state.controller.currentCase ? state.controller.currentCase.type : null,
  caseStatusId: (state) =>
    state.controller.status ? state.controller.status.id : null,
  callerLocale: (state) => {
    const { contact } = state;
    if (!contact.attributes) return null;
    const { callerLocale } = contact.attributes;
    const lang = Language.query().where('subtag', callerLocale).first();
    if (!lang) {
      return Language.find(2);
    }
    return lang;
  },
  callType: (state) => (state.contact ? state.contact.type : null),
  currentActionTab: (state) =>
    state.controller.actions.currentKey
      ? state.controller.actions.currentKey
      : 'case',
  currentExternalContact: (state) =>
    state.externalContact.contactId ? state.externalContact : null,
  currentExternalResource: (state) => {
    if (!state.externalContact) return null;
    if (state.externalContact.resourceId) {
      return PhoneResource.find(state.externalContact.resourceId);
    }
    return null;
  },
  currentPage: (state) =>
    state.controller ? state.controller.currentPage : 'dashboard',
};

// actions
const actions = {
  async getRealtimeMetrics({ commit }) {
    const resp = await axios.get(PhoneApi('metrics'));
    const newState = {};
    // custom metrics
    const metric = ConnectService.METRICS;
    const metricNames = Object.keys(metric);
    resp.data.results.map(({ name, value }, idx) => {
      let metricName = name;
      if (!metricName) {
        metricName = metricNames[idx];
      }
      newState[camelCase(metricName)] = parseFloat(value);
      return newState;
    });
    // todo: the 0 is "calldowns"
    newState[metric.TOTAL_WAITING] =
      newState[metric.CONTACTS_QUEUED] + newState[metric.CALLBACKS_QUEUED] + 0;
    const needed = newState[metric.TOTAL_WAITING] - newState[metric.AVAILABLE];
    newState[metric.NEEDED] = needed >= 0 ? needed : 0;
    commit('setMetrics', newState);
    return resp;
  },
  async initConnect(
    { state, commit, dispatch, getters: { agentStateTimestamp } },
    htmlEl,
  ) {
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
    Log.debug('waiting for agent...');
    ConnectService.bindAgentEvents({
      onRefresh: async (agent) => {
        if (!state.connectRunning) {
          Log.debug('got initial agent agent!');
          const agentConfig = await agent.getConfiguration();
          Log.debug('got agent config: ', agentConfig);
          commit('setConnectState', {
            running: true,
            authed: true,
            config: agentConfig,
          });
        }
        const rawAgentState = await agent.getState();
        Log.debug('raw agent state: ', rawAgentState);
        const { startTimestamp } = rawAgentState;
        if (agentStateTimestamp && agentStateTimestamp > startTimestamp) {
          Log.debug('disregarding connect agent state, is stale.');
          return;
        }
        const agentState = ConnectService.parseAgentState(rawAgentState);
        Log.debug('new agent state inbound:', agentState);
        commit('setAgentState', agentState);
      },
    });
    ConnectService.bindContactEvents({
      onIncoming: (contact) => {
        Log.debug('incoming callback!');
        commit('setContact', { type: 'outbound' });
        contact.accept();
      },
      onConnecting: () => {
        Log.debug('connecting to contact, triggering controller...');
        dispatch('setCurrentPage', 'controller');
      },
      onRefresh: (contact) => {
        // Keep our contact state
        // in sync with connect
        Log.debug('contact refreshed!');
        dispatch('syncContact', contact);
      },
    });
  },
  async setPopup({ commit }, state = true) {
    Log.debug('setting popup:', state);
    ConnectService.setPopup({ open: state });
    commit('setPopupState', state);
  },
  async setAgentState({ commit, dispatch, getters: { agentId } }, state) {
    let aId = agentId;
    if (!aId) {
      aId = await dispatch('getAgent');
    }
    commit('setAgentState', state);
    ConnectService.setAgentState(state);
  },
  async setAgent({ commit }, agent) {
    commit('setAgent', agent);
  },
  async getAgent({ commit, rootState }) {
    const userAgent = {
      user: {
        id: rootState.auth.user.user_claims.id,
        email: rootState.auth.user.user_claims.email,
      },
    };
    const agent = await Agent.api().fetch(userAgent);
    commit('setAgent', agent);
    return agent.agent_id;
  },
  async syncDynamicState({
    dispatch,
    getters: { agentId, agentStateTimestamp, agentState },
  }) {
    // Sync dynamic states
    //   * pendingCall -> offline
    //   * routable -> offline (heartbeat)
    //   * etc.
    Log.debug('syncing dynamic agent state...');
    if (!agentId) {
      return dispatch('getAgent');
    }
    const response = await Agent.api().getDynamicState(agentId);
    Log.debug('dynamic state response:', response);
    const { state, entered_timestamp } = response;
    const entered = Date.parse(entered_timestamp);
    if (state === ConnectService.STATES.STATIC) {
      Log.debug('current state is not dynamic!');
      return state;
    }
    if (agentStateTimestamp && entered > agentStateTimestamp) {
      Log.debug('dynamic state is stale! disregarding...');
      return null;
    }
    if (!agentState === state) {
      Log.debug('no state change, ignoring...');
    }
    Log.debug('got new dynamic state!', state);
    return ConnectService.setAgentState(state);
  },
  async syncCallDuration({ commit, getters: { currentExternalContact } }) {
    const agent = ConnectService.getAgent();
    const [contact] = agent.getContacts();
    commit('setContact', {
      duration: contact.getStatusDuration(),
    });
    if (currentExternalContact) {
      const extConnection = agent
        .getContacts()[0]
        .getConnections()
        .find((c) => c.connectionId === currentExternalContact.connectionId);

      if (extConnection) {
        commit('setExternalContact', {
          duration: extConnection.getStatusDuration(),
        });
      }
    }
    return this.callDuration;
  },
  async syncExternalContact(
    { commit, getters: { currentExternalContact, currentExternalResource } },
    newExternalConnection = null,
  ) {
    const contact = ConnectService.getCurrentContact();
    const agent = ConnectService.getAgent();
    let externalConnection = newExternalConnection;
    if (!externalConnection) {
      [externalConnection] = contact.getThirdPartyConnections();
    }
    if (!externalConnection) {
      Log.debug('no external contact found...');
      return;
    }
    Log.debug('found external connection during sync!', externalConnection);
    const externalContactId = externalConnection.getContactId();
    if (!externalContactId) {
      return;
    }
    const externalContact = agent
      .getContacts()
      .find((c) => c.contactId === externalContactId);
    Log.debug(
      'seems to be a new contact, waiting for complete connection...',
      externalContact,
      currentExternalContact,
    );
    if (externalContact) {
      if (currentExternalContact) {
        if (externalContact.isConnected() && !externalContact.conferenced) {
          Log.debug('external contact connected!');
          Log.debug('now conferencing connections...');
          contact.conferenceConnections({
            success: () => Log.debug('call conferenced!'),
            failure: () =>
              Log.debug('conference failed, is the contact ready?'),
          });
          commit('setExternalContact', { conferenced: true });
        }
      }
      commit('setExternalContact', {
        contactId: externalContact.contactId,
        connectionId: externalConnection.connectionId,
      });
      if (!currentExternalResource) {
        const resourceMobile = externalConnection.getAddress().phoneNumber;
        const resource = PhoneResource.query()
          .where('dnis', resourceMobile)
          .first();
        Log.debug(
          'tried to resolve resource by external contact number:',
          resource,
          resourceMobile,
        );
        if (resource) {
          commit('setExternalContact', {
            resourceId: resource.id,
            mobile: resource.dnis,
          });
        }
      }
    }
  },
  async syncContact({ commit, state, dispatch }, newContact = null) {
    Log.debug('syncing current contact...');
    let contact = newContact;
    if (!newContact) {
      contact = ConnectService.getCurrentContact();
    }
    if (!contact) {
      Log.debug('no contact found!');
      return null;
    }
    const contactId = contact.getContactId();
    const contactState = contact.getStatus();
    const duration = contact.getStatusDuration();
    const contactAttrs = contact.getAttributes();
    const initConnection = contact.getInitialConnection();
    const connectType = initConnection.getType();
    Log.debug('got contact attributes:', contactAttrs);
    const {
      pdas,
      worksites,
      callerID,
      InboundNumber,
      ids,
      USER_LANGUAGE,
    } = contactAttrs;
    Log.debug('contact refresh: ', contactState);
    const workSites = worksites.value.split(',').filter((v) => v !== '');
    const Pdas = pdas.value.split(',').filter((v) => v !== '');
    const outboundIds = ids.value.split(',').filter((v) => v !== '');
    const locale = USER_LANGUAGE.value.replace('_', '-');
    let callerNum = callerID;
    if (!callerNum) {
      callerNum = InboundNumber;
    }
    const attributes = {
      callerId: callerNum.value,
      worksites: workSites,
      pdas: Pdas,
      outboundIds,
      callerLocale: locale,
    };
    commit('setContact', {
      id: contactId,
      duration,
      state: contactState.type,
      type: connectType,
      attributes,
    });
    if (!state.hydrated) {
      dispatch('rehydrateController');
    }
    if (state.contact.state === ConnectService.STATES.CONNECTED) {
      dispatch('setCurrentPage', 'controller');
    }
    EventBus.$emit(ConnectService.EVENTS.INBOUND, attributes);
    dispatch('syncExternalContact');
    commit('setControllerState', { contactId });
    return contact;
  },
  async stashController({ state }) {
    // store controller state
    const { controller } = state;
    Log.debug('stashing controller state...', controller);
    localStorage.setItem('ccu-ivr-ctrl', JSON.stringify(controller));
    return controller;
  },
  async rehydrateController({ state, commit, dispatch }) {
    // rehydrate controller state from cookie
    Log.debug('rehydrating controller...');
    commit('setHydrated', true);
    const ctrlState = JSON.parse(localStorage.getItem('ccu-ivr-ctrl'));
    if (!ctrlState) {
      Log.debug('controller rehydration bailed, no state found!');
      return null;
    }
    Log.debug('stored state:', ctrlState);
    if (state.contact.id && state.contact.id === ctrlState.contactId) {
      Log.debug('success! controller rehydrated.');
      commit('setControllerState', ctrlState);
      if (state.contact.state === ConnectService.STATES.CONNECTED) {
        dispatch('setCurrentPage', 'controller');
      }
      return ctrlState;
    }
    Log.debug('controller rehydration bailed, contact state mismatch!', {
      id: state.contact.id,
      contactId: ctrlState.contactId,
    });
    return ctrlState;
  },
  async addCases({ state, commit, dispatch }, { worksites, pdas }) {
    const { controller } = state;
    const newWorksites = new Set([
      ...controller.cases.worksites,
      ...(worksites || []),
    ]);
    const newPdas = new Set([...controller.cases.pdas, ...(pdas || [])]);
    const newCases = {
      worksites: Array.from(newWorksites),
      pdas: Array.from(newPdas),
    };
    commit('setControllerState', { cases: newCases });
    dispatch('stashController');
  },
  async setResolved({ commit }, resolved) {
    commit('setControllerState', {
      resolved,
    });
  },
  async endCurrentCall(
    { commit, getters: { currentExternalContact } },
    { external = false },
  ) {
    Log.debug('ending an active call!');
    if (!external) {
      ConnectService.endContactCall();
      commit('setContact', getStateDefaults().contact);
      return;
    }
    if (currentExternalContact) {
      ConnectService.endContactCall(currentExternalContact.connectionId);
      commit('setExternalContact', getStateDefaults().externalContact);
    }
  },
  async setCurrentCase({ commit }, currentCase) {
    commit('setCurrentCase', currentCase);
  },
  async setCaseStatus({ commit }, status) {
    commit('setStatus', status);
  },
  async setOutboundId({ commit }, id) {
    commit('setOutboundId', id);
  },
  async setContactState({ commit }, newState) {
    commit('setContact', { state: newState });
  },
  async syncAgentConfig({ state, commit }) {
    if (state.connectAuthed) {
      const agent = ConnectService.getAgent();
      const config = await agent.getConfiguration();
      commit('setAgentConfig', config);
    }
  },
  async resetState({ commit }) {
    commit('resetState');
  },
  async acceptCallback() {
    const agent = ConnectService.getAgent();
    const contact = agent.getContacts()[0];
    Log.debug('accepting callback!', contact);
    if (contact) {
      contact.accept();
    }
  },
  async closeContact({
    dispatch,
    getters: { currentOutbound, caseStatusId, agentOnCall, agentId },
  }) {
    Log.debug('ending contact...');
    if (!caseStatusId) {
      throw new Error('~~You must set a Call Status!');
    }
    if (currentOutbound) {
      Log.debug('updating outbound status with:', caseStatusId);
      await PhoneOutbound.api().updateStatus(currentOutbound.id, {
        statusId: caseStatusId,
      });
    }
    if (agentOnCall) {
      Log.debug('agent still on call, hanging up...');
      await dispatch('endCurrentCall');
    } else {
      await Agent.setDynamicState(
        agentId,
        ConnectService.STATES.ROUTABLE,
        true,
      );
      dispatch('setCurrentPage', 'dashboard');
    }
  },
  async setActionTab({ commit }, key) {
    commit('setAgentActions', { currentKey: key });
  },
  async addContact({ commit }, { mobile, ...resource }) {
    Log.debug('adding contact...', mobile);
    ConnectService.addContact(mobile, {
      success: () =>
        commit('setExternalContact', {
          mobile,
          ...resource,
        }),
    });
  },
  async setCurrentPage({ commit }, key) {
    Log.debug('setting current phone page:', key);
    commit('setControllerState', { currentPage: key });
  },
};

// mutations
const mutations = {
  setAgent(state, agent) {
    state.agent = agent;
  },
  setAgentConfig(state, newState) {
    state.agentConfig = {
      ...state.agentConfig,
      ...newState,
    };
  },
  setMetrics(state, newState) {
    state.metrics = newState;
  },
  setAgentState(state, newState) {
    state.agentState = newState;
    state.agentStateTimestamp = new Date().toISOString();
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
  setControllerState(state, newState) {
    state.controller = {
      ...state.controller,
      ...newState,
    };
  },
  setCurrentCase(state, currentCase) {
    state.controller.currentCase = {
      ...state.controller.currentCase,
      ...currentCase,
    };
  },
  setStatus(state, newStatus) {
    state.controller.status = {
      ...state.controller.status,
      ...newStatus,
    };
  },
  setOutboundId(state, newId) {
    state.controller.outboundId = newId;
  },
  setHydrated(state, hydrateState) {
    state.hydrated = hydrateState;
  },
  setAgentActions(state, newState) {
    state.controller.actions = {
      ...state.actions,
      ...newState,
    };
  },
  setExternalContact(state, newState) {
    state.externalContact = {
      ...state.externalContact,
      ...newState,
    };
  },
  resetState(state) {
    Object.assign(state, {
      ...state,
      ...getStateDefaults(),
    });
  },
};

export default {
  namespaced: true,
  state: PhoneState,
  getters,
  actions,
  mutations,
};
