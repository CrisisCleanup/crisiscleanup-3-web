import type { Getter, Module } from 'vuex';
import type { CCURootState } from '@/store/types';
import type EventLog from '@/models/EventLog';

export interface EventsModuleState {
  events: EventLog[]; // this type may need to be changed
}

const eventsModule: Module<EventsModuleState, CCURootState> = {
  namespaced: true,
  state: {
    events: [],
  },
  getters: {
    getEvents(state) {
      return state.events;
    },
  },
  actions: {
    async pushEvents(ctx) {
      const events = ctx.getters.getEvents as Getter<
        EventsModuleState,
        CCURootState
      >;
      if (events.length === 0 || import.meta.env.NODE_ENV !== 'development') {
        return null;
      }

      // Const response = await axios.post(
      //   `${import.meta.env.VITE_APP_API_BASE_URL}/events_new`,
      //   events,
      // );
      ctx.commit('setEvents', []);
      return {};
    },
  },
  mutations: {
    setEvents(state, events: EventLog[]) {
      state.events = events;
    },
    addEvent(state, event: EventLog) {
      state.events = [...state.events, event];
    },
  },
};

export default eventsModule;
