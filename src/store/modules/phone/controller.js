// @flow

/**
 * phone Controller Store
 */
import * as Sentry from '@sentry/browser';
import {
  Action,
  getModule,
  Module,
  Mutation,
  MutationAction,
  VuexModule,
} from 'vuex-module-decorators';
import AgentClient from '@/models/phone/AgentClient';
import type {
  CaseType,
  MetricsStateT,
  PhoneMetric,
  PhoneMetricUpdate,
  StatusStateT,
  ViewStateT,
} from '@/store/modules/phone/types';
import store from '@/store';
import Logger from '@/utils/log';
import StreamsStore from '@/store/modules/phone/streams';
import _ from 'lodash';
import Agent from '@/models/Agent';
import Worksite from '@/models/Worksite';
import Pda from '@/models/Pda';
import Contact, { CallType, ContactActions } from '@/models/phone/Contact';
import PhoneOutbound from '@/models/PhoneOutbound';
import PhoneInbound from '@/models/PhoneInbound';
import User from '@/models/User';
import Incident from '@/models/Incident';

/**
 * Enum of possible controller pages.
 * @property DASHBOARD - Dashboard page (Standby).
 * @property CONTROLLER - Controller page (Active call).
 * @readonly
 * @enum {string}
 */
export const ControllerPages = Object.freeze({
  DASHBOARD: 'dashboard',
  CONTROLLER: 'controller',
});

/**
 * Enum of possible controller action tabs.
 * @property RESOURCES - Resource tab view.
 * @property CASE - Case form tab view.
 * @readonly
 * @enum {string}
 */
export const ControllerActionTabs = Object.freeze({
  CASE: 'case',
  RESOURCES: 'resources',
});

/**
 * Enum of phone system metrics and descriptions.
 * @prop ONLINE - Number of agents online.
 * @prop CONTACT_QUEUED - Number of contacts currently waiting in inbound queue.
 * @prop CALLBACKS_QUEUED - Number of callbacks remaining.
 * @prop AVAILABLE - Number of agents online and routable.
 * @prop AGENTS_ON_CALL - Number of agents currently talking.
 * @prop NEEDED - Calculated number of agents needed.
 * @prop TOTAL_WAITING - Total number of inbound/outbound contacts waiting.
 * @prop CALLDOWNS_QUEUED - Total number of calldowns queued.
 * @prop CALLBACKS_QUEUED_ALL - Total number of locked+unlocked callbacks.
 * @prop CALLDOWNS_QUEUED_ALL - Total number of locked+unlocked calldowns.
 * @type {Readonly<{AVAILABLE: [string, string], NEEDED: [string, string], CONTACTS_QUEUED: [string, string], TOTAL_WAITING: [string, string], CALLBACKS_QUEUED: [string, string], AGENTS_ON_CALL: [string, string], ONLINE: [string, string]}>}
 * @readonly
 * @enum {string[]}
 */
export const Metrics = Object.freeze({
  // note: translation takes place in component, $t not needed here.
  ONLINE: ['agentsOnline', 'phoneDashboard.volunteers_online'],
  CONTACTS_QUEUED: ['contactsInQueue', 'phoneDashboard.on_hold_now'],
  CALLBACKS_QUEUED: [
    'contactsInQueueOutbound',
    'phoneDashboard.remaining_callbacks',
    'phoneDashboard.total_count_missed_calls',
  ],
  AVAILABLE: ['agentsAvailable', 'phoneDashboard.volunteers_available'],
  AGENTS_ON_CALL: ['agentsOnCall', 'phoneDashboard.volunteers_on_phone'],
  NEEDED: ['agentsNeeded', 'phoneDashboard.additional_volunteers_needed'],
  TOTAL_WAITING: ['totalWaiting', 'phoneDashboard.total_people_waiting'],
  CALLDOWNS_QUEUED: [
    'contactsScheduledOutbound',
    'phoneDashboard.remaining_calldowns',
    'phoneDashboard.calldown_explanation',
  ],
  // admin metrics (includes unlocked+locked)
  CALLBACKS_QUEUED_ALL: [
    'contactsInQueueOutboundAll',
    'phoneDashboard.all_remaining_callbacks',
  ],
  CALLDOWNS_QUEUED_ALL: [
    'contactsScheduledOutboundAll',
    'phoneDashboard.all_remaining_callbacks',
  ],
});

