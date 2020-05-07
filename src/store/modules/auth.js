import { AuthService } from '@/services/auth.service';
import axios from 'axios';
import moment from 'moment';
import Vue from 'vue';
import Acl from 'vue-browser-acl';
import User from '@/models/User';

const AuthState = {
  user: AuthService.getUser(),
};

// getters
const getters = {
  isLoggedIn: (state) => {
    return state.user && AuthService.getExpiry().isAfter(moment());
  },
  isOrphan: (state) => {
    return state.user && !state.user.user_claims.organization;
  },
  isAdmin: (state) => {
    return state.user && state.user.user_claims.active_roles.includes(1);
  },
  userId: (state) => (state.user ? state.user.user_claims.id : null),
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
  setAcl(state, router) {
    const user = User.find(state.user.user_claims.id);
    Vue.use(
      Acl,
      user,
      (acl) => {
        const { permissions, beta_features } = user;
        Object.keys(permissions).forEach((permissionKey) => {
          acl.rule(permissionKey, user.permissions[permissionKey]);
        });
        beta_features.forEach((feature) => {
          acl.rule(`beta_feature.${feature}`, true);
        });
        acl.rule(`development_mode`, process.env.NODE_ENV !== 'production');
      },
      { router },
    );
  },
};

export default {
  namespaced: true,
  state: AuthState,
  getters,
  actions,
  mutations,
};
