const AppState = {
  statuses: [],
  workTypes: [],
};

// getters
const getters = {
  statuses: (state) => state.statuses,
  workTypes: (state) => state.workTypes,
  workTypeCommercialValues: (state) => {
    return Object.assign(
      {},
      ...state.workTypes.map((s) => ({ [s.key]: s.commercial_value })),
    );
  },
};

// actions
const actions = {};

// mutations
const mutations = {
  setStatuses(state, statuses) {
    state.statuses = statuses;
  },
  setWorkTypes(state, workTypes) {
    state.workTypes = workTypes;
  },
};

export default {
  namespaced: true,
  state: AppState,
  getters,
  actions,
  mutations,
};