export const Scripts: { [$Values<typeof CallType>]: string } = Object.freeze({
  [CallType.INBOUND]: 'phoneDashboard.inbound_script',
  [CallType.OUTBOUND]: 'phoneDashboard.outbound_script',
  [CallType.CALLDOWN]: 'phoneDashboard.calldown_script',
});

const Log = Logger({ name: 'phone.controller' });

@Module({
  store,
  dynamic: true,
  name: 'phone.controller',
  persist: true,
  namespaced: true,
})
class ControllerStore extends VuexModule {
  // active case
  currentCase: CaseType | null = null;

  // active call status
  status: StatusStateT = {
    statusId: null,
    notes: '',
    modified: [],
  };

  // user interface state
  view: ViewStateT = {
    page: ControllerPages.DASHBOARD,
    actionTab: ControllerActionTabs.CASE,
  };

  // history
  history = {
    resolvedCases: [],
  };

  // phone metrics
  metrics: MetricsStateT = {};

  // contact metrics
  contactMetrics = [];

  // agent metrics
  agentMetrics = {};

  // caller history
  callerHistory = [];

  // loading
  loading = {
    agentMetrics: true,
    callerHistory: true,
    historicMetrics: true,
    generalMetrics: true,
  };

  // is serving outbounds
  isServingOutbounds: boolean = true;

  // current outbound
  currentOutbound: typeof PhoneOutbound | null = null;

  // historic call metrics
  historicMetrics = {
    daily: [],
    aggregates: {},
  };

  get historicMetricsReady() {
    return !this.loading.historicMetrics;
  }

  get getGeneralMetrics() {
    return (metricOrder: PhoneMetric[], category = 'all') => {
      const metricMap = new Map<string, number>();
      metricOrder.map(([name, description]) => {
        return metricMap.set(
          description,
          _.get(this.metrics[category], name, 0),
        );
      });
      return metricMap;
    };
  }

  get agentRankings() {
    return _.orderBy(
      Object.values(this.agentMetrics),
      ['total_calls'],
      ['desc'],
    );
  }

  get agentMetricsReady() {
    return !this.loading.agentMetrics;
  }

  get callHistoryReady() {
    return !this.loading.callerHistory;
  }

  get callHistory() {
    return _.orderBy(
      _.uniqBy(this.callerHistory, 'completed_at'),
      ['completed_at'],
      ['desc'],
    );
  }

  get currentAgentMetrics() {
    if (this.loading.agentMetrics) return null;
    return this.agentRankings.find(
      (a) => a.user.id === this.context.rootGetters['auth/userId'],
    );
  }

  get activeCaseId() {
    return this.currentCase ? this.currentCase.id : -1;
  }

  get activeCaseType() {
    const isNew = _.toNumber(this.activeCaseId) === -1;
    if (isNew) return 'new';
    return this.currentCase instanceof Worksite ? Worksite : Pda;
  }

  get activeIncidentId() {
    return this.currentCase ? this.currentCase.incident : null;
  }

  get activeActionTab() {
    return _.get(this.view, 'actionTab', ControllerActionTabs.CASE);
  }

  get modifiedCaseIds() {
    return this.status.modified.map((c) => c.id);
  }

  get isCallActive() {
    return this.view.page === ControllerPages.CONTROLLER;
  }

  @Mutation
  setStatus(newStatus) {
    this.status = { ...this.status, ...newStatus };
    Sentry.setContext('phone.controller.status', this.status);
  }

  @Mutation
  setOutbound(newOutbound: PhoneOutbound | null) {
    this.currentOutbound = newOutbound;
    Sentry.setContext('phone.controller.outbound', this.currentOutbound);
  }

  @MutationAction({ mutate: ['isServingOutbounds'] })
  setServingOutbounds(serving: boolean) {
    return { isServingOutbounds: serving };
  }

  @MutationAction({ mutate: ['contactMetrics'] })
  updateContactMetrics({ contacts } = {}) {
    if (!_.isNull(contacts)) {
      return { contactMetrics: contacts };
    }
    return { contactMetrics: contacts };
  }

  @Action
  updateStatus({ statusId, notes, modified }: $Shape<StatusStateT> = {}) {
    Log.debug('updating call status!');
    this.setStatus({
      statusId: statusId === null ? statusId : statusId || this.status.statusId,
      notes: notes === null ? notes : notes || this.status.notes,
      modified: _.filter(modified, _.negate(_.isNil))
        ? _.unionBy<CaseType>(this.status.modified, modified, 'id')
        : _.filter(this.status.modified, _.negate(_.isNil)),
    });
  }

