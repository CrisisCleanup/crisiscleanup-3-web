import axios from 'axios';
import moment from 'moment';
import Vue from 'vue';
// import Acl from 'vue-browser-acl';
// import * as Sentry from '@sentry/browser';
// import User from '@/models/User';
import { AuthService } from '../../services/auth.service';
import State from "@vuex-orm/core/dist/src/model/contracts/State";

const AuthState = {
  user: AuthService.getUser(),
  showLoginModal: false,
};

// getters
const getters = {
  isLoggedIn: (state: State) => {
    return state.user && AuthService.getExpiry().isAfter(moment());
  },
  isOrphan: (state: State) => {
    return state.user && !state.user.user_claims.organization;
  },
  isOrganizationInactive: (state: State) => {
    return state.user && !state.user.user_claims.organization?.is_active;
  },
  isAdmin: (state: State) => {
    return state.user && state.user.user_claims.active_roles.includes(1);
  },
  userId: (state: State) => (state.user ? state.user.user_claims.id : null),
  userToken: (state: State) => (state.user ? state.user.access_token : null),
};

// actions
const actions = {
  async login({ commit }, { email, password }) {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_API_BASE_URL}/api-token-auth`,
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
      // Sentry.setUser(null);
      AuthService.removeUser();
    } else {
      AuthService.saveUser(user);
      // Sentry.setUser({
      //   ...state.user,
      //   id: state.user.user_claims.id,
      //   username: state.user.email,
      //   email: state.user.email,
      // });
    }
  },
  // setAcl(state, router) {
  //   const user = User.find(state.user.user_claims.id);
  //   Sentry.setUser({
  //     ...state.user,
  //     id: user.id,
  //     username: user.email,
  //     email: user.email,
  //   });
  //   Vue.use(
  //     Acl,
  //     user,
  //     (acl) => {
  //       const { permissions, beta_features } = user;
  //       Object.keys(permissions).forEach((permissionKey) => {
  //         acl.rule(permissionKey, user.permissions[permissionKey]);
  //       });
  //       beta_features.forEach((feature) => {
  //         acl.rule(`beta_feature.${feature}`, true);
  //       });
  //       acl.rule(`development_mode`, process.env.NODE_ENV !== 'production');
  //       acl.rule(`app_stage.${process.env.VUE_APP_STAGE}`, true);
  //     },
  //     { router },
  //   );
  // },
  setShowLoginModal(state, toggle) {
    state.showLoginModal = toggle;
  },
};

export default {
  namespaced: true,
  state: AuthState,
  getters,
  actions,
  mutations,
};
