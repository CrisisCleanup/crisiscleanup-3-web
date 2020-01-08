import moment from 'moment';
import axios from 'axios';
import { AuthService } from '@/services/auth.service';

const AuthState = {
  user: AuthService.getUser(),
};

// getters
const getters = {
  isLoggedIn: state => {
    return state.user && AuthService.getExpiry().isAfter(moment());
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