  @Action
  async addCase({
    contact,
    newCase,
  }: {
    contact: Contact,
    newCase: typeof Worksite,
  }) {
    Log.info('adding new case:', contact, newCase);
    if (this.activeCaseType === Pda) {
      Log.info('associating worksite to pda...');
      await Pda.api().associateWorksite(this.currentCaseId, newCase.id);
    }
    await contact.addCases([newCase]);
    this.updateStatus({ modified: [newCase] });
    this.setCase(newCase);
  }

  @Action
  async closeContact({ contact }: { contact: Contact }) {
    if (!this.status.statusId) {
      throw new Error(window.vue.$t('phoneDashboard.call_status_required'));
    }
    if (this.currentCase) {
      await this.updateStatus({ modified: [this.currentCase] });
    }
    const { statusId, notes } = this.status;
    let dnisMetaName = _.get(contact.dnis, 'meta.caller_name', 'Unknown');
    if (this.activeCaseId !== -1) {
      dnisMetaName = this.currentCase ? this.currentCase.name : dnisMetaName;
    }
    const callStatus = {
      statusId,
      notes,
      agentId: contact.agentId,
      cases: this.modifiedCaseIds,
      dnisMeta: {
        caller_name: dnisMetaName,
        cases: this.modifiedCaseIds.join(', '),
      },
    };
    Sentry.setContext('phone.controller.status', callStatus);
    if (contact.outbound) {
      Log.info('updating outbound status with:', callStatus);
      await PhoneOutbound.api().updateStatus(contact.outbound.id, callStatus);
      this.setOutbound(null);
    }
    if (contact.inbound && contact.isInbound) {
      Log.info('updating inbound status with:', callStatus);
      await PhoneInbound.api().updateStatus(contact.inbound.id, callStatus);
    }
    if (this.status.notes) {
      await Promise.all(
        this.modifiedCaseIds.map((id) =>
          Worksite.api().addNote(id, this.status.notes),
        ),
      );
    }
    const { agentId } = contact;
    await contact.disconnect();
    this.setStatus({ notes: '', statusId: null, modified: [] });
    this.setCase(null);
    await this.setView({ page: ControllerPages.DASHBOARD });
    await this.updateMetrics();
    await this.updateCallerHistory({ agent_id: agentId });
  }

  @Action
  async clearState({ agentId }: { agentId: string } = {}) {
    Sentry.setContext('phone.controller.status', null);
    Log.info('clearing controller state!');
    this.setOutbound(null);
    this.setCase(null);
    this.setStatus({ notes: '', statusId: null, modified: [] });
    await this.updateMetrics();
    if (agentId) {
      await this.updateCallerHistory({ agent_id: agentId });
    }
  }

  @Action
  async serveOutbound({
    agent,
    incident,
    manual = false,
  }: {
    agent: typeof AgentClient,
    incident: typeof Incident,
    manual: boolean,
  } = {}) {
    if (this.isServingOutbounds) {
      Log.info('attempting to serve outbound call for:', incident);
      let outbound;
      try {
        outbound = await PhoneOutbound.api().getNextOutbound({
          incidentId: incident.id,
          agentId: agent.agentId,
          useCalldowns: true,
          isManual: manual,
        });
      } catch (e) {
        Log.info('no outbounds available!');
        return;
      }
      Log.info('outbound received! calling...', outbound);
      const outboundObj = await PhoneOutbound.fetchOrFindId(outbound.id);
      this.setOutbound(outboundObj);
      try {
        await PhoneOutbound.api().callOutbound(outbound.id, {
          isManual: manual,
        });
      } catch (e) {
        if (e.response) {
          if (e.response.status === 423) {
            Log.info('Failed to call outbound, its been completed!');
            this.setOutbound(null);
            if (agent.currentContact) {
              await agent.currentContact.disconnect();
            }
          } else {
            Log.error('Failed to call outbound! Unexpected error!');
            Log.error(e);
            Sentry.captureException(e);
            this.setOutbound(null);
            if (agent.currentContact) {
              await agent.currentContact.disconnect();
            }
          }
        }
      }
      return;
    }
    Log.info('controller is not currently serving outbounds!');
  }

  @Action
  async skipOutbound({ agent }: { agent: typeof AgentClient }) {
    if (this.currentOutbound !== null) {
      Log.info('skipping current outbound call...', this.currentOutbound);
      await this.currentOutbound.skipOutbound();
      this.setOutbound(null);
      if (agent.currentContact) {
        await agent.currentContact.disconnect();
      }
      await this.context.dispatch('phone.streams/updateContact', {
        action: ContactActions.DESTROYED,
      });
      agent.toggleOnline(false);
    } else {
      Log.error('there is not a current outbound to skip!');
    }
  }

