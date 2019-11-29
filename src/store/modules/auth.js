import User from "@/models/User";
import { AuthService } from "@/services/auth.service";

const state = {
    user: AuthService.getUser()
};

// getters
const getters = {
    isLoggedIn: state => Boolean(state.user && state.user.access_token),
    userId: state => state.user ? state.user.user_claims.id : null
};

// actions
const actions = {
    async login ({ commit }, { email, password }) {
        let data = await User.api().login(email, password);
        commit('setUser', data.response.data);
        return data.response;
    },

    logout ({ commit }) {
        commit('setUser', null);
    }
};

// mutations
const mutations = {
    setUser (state, user) {
        state.user = user;
        if (!user) {
            AuthService.removeUser()
        } else {
            AuthService.saveUser(user);
        }
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}
