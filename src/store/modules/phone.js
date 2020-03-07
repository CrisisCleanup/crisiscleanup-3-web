import { AgentApi, PhoneApi } from '@/utils/api';
import axios from 'axios';
import { camelCase } from 'lodash';

const PhoneState = {
  agent: null,
  metrics: null,
};

// getters
const getters = {
  agentId: state => (state.agent ? state.agent.agent_id : null),
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
};

export default {
  namespaced: true,
  state: PhoneState,
  getters,
  actions,
  mutations,
};
