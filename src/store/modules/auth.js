import User from "@/models/User";
import { TokenService } from "@/services/storage.service";


// initial state
// shape: [{ id, quantity }]
const state = {
    accessToken: null
};

// getters
const getters = {};

// actions
const actions = {
    async login ({ commit }) {
        let data = await User.api().login();
        let { access_token } = data.response.data;
        commit('setAccessToken', access_token);
    }
};

// mutations
const mutations = {
    setAccessToken (state, token) {
        state.accessToken = token;
        TokenService.saveToken(token);
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
