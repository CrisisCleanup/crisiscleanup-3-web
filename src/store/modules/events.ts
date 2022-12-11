// Import axios from 'axios';

import type State from '@vuex-orm/core/dist/src/model/contracts/State';

const EventState = {
  events: [],
};

// Getters
const getters = {
  getEvents(state: State) {
    return state.events;
  },
};

// Actions
const actions = {
  async pushEvents({ commit, getters: { getEvents } }: State) {
    const events = getEvents;
    if (events.length === 0 || import.meta.env.NODE_ENV !== 'development') {
      return null;
    }

    // Const response = await axios.post(
    //   `${import.meta.env.VITE_APP_API_BASE_URL}/events_new`,
    //   events,
    // );
    commit('setEvents', []);
    return {};
  },
};

// Mutations
const mutations = {
  setEvents(state: State, events: any[]) {
    state.events = events;
  },
  addEvent(state: State, event: any) {
    state.events = [...state.events, event];
  },
};

export default {
  namespaced: true,
  state: EventState,
  getters,
  actions,
  mutations,
};
