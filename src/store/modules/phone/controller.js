// @flow

/**
 * Phone Controller Store
 */

import {
  VuexModule,
  Action,
  Module,
  MutationAction,
  getModule,
  Mutation,
} from 'vuex-module-decorators';
import axios from 'axios';
import { PhoneApi } from '@/utils/api';
import type {
  CaseType,
  MetricsStateT,
  PhoneMetric,
  PhoneMetricUpdate,
  ViewStateT,
} from '@/store/modules/phone/types';
import store from '@/store';
import Logger from '@/utils/log';
import StreamsStore from '@/store/modules/phone/streams';
import _ from 'lodash';
import Agent from '@/models/Agent';
import Worksite from '@/models/Worksite';

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

  get currentAgentMetrics() {
    return this.agentRankings.find(
      (a) => a.user.id === this.context.rootGetters['auth/userId'],
    );
  }

  @MutationAction({ mutate: ['contactMetrics'] })
  updateContactMetrics({ contacts } = {}) {
    if (!_.isNull(contacts)) {
      return { contactMetrics: contacts };
    }
    return [];
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

  @Action
  async updateAgentMetrics({ agents = [] } = {}) {
    const agentBoard = {};
    await Promise.all(
      agents.map(async ({ agent_id, state, entered_timestamp }) => {
        try {
          await Agent.api().get(`/agents/${agent_id}`);
        } catch (e) {
          Log.warn(`failed to fetch agent, does it exist? (${agent_id})`);
          return;
        }
        const {
          recent_contacts,
          user,
          ...metrics
        } = await Agent.api().getMetrics(agent_id);
        let recentContacts = [];
        if (this.context.rootGetters['auth/userId'] === user.id) {
          recentContacts = _.defaultTo(recent_contacts, []);
          // find all unique case ids and prefetch em
          let recentCases = _.uniq(
            _.flatten(recentContacts.map(({ cases }) => cases)),
          );
          recentCases = _.difference(recentCases, this.history.resolvedCases);
          this.setHistory({
            history: {
              resolvedCases: _.union(recentCases, this.history.resolvedCases),
            },
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
        }
        agentBoard[agent_id] = {
          ...metrics,
          user,
          currentState: state,
          enteredTimestamp: Date.parse(entered_timestamp),
          recent_contacts: recentContacts,
        };
      }),
    );
    this.setAgentMetrics(agentBoard);
  }

  @Action
  async updateMetrics({ metrics }: { metrics?: PhoneMetricUpdate[] } = {}) {
    let metricData = metrics;
    if (!metrics) {
      Log.debug('falling back to api to fetch metrics...');
      const resp = await axios.get(PhoneApi('metrics'));
      const { results }: { results: PhoneMetricUpdate[] } = resp.data;
      metricData = results;
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
    if (this.currentCase === null) {
      this.currentCase = newCase;
    } else {
      this.currentCase = { ...this.currentCase, ...newCase };
    }
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
