const state = {
    worksitesLoading: false,
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
    setWorksitesLoading (state, worksitesLoading) {
        state.worksitesLoading = worksitesLoading
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
