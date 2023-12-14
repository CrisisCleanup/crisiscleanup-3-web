import axios from 'axios';
import moment from 'moment';
import * as Sentry from '@sentry/vue';
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
    return state.user && AuthService.getAccessTokenExpiry().isAfter(moment());
  },
  isOrphan(state: State) {
    return state.user && !state.user.organization;
  },
  isOrganizationInactive(state: State) {
    return state.user && !state.user.organization?.is_active;
  },
  isAdmin(state: State) {
    return state.user && state.user.active_roles.includes(1);
  },
  userId: (state: State) => (state.user ? state.user.id : null),
  user: (state: State) => state.user,
  showLoginModal: (state: State) => state.showLoginModal,
};

// Actions
const actions = {
  async login(
    { commit }: ActionContext<never, never>,
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

  logout({ commit }: ActionContext<never, never>) {
    AuthService.logoutUser().then(() => {
      commit('setUser', null);
      const broadcast = new BroadcastChannel('logoutChannel');
      broadcast.postMessage('logout');
      window.location.href = '/';
    });
  },
};

// Mutations
const mutations = {
  setUser(state: State, user: User) {
    state.user = user;
    if (user) {
      AuthService.saveUser(user);
      Sentry.setUser({
        ...state.user,
        id: state.user.id,
        username: state.user.email,
        email: state.user.email,
      });
    } else {
      Sentry.setUser(null);
      AuthService.removeUser();
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