  @Action
  async updateHistoricMetrics() {
    const { daily, aggregates } = await Agent.fetchHistoricMetrics();
    const _byDate = daily.map(({ day, ...m }) => ({
      day: day.split('T')[0],
      ...m,
    }));
    this.setHistoricMetrics({ daily: _byDate, aggregates });
    this.setLoading({ historicMetrics: false });
  }

  @Mutation
  setHistoricMetrics(newMetrics) {
    this.historicMetrics = newMetrics;
  }

  @Mutation
  setHistory(newHistory = {}) {
    this.history = { ...this.history, ...newHistory };
  }

  @Mutation
  setAgentMetrics(newAgents = {}) {
    this.agentMetrics = { ...this.agentMetrics, ...newAgents };
  }

  @Mutation
  setMetrics(newMetrics: $Shape<MetricsStateT>) {
    const _metrics = _.merge(this.metrics, newMetrics);
    this.metrics = _metrics;
  }

  @Mutation
  setLoading(newLoading) {
    this.loading = { ...this.loading, ...newLoading };
  }

  @Mutation
  setCallerHistory(newCallerHistory) {
    this.callerHistory = _.union(this.callerHistory, newCallerHistory);
  }

  @Action
  async updateAgentMetrics({ agents = [] } = {}) {
    const agentBoard = {};
    const userIds = _.filter(_.map(agents, 'user.id'), _.negate(_.isNil));
    if (!_.isEmpty(userIds)) {
      await User.fetchOrFindId(userIds);
    }
    await Promise.all(
      agents.map(async ({ state, entered_timestamp, ...metrics }) => {
        const agent_id = _.get(metrics, 'agent_id', _.get(metrics, 'agent'));
        if (metrics.user) {
          metrics.user = await User.fetchOrFindId(metrics.user.id);
        } else {
          const currentAgentMetrics = _.get(this.agentMetrics, agent_id, null);
          if (!currentAgentMetrics) {
            return;
          }
          const updatedMetrics = {
            ...currentAgentMetrics,
            currentState: state,
            enteredTimestamp: Date.parse(entered_timestamp),
          };
          Log.debug('updating current agent metrics:', updatedMetrics);
          this.setAgentMetrics({
            [agent_id]: updatedMetrics,
          });
          return;
        }
        const existing = _.get(this.agentMetrics, agent_id, {});
        agentBoard[agent_id] = {
          ...existing,
          ...metrics,
          currentState: state,
          enteredTimestamp: Date.parse(entered_timestamp),
        };
      }),
    );
    this.setAgentMetrics(agentBoard);
    this.setLoading({ agentMetrics: false });
  }

  @Action
  async updateCallerHistory({ agent_id }) {
    this.setLoading({ callerHistory: true });
    const { recent_contacts, state, entered_timestamp, locale } =
      await Agent.api().getMetrics(agent_id);
    let recentContacts = recent_contacts;
    // find all unique case ids and prefetch em
    let recentCases = _.uniq(
      _.flatten(recentContacts.map(({ cases }) => cases)),
    );
    recentCases = _.difference(recentCases, this.history.resolvedCases);
    this.setHistory({
      resolvedCases: _.union(recentCases, this.history.resolvedCases),
    });
    Log.debug('found cases in history:', recentCases);
    await Promise.all(
      recentCases.map((cId) =>
        Worksite.api().find_or_fetch(cId, { resolve: false }),
      ),
    );
    recentContacts = recentContacts.map(async ({ cases, ...c }) => {
      const wkSites = await Promise.all(
        cases.map(async (cId) => {
          let caseItem = await Worksite.find(cId);
          if (_.isNil(caseItem)) {
            const {
              response: { data },
            } = await Worksite.api().get(`/worksites/${cId}`);
            caseItem = data;
          }
          return caseItem;
        }),
      );
      return { cases: wkSites, ...c };
    });
    recentContacts = await Promise.all(recentContacts);
    Log.debug('updating caller history:', recentContacts);
    this.setCallerHistory(recentContacts);
    this.setLoading({ callerHistory: false });
    const currentAgentMetrics = _.get(this.agentMetrics, agent_id, null);
    if (!currentAgentMetrics) {
      return;
    }
    const updatedMetrics = {
      ...currentAgentMetrics,
      currentState: state,
      enteredTimestamp: Date.parse(entered_timestamp),
      locale,
    };
    this.setAgentMetrics({
      [agent_id]: updatedMetrics,
    });
  }

