import { EventBus } from '@/event-bus';
import Agent from '@/models/Agent';
import Incident from '@/models/Incident';
import Language from '@/models/Language';
import Pda from '@/models/Pda';
import PhoneDnis from '@/models/PhoneDnis';
import PhoneInbound from '@/models/PhoneInbound';
import PhoneOutbound from '@/models/PhoneOutbound';
import PhoneResource from '@/models/PhoneResource';
import Worksite from '@/models/Worksite';
import * as ConnectService from '@/services/acs.service';
import { PhoneApi } from '@/utils/api';
import Logger from '@/utils/log';
import axios from 'axios';
import { camelCase, delay, isInteger, once, orderBy } from 'lodash';

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
      incidentId: null,
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
    currentDnis: null,
    currentInbound: null,
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
  agentMetrics: {},
  contactMetrics: [],
  connectRunning: false,
  connectAuthed: false,
  streams: null,
  popupOpen: false,
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
  currentContactId: (state) => (state.contact.id ? state.contact.id : null),
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
  currentInbound: (state) => {
    const { controller } = state;
    if (!controller.currentInbound) return null;
    return PhoneInbound.find(controller.currentInbound);
  },
  currentCaseType: (state) =>
    state.controller.currentCase ? state.controller.currentCase.type : null,
  caseStatusId: (state) =>
    state.controller.status ? state.controller.status.id : null,
  caseStatusNotes: (state) =>
    state.controller.status ? state.controller.status.notes : null,
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
  callType: (state) => (state.controller.outboundId ? 'outbound' : 'inbound'),
  currentActionTab: (state) =>
    state.controller.actions.currentKey
      ? state.controller.actions.currentKey
      : 'case',
  currentExternalContact: (state) =>
    state.externalContact && state.externalContact.contactId
      ? state.externalContact
      : null,
  currentExternalResource: (state) => {
    if (!state.externalContact) return null;
    if (state.externalContact.resourceId) {
      return PhoneResource.find(state.externalContact.resourceId);
    }
    return null;
  },
  currentDnis: (state) => {
    const { controller } = state;
    if (!controller.currentDnis) return null;
    return PhoneDnis.find(controller.currentDnis);
  },
  currentPage: (state) =>
    state.controller ? state.controller.currentPage : 'dashboard',
  currentAniIncident: (state) =>
    state.contact.attributes
      ? Incident.find(state.contact.attributes.incidentId)
      : null,
  contactMetrics: (state) => (state.contactMetrics ? state.contactMetrics : []),
  agentBoard: (state) =>
    state.agentMetrics
      ? orderBy(Object.values(state.agentMetrics), ['total_calls'], ['desc'])
      : [],
};

