// import axios from 'axios';

import State from "@vuex-orm/core/dist/src/model/contracts/State";

const EventState = {
  events: [],
};

// getters
const getters = {
  getEvents: (state: State) => {
    return state.events;
  },
};

// actions
const actions = {
  async pushEvents({ commit, getters: { getEvents } }: State) {
    const events = getEvents;
    if (events.length === 0 || process.env.NODE_ENV !== "development") {
      return null;
    }
    // const response = await axios.post(
    //   `${import.meta.env.VITE_APP_API_BASE_URL}/events_new`,
    //   events,
    // );
    commit("setEvents", []);
    return {};
  },
};

// mutations
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
