import type State from '@vuex-orm/core/dist/src/model/contracts/State';

const AppState = {
  statuses: [],
  workTypes: [],
  locationTypes: [],
  phases: [],
  portal: null,
};

// Getters
const getters = {
  statuses: (state: State) => state.statuses,
  workTypes: (state: State) => state.workTypes,
  portal: (state: State) => state.portal,
  phases: (state: State) => state.phases,
  locationTypes: (state: State) => state.locationTypes,
  workTypeCommercialValues(state: State) {
    return Object.assign(
      {},
      ...state.workTypes.map((s: any) => ({ [s.key]: s.commercial_value })),
    );
  },
};

// Actions
const actions = {};

// Mutations
const mutations = {
  setStatuses(state: State, statuses: any[]) {
    state.statuses = statuses;
  },
  setWorkTypes(state: State, workTypes: any[]) {
    state.workTypes = workTypes;
  },
  setLocationTypes(state: State, locationTypes: any[]) {
    state.locationTypes = locationTypes;
  },
  setPhases(state: State, phases: any[]) {
    state.phases = phases;
  },
  setPortal(state: State, portal: any[]) {
    state.portal = portal;
  },
};

export default {
  namespaced: true,
  state: AppState,
  getters,
  actions,
  mutations,
};
