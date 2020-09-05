// @flow

/**
 * phone Controller Store
 */

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
import Contact from '@/models/phone/Contact';
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
 * @type {Readonly<{AVAILABLE: [string, string], NEEDED: [string, string], CONTACTS_QUEUED: [string, string], TOTAL_WAITING: [string, string], CALLBACKS_QUEUED: [string, string], AGENTS_ON_CALL: [string, string], ONLINE: [string, string]}>}
 * @readonly
 * @enum {string[]}
 */
export const Metrics = Object.freeze({
  // note: translation takes place in component, $t not needed here.
  ONLINE: ['agentsOnline', '~~Volunteers Online'],
  CONTACTS_QUEUED: ['contactsInQueue', '~~On hold now'],
  CALLBACKS_QUEUED: ['contactsInQueueOutbound', '~~Remaining Callbacks'],
  AVAILABLE: ['agentsAvailable', '~~Volunteers Available'],
  AGENTS_ON_CALL: ['agentsOnCall', '~~Volunteers on the Phone'],
  NEEDED: ['agentsNeeded', '~~Additional Volunteers Needed'],
  TOTAL_WAITING: ['totalWaiting', '~~Total People Waiting'],
  CALLDOWNS_QUEUED: ['calldowns', '~~Remaining Calldowns'],
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
  };

  // is serving outbounds
  isServingOutbounds: boolean = true;

  // current outbound
  currentOutbound: PhoneOutbound | null = null;

  // historic call metrics
  historicMetrics = {
    daily: [],
    aggregates: {},
  };

  get historicMetricsReady() {
    return !this.loading.historicMetrics;
  }

  get getGeneralMetrics() {
    return (metricOrder: PhoneMetric[]) => {
      const metricMap = new Map<string, number>();
      metricOrder.map(([name, description]) => {
        return metricMap.set(description, _.get(this.metrics, name, 0));
      });
      return metricMap;
    };
  }

  get agentRankings() {
    return _.orderBy(
      Object.values(this.agentMetrics, ['total_calls'], ['desc']),
    );
  }

  get agentMetricsReady() {
    return this.loading.agentMetrics;
  }

  get callHistoryReady() {
    return this.loading.callerHistory;
  }

  get callHistory() {
    return this.callerHistory;
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

  get activeActionTab() {
    return _.get(this.view, 'actionTab', ControllerActionTabs.CASE);
  }

  get modifiedCaseIds() {
    return this.status.modified.map((c) => c.id);
  }

  @Mutation
  setStatus(newStatus) {
    this.status = { ...this.status, ...newStatus };
  }

  @Mutation
  setOutbound(newOutbound: PhoneOutbound | null) {
    this.currentOutbound = newOutbound;
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
      statusId: statusId || this.status.statusId,
      notes: notes || this.status.notes,
      modified: _.filter(modified, _.negate(_.isNil))
        ? _.unionBy<CaseType>(this.status.modified, modified, 'id')
        : _.filter(this.status.modified, _.negate(_.isNil)),
    });
  }

  @Action
  async addCase({ contact, newCase }: { contact: Contact, newCase: Worksite }) {
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
      throw new Error('~~You must set a call Status!');
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
    if (contact.outbound && !contact.isInbound) {
      Log.info('updating outbound status with:', callStatus);
      await PhoneOutbound.api().updateStatus(contact.outbound.id, callStatus);
      this.setOutbound(null);
    }
    if (contact.inbound && contact.isInbound) {
      Log.info('updating inbound status with:', callStatus);
      await PhoneInbound.api().updateStatus(contact.inbound.id, callStatus);
    }
    await contact.disconnect();
    this.setLoading({ callerHistory: true });
    await this.setView({ page: ControllerPages.DASHBOARD });
  }

  @Action
  async serveOutbound({
    agent,
    incident,
  }: {
    agent: AgentClient,
    incident: Incident,
  }) {
    if (this.isServingOutbounds) {
      Log.info('attempting to serve outbound call for:', incident);
      let outbound;
      try {
        outbound = await PhoneOutbound.api().getNextOutbound({
          incidentId: incident.id,
          agentId: agent.agentId,
        });
      } catch (e) {
        Log.info('no outbounds available!');
        return;
      }
      Log.info('outbound received! calling...', outbound);
      const outboundObj = await PhoneOutbound.fetchOrFindId(outbound.id);
      this.setOutbound(outboundObj);
      await PhoneOutbound.api().callOutbound(outbound.id);
      return;
    }
    Log.info('controller is not currently serving outbounds!');
  }

  @Action
  async updateHistoricMetrics() {
    const { daily, aggregates } = await Agent.fetchHistoricMetrics();
    this.setHistoricMetrics({ daily, aggregates });
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
    this.metrics = { ...this.metrics, ...newMetrics };
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
      Log.debug('prefetching user ids:', userIds);
      await User.fetchOrFindId(userIds);
    }
    await Promise.all(
      agents.map(async ({ state, entered_timestamp, ...metrics }) => {
        const agent_id = _.get(metrics, 'agent_id', _.get(metrics, 'agent'));
        if (metrics.user) {
          metrics.user = await User.fetchOrFindId(metrics.user.id);
        } else {
          await this.updateCallerHistory({
            ...metrics,
            agent_id,
            state,
            entered_timestamp,
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
    Log.debug('updating agent metrics:', agentBoard);
    this.setAgentMetrics(agentBoard);
    this.setLoading({ agentMetrics: false });
  }

  @Action
  async updateCallerHistory({ agent_id, state, entered_timestamp }) {
    if (this.loading.callerHistory) {
      const { recent_contacts } = await Agent.api().getMetrics(agent_id);
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
    }
    Log.debug('looking for current agent...', agent_id, this.agentMetrics);
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
  }

  @Action
  async updateMetrics({ metrics }: { metrics?: PhoneMetricUpdate[] } = {}) {
    let metricData = metrics;
    if (!metrics) {
      Log.debug('falling back to api to fetch metrics...');
      const results = await Agent.fetchRealtimeMetrics();
      metricData = results.metrics;
      await this.updateAgentMetrics({ agents: results.agents });
    }
    if (!metricData) {
      return;
    }
    const newState = {};
    // custom metrics
    const metricNames = Object.keys(Metrics);
    metricData.map(({ name, value }, idx) => {
      let metricName = name;
      if (!metricName) {
        metricName = metricNames[idx];
      }
      const parsedValue = parseFloat(value) || 0;
      // prevents 'fake' realtime values from going negative
      // till the true metrics come in
      newState[_.camelCase(metricName)] = parsedValue >= 0 ? parsedValue : 0;
      return newState;
    });
    // set default values of 0
    newState[Metrics.TOTAL_WAITING[0]] = _.defaultTo(
      newState[Metrics.TOTAL_WAITING[0]],
      0,
    );
    newState[Metrics.NEEDED[0]] = _.defaultTo(newState[Metrics.NEEDED[0]], 0);
    newState[Metrics.CALLDOWNS_QUEUED[0]] = _.defaultTo(
      newState[Metrics.CALLDOWNS_QUEUED[0]],
      0,
    );

    const updatedKeys = Object.keys(newState);
    const getOrUpdate = (metricName: string) =>
      updatedKeys.includes(metricName)
        ? newState[metricName]
        : this.metrics[metricName];
    const [numCallbacks, numQueued, numOnline, numCalldowns] = [
      Metrics.CALLBACKS_QUEUED,
      Metrics.CONTACTS_QUEUED,
      Metrics.ONLINE,
      Metrics.CALLDOWNS_QUEUED,
    ].map((m) => getOrUpdate(m[0]));

    // count up needed and total if required values exists
    const totalWaiting = numCallbacks + numQueued + numCalldowns;
    newState[Metrics.TOTAL_WAITING[0]] =
      typeof totalWaiting === 'number' ? totalWaiting : 0;
    const agentCapacity = 12 * numOnline; // each agent can take 12 calls
    const queueOverflow = totalWaiting - agentCapacity; // number of callers over the capacity
    Log.debug('current queue capacity overflow:', queueOverflow);
    const needed = queueOverflow >= 1 ? Math.ceil(queueOverflow / 12) : 0;
    newState[Metrics.NEEDED[0]] = needed;
    Log.debug('new metrics:', newState);
    this.context.commit('setMetrics', newState);
  }

  @MutationAction({ mutate: ['view'] })
  setView(newView: $Shape<ViewStateT>) {
    return { view: { ...this.view, ...newView } };
  }

  @MutationAction({ mutate: ['currentCase'] })
  setCase(newCase: $Shape<CaseType>) {
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