  @Action
  async updateMetrics({ metrics }: { metrics?: PhoneMetricUpdate[] } = {}) {
    this.setLoading({ generalMetrics: false });
    let metricData = metrics;
    if (!metrics) {
      const results = await Agent.fetchRealtimeMetrics();
      metricData = results.metrics;
      await this.updateAgentMetrics({ agents: results.agents });
    }
    if (!metricData) {
      return;
    }
    const newState = {};
    // custom metrics
    metricData.map(({ name, value }) => {
      let metricName = name;
      let metricLocale = 'all';
      if (name.includes('#')) {
        [metricName, metricLocale] = name.split('#');
      }
      const subState = _.get(this.metrics, metricLocale, {});
      const parsedValue = parseFloat(value) || 0;
      // prevents 'fake' realtime values from going negative
      // till the true metrics come in
      subState[_.camelCase(metricName)] = parsedValue >= 0 ? parsedValue : 0;
      newState[metricLocale] = subState;

      return newState;
    });

    const localeKeys = _.keys(newState);
    _.map(localeKeys, (locale) => {
      const subState = _.get(newState, locale, {});
      // set default values of 0
      subState[Metrics.TOTAL_WAITING[0]] = _.defaultTo(
        subState[Metrics.TOTAL_WAITING[0]],
        0,
      );
      subState[Metrics.NEEDED[0]] = _.defaultTo(subState[Metrics.NEEDED[0]], 0);

      const updatedKeys = Object.keys(subState);
      const getOrUpdate = (metricName: string) =>
        updatedKeys.includes(metricName)
          ? subState[metricName]
          : _.get(this.metrics[locale], metricName, 0);
      const [
        numCallbacks,
        numQueued,
        numOnline,
        numCalldowns,
        numAvailable,
        numOnCall,
        numCallbacksAll,
        numCalldownsAll,
      ] = [
        Metrics.CALLBACKS_QUEUED,
        Metrics.CONTACTS_QUEUED,
        Metrics.ONLINE,
        Metrics.CALLDOWNS_QUEUED,
        Metrics.AVAILABLE,
        Metrics.AGENTS_ON_CALL,
        Metrics.CALLBACKS_QUEUED_ALL,
        Metrics.CALLDOWNS_QUEUED_ALL,
      ].map((m) => getOrUpdate(m[0]));

      subState[Metrics.CONTACTS_QUEUED[0]] = numQueued;
      subState[Metrics.AVAILABLE[0]] = numAvailable;
      subState[Metrics.AGENTS_ON_CALL[0]] = numOnCall;
      subState[Metrics.ONLINE[0]] = numOnline;
      subState[Metrics.CALLBACKS_QUEUED[0]] = numCallbacks;
      subState[Metrics.CALLBACKS_QUEUED_ALL[0]] = numCallbacksAll;
      subState[Metrics.CALLDOWNS_QUEUED_ALL[0]] = numCalldownsAll;

      // count up needed and total if required values exists
      const totalWaiting = numCallbacks + numQueued + numCalldowns;
      subState[Metrics.TOTAL_WAITING[0]] =
        typeof totalWaiting === 'number' ? totalWaiting : 0;
      const agentCapacity = 12 * numOnline; // each agent can take 12 calls
      const queueOverflow = totalWaiting - agentCapacity; // number of callers over the capacity
      let needed = queueOverflow >= 1 ? Math.ceil(queueOverflow / 12) : 0;
      needed /= numOnline > 0 ? numOnline : 1;
      subState[Metrics.NEEDED[0]] = needed >= 1 ? Math.ceil(needed) : 0;

      newState[locale] = subState;
    });

    this.setMetrics(newState);
    this.setLoading({ generalMetrics: false });
  }

  @MutationAction({ mutate: ['view'] })
  setView(newView: $Shape<ViewStateT>) {
    return { view: { ...this.view, ...newView } };
  }

  @MutationAction({ mutate: ['currentCase'] })
  setCase(newCase: $Shape<CaseType> | null) {
    Log.debug('updating active case:', newCase);
    return { currentCase: newCase };
  }

  @Action
  async init() {
    Log.debug('init controller!');
    const streamsStore = getModule(StreamsStore, this.$store);
    if (!streamsStore.connected) {
      const htmlEl = document.getElementById('ccp-embed');
      await streamsStore.init(htmlEl);
    }
  }
}

export default ControllerStore;
