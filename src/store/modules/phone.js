import { AgentApi } from '@/utils/api';
import axios from 'axios';

const PhoneState = {
  agent: null,
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
};

// mutations
const mutations = {
  setAgent(state, agent) {
    state.agent = agent;
  },
};

export default {
  namespaced: true,
  state: PhoneState,
  getters,
  actions,
  mutations,
};
