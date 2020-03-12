import * as ConnectService from '@/services/acs.service';
import { AgentApi, PhoneApi } from '@/utils/api';
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
  metrics: null,
  connectRunning: false,
  streams: null,
};

// getters
const getters = {
  agentId: state => (state.agent ? state.agent.agent_id : null),
  connectRunning: state => state.connectRunning,
};

// actions
const actions = {
  async fetchAgent({ commit }, { user }) {
    let resp;
    try {
      resp = await axios.get(AgentApi('me'));
    } catch {
      resp = await axios.post(AgentApi(), { user });
    }
    commit('setAgent', resp.data);
    return resp;
  },
  async getRealtimeMetrics({ commit }) {
    const resp = await axios.get(PhoneApi('metrics'));
    commit('setMetrics', resp.data.results);
    return resp;
  },
  async initConnect({ commit }, htmlEl) {
    commit('setConnectState', true);
    ConnectService.initConnect({
      htmlEl,
    });
    ConnectService.initAgent({
      onRefresh: agent => commit('setAgentState', agent),
    });
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
  setAgentState(state, agent) {
    const agentState = agent.getState();
    const newState = { ...state.streams, ...agentState };
    Log.info('new state inbound:', newState);
    state.streams = newState;
  },
  setConnectState(state, running) {
    state.connectRunning = running;
  },
};

export default {
  namespaced: true,
  state: PhoneState,
  getters,
  actions,
  mutations,
};
