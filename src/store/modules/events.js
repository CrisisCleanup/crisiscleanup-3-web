import axios from 'axios';

const EventState = {
  events: [],
};

// getters
const getters = {
  getEvents: (state) => {
    return state.events;
  },
};

// actions
const actions = {
  async pushEvents({ commit, getters: { getEvents } }) {
    const events = getEvents;
    if (events.length === 0 || process.env.NODE_ENV === 'development') {
      return null;
    }
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/events_new`,
      events,
    );
    commit('setEvents', []);
    return response;
  },
};

// mutations
const mutations = {
  setEvents(state, events) {
    state.events = events;
  },
  addEvent(state, event) {
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
