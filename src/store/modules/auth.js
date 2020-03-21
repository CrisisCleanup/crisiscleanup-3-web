import { AuthService } from '@/services/auth.service';
import axios from 'axios';
import moment from 'moment';

const AuthState = {
  user: AuthService.getUser(),
};

// getters
const getters = {
  isLoggedIn: state => {
    return state.user && AuthService.getExpiry().isAfter(moment());
  },
  isOrphan: state => {
    return state.user && !state.user.user_claims.organization;
  },
  userId: state => (state.user ? state.user.user_claims.id : null),
};

// actions
const actions = {
  async login({ commit }, { email, password }) {
    const response = await axios.post(
      `${process.env.VUE_APP_API_BASE_URL}/api-token-auth`,
      {
        email,
        password,
      },
    );
    commit('setUser', response.data);
    return response;
  },

  logout({ commit }) {
    commit('setUser', null);
    window.location.reload();
  },
};

// mutations
const mutations = {
  setUser(state, user) {
    state.user = user;
    if (!user) {
      AuthService.removeUser();
    } else {
      AuthService.saveUser(user);
    }
  },
};

export default {
  namespaced: true,
  state: AuthState,
  getters,
  actions,
  mutations,
};
