import axios from 'axios';
import moment from 'moment';
import * as Sentry from '@sentry/browser';
import type State from '@vuex-orm/core/dist/src/model/contracts/State';
import { type ActionContext } from 'vuex';
import { AuthService } from '../../services/auth.service';
import type User from '../../models/User';

const AuthState = {
  user: AuthService.getUser(),
  showLoginModal: false,
};

// Getters
const getters = {
  isLoggedIn(state: State) {
    return state.user && AuthService.getExpiry().isAfter(moment());
  },
  isOrphan(state: State) {
    return state.user && !state.user.user_claims.organization;
  },
  isOrganizationInactive(state: State) {
    return state.user && !state.user.user_claims.organization?.is_active;
  },
  isAdmin(state: State) {
    return state.user && state.user.user_claims.active_roles.includes(1);
  },
  userId: (state: State) => (state.user ? state.user.user_claims.id : null),
  user: (state: State) => state.user,
  userToken: (state: State) => (state.user ? state.user.access_token : null),
  showLoginModal: (state: State) => state.showLoginModal,
};

// Actions
const actions = {
  async login(
    { commit }: ActionContext<any, any>,
    { email, password }: Record<string, string>,
  ) {
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

  logout({ commit }: ActionContext<any, any>) {
    commit('setUser', null);
    // Window.location.reload();
  },
};

// Mutations
const mutations = {
  setUser(state: State, user: User) {
    state.user = user;
    if (!user) {
      Sentry.setUser(null);
      AuthService.removeUser();
    } else {
      AuthService.saveUser(user);
      Sentry.setUser({
        ...state.user,
        id: state.user.user_claims.id,
        username: state.user.email,
        email: state.user.email,
      });
    }
  },
  setShowLoginModal(state: State, toggle: boolean) {
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