// actions
export const actions = {
  async getRealtimeMetrics({ commit, state }, { metrics } = {}) {
    let metricData = metrics;
    if (!metricData) {
      Log.debug('falling back to api to fetch metrics...');
      const resp = await axios.get(PhoneApi('metrics'));
      metricData = resp.data.results;
    }
    const newState = {};
    // custom metrics
    const metric = ConnectService.METRICS;
    const metricNames = Object.keys(metric);
    metricData.map(({ name, value }, idx) => {
      let metricName = name;
      if (!metricName) {
        metricName = metricNames[idx];
      }
      const parsedValue = parseFloat(value) || 0;
      // prevents 'fake' realtime values from going negative
      // till the true metrics come in
      newState[camelCase(metricName)] = parsedValue >= 0 ? parsedValue : 0;
      return newState;
    });
    // set default values of 0
    newState[metric.TOTAL_WAITING] = newState[metric.TOTAL_WAITING] || 0;
    newState[metric.NEEDED] = newState[metric.NEEDED] || 0;
    const updatedKeys = Object.keys(newState);
    const numCallbacks = updatedKeys.includes(metric.CALLBACKS_QUEUED)
      ? newState[metric.CALLBACKS_QUEUED]
      : state.metrics[metric.CALLBACKS_QUEUED];
    const numQueued = updatedKeys.includes(metric.CONTACTS_QUEUED)
      ? newState[metric.CONTACTS_QUEUED]
      : state.metrics[metric.CONTACTS_QUEUED];
    const numOnline = updatedKeys.includes(metric.ONLINE)
      ? newState[metric.ONLINE]
      : state.metrics[metric.ONLINE];
    // count up needed and total if required values exists
    // todo: the 0 is "calldowns"
    const totalWaiting = numCallbacks + numQueued + 0;
    newState[metric.TOTAL_WAITING] =
      typeof totalWaiting === 'number' ? totalWaiting : 0;
    const agentCapacity = 12 * numOnline; // each agent can take 12 calls
    const queueOverflow = totalWaiting - agentCapacity; // number of callers over the capacity
    Log.debug('current queue capacity overflow:', queueOverflow);
    const needed = queueOverflow >= 1 ? Math.ceil(queueOverflow / 12) : 0;
    newState[metric.NEEDED] = needed;
    Log.debug('new metrics:', newState);
    commit('setMetrics', newState);
  },
  async getAgentMetrics({ commit }, { agents }) {
    const agentBoard = {};
    await Promise.all(
      agents.map(async ({ agent_id, state }) => {
        await Agent.api().get(`/agents/${agent_id}`);
        const metrics = await Agent.api().getMetrics(agent_id);
        agentBoard[agent_id] = {
          ...metrics,
          currentState: state,
        };
      }),
    );
    commit('setAgentMetrics', agentBoard);
  },
  async setContactMetrics({ commit }, { contacts }) {
    Log.debug('got contact metrics!', contacts);
    commit('setContactMetrics', contacts);
  },
  async initConnect(
    { state, commit, dispatch, getters: { agentStateTimestamp, agentId } },
    htmlEl,
  ) {
    try {
      await ConnectService.initConnect({
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
          Log.debug('got initial agent!');
          // Connect to web socket
          await dispatch('socket/connect', {}, { root: true });
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
      onAfterCallWork: async () => {
        Log.debug('agent entered ACW, going routable in 3m...');
        delay(
          async (currentState) => {
            if (currentState === ConnectService.STATES.PAUSED) {
              await dispatch('setAgentState', ConnectService.STATES.ROUTABLE);
              Log.debug('times up, going routable!');
            }
          },
          2900 * 60, // 2.9 minutes
          state.agentState,
        );
      },
    });
    ConnectService.bindContactEvents({
      onIncoming: async (contact) => {
        Log.debug('incoming callback!');
        await dispatch(
          'socket/send',
          {
            action: 'SET_AGENT_STATE',
            options: {
              includeMeta: true,
            },
            data: {
              agentId,
              agentState: state.agentState,
              currentContactId: contact.getInitialContactId(),
            },
          },
          { root: true },
        );
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
    await ConnectService.setPopup({ open: state });
    commit('setPopupState', state);
  },
  async setAgentState(
    { commit, dispatch, getters: { agentState, agentId } },
    state,
  ) {
    Log.debug('SETTING AGENT STATE:', state);
    let aId = agentId;
    if (!aId) {
      aId = await dispatch('getAgent');
    }
    let newState = state;
    if (typeof newState === 'object') {
      // websocket support for legacy param
      newState = state.state;
    }
    if (newState && newState !== null && newState !== agentState) {
      await dispatch(
        'socket/send',
        {
          action: 'SET_AGENT_STATE',
          options: {
            includeMeta: true,
          },
          data: {
            agentId: aId,
            agentState: newState,
          },
        },
        { root: true },
      );
    }
    commit('setAgentState', newState);
    await ConnectService.setAgentState(newState);
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
  async syncCallDuration({
    commit,
    getters: {
      currentExternalContact,
      agentOnCall,
      callDuration,
      extCallDuration,
    },
  }) {
    const agent = ConnectService.getAgent();
    const [contact] = agent.getContacts();
    if (!agentOnCall) {
      return callDuration;
    }
    const newDuration = contact.getStatusDuration();
    // if the status changes (call ended),
    // ignore the new durations
    if (newDuration > callDuration) {
      commit('setContact', {
        duration: newDuration,
      });
    }
    if (currentExternalContact) {
      const extConnection = agent
        .getContacts()[0]
        .getConnections()
        .find((c) => c.connectionId === currentExternalContact.connectionId);

      if (extConnection) {
        const extNewDuration = extConnection.getStatusDuration();
        if (extNewDuration > extCallDuration) {
          commit('setExternalContact', {
            duration: extNewDuration,
          });
        }
      }
    }
    return callDuration;
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
  async syncContact(
    {
      commit,
      state,
      dispatch,
      getters: { agentState, agentId, contactState, currentInbound },
    },
    newContact = null,
  ) {
    Log.debug('syncing current contact...');
    let contact = newContact;
    if (!newContact) {
      contact = ConnectService.getCurrentContact();
    }
    if (!contact) {
      Log.debug('no contact found!');
      return null;
    }
    const contactId = contact.getInitialContactId();
    const newContactState = contact.getStatus();
    const contactAttrs = contact.getAttributes();
    const initConnection = contact.getInitialConnection();
    const connectType = initConnection.getType();
    Log.debug('got contact attributes:', contactAttrs);
    const {
      pdas = { value: '' },
      worksites = { value: '' },
      callerID,
      InboundNumber,
      ids = { value: '' },
      USER_LANGUAGE,
      INCIDENT_ID,
      CALLBACK_NUMBER,
    } = contactAttrs;
    Log.debug('contact refresh: ', newContactState);
    const workSites = worksites.value.split(',').filter((v) => v !== '');
    const Pdas = pdas.value.split(',').filter((v) => v !== '');
    const outboundIds = ids.value.split(',').filter((v) => v !== '');
    const locale = USER_LANGUAGE.value.replace('_', '-');
    const incidentId = INCIDENT_ID.value ? INCIDENT_ID.value : '199';
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
      incidentId,
    };
    if (CALLBACK_NUMBER && outboundIds.length) {
      // call is an outbound
      await dispatch('setOutboundId', outboundIds[0]);
    }
    if (!currentInbound && !CALLBACK_NUMBER) {
      // call is in inbound
      await dispatch('setInboundId', contactId);
    }
    // resolve worksites
    const getSites = once(() =>
      Worksite.api().fetchByPhoneNumber(callerNum.value, incidentId),
    );
    const sites = await getSites();
    Log.debug('searched for pre-existing worksites, found:');
    Log.debug(sites);
    if (sites && sites.length) {
      attributes.worksites = [
        ...attributes.worksites,
        ...sites.map((s) => s.id),
      ];
    }
    if (newContactState.type !== contactState) {
      Log.debug('updating contact action...');
      await dispatch(
        'socket/send',
        {
          action: 'UPDATE_CONTACT',
          options: {
            includeMeta: true,
          },
          data: {
            contactId,
            action: newContactState.type,
          },
        },
        { root: true },
      );
    }
    commit('setContact', {
      id: contactId,
      state: newContactState.type,
      type: connectType,
      attributes,
    });
    await dispatch('getCurrentDnis');
    if (!state.hydrated) {
      await dispatch('rehydrateController');
    }
    if (state.contact.state === ConnectService.STATES.CONNECTED) {
      await dispatch('setCurrentPage', 'controller');
    }
    EventBus.$emit(ConnectService.EVENTS.INBOUND, attributes);
    await dispatch('syncExternalContact');
    commit('setControllerState', { contactId });
    let aId = agentId;
    if (!aId) {
      aId = await dispatch('getAgent');
    }
    await dispatch(
      'socket/send',
      {
        action: 'SET_AGENT_STATE',
        options: {
          includeMeta: true,
        },
        data: {
          agentId: aId,
          agentState,
        },
      },
      { root: true },
    );
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
    { external = false } = {},
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
    await PhoneOutbound.api().get(`/phone_outbound/${id}`);
    commit('setOutboundId', id);
  },
  async setInboundId({ commit }, sessionId) {
    const inbound = await PhoneInbound.api().fetchBySessionId(sessionId);
    commit('setControllerState', { currentInbound: inbound.id });
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
    getters: {
      currentOutbound,
      currentInbound,
      caseStatusId,
      caseStatusNotes,
      agentOnCall,
      currentCase,
      worksites,
      agentId,
    },
  }) {
    Log.debug('ending contact...');
    if (!caseStatusId) {
      throw new Error('~~You must set a Call Status!');
    }
    const callStatus = {
      statusId: caseStatusId,
      notes: caseStatusNotes,
      agentId,
      dnisMeta: {
        caller_name: currentCase ? currentCase.name : 'Unknown',
        cases: worksites.join(','),
      },
    };
    if (currentOutbound) {
      Log.debug('updating outbound status with:', callStatus);
      await PhoneOutbound.api().updateStatus(currentOutbound.id, callStatus);
    }
    if (currentInbound) {
      Log.debug('updating inbound status:', callStatus);
      await PhoneInbound.api().updateStatus(currentInbound.id, callStatus);
    }

    if (agentOnCall) {
      Log.debug('agent still on call, hanging up...');
      await dispatch('endCurrentCall');
    } else {
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
  async getCurrentDnis({ commit, state, getters: { currentDnis } }) {
    const { contact } = state;
    if (!contact.attributes) return;
    if (currentDnis !== null) return;
    const { callerId } = contact.attributes;
    const queryDnis = String(callerId).includes('+')
      ? Number(callerId.slice(1))
      : Number(callerId);
    let dnis = await PhoneDnis.query().where('dnis', queryDnis).first();
    if (!dnis) {
      await PhoneDnis.api().get(`/phone_dnis?dnis=${queryDnis}`, {
        dataKey: 'results',
      });
      dnis = await PhoneDnis.query().where('dnis', queryDnis).first();
    }
    commit('setControllerState', { currentDnis: dnis.id });
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
    state.metrics = { ...state.metrics, ...newState };
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
  setContact(state, { duration, ...newState }) {
    if (isInteger(duration)) {
      state.contact = { ...state.contact, ...newState, duration };
      return;
    }
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
  setAgentMetrics(state, newAgents) {
    state.agentMetrics = {
      ...state.agentMetrics,
      ...newAgents,
    };
  },
  setContactMetrics(state, metrics) {
    state.contactMetrics = metrics;
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
