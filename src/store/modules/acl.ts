import Acl from 'browser-acl';
import type State from '@vuex-orm/core/dist/src/model/contracts/State';
import * as Sentry from '@sentry/browser';
import User from '../../models/User';

const AclState = {
  acl: new Acl(),
};

// Getters
const getters = {
  acl: (state: State) => state.acl,
};

// Actions
const actions = {};

// Mutations
const mutations = {
  addRule(state: State, { key, value }: Record<any, any>) {
    state.acl.addRule(key, value);
  },
  setUserAcl(state: State, user_id: any) {
    const user = User.find(user_id)!;
    const { permissions, beta_features } = user;
    Object.keys(permissions).forEach((permissionKey: string) => {
      state.acl.rule(permissionKey, user.permissions[permissionKey]);
    });
    for (const feature of beta_features) {
      state.acl.rule(`beta_feature.${feature}`, true);
    }

    state.acl.rule(
      `development_mode`,
      import.meta.env.NODE_ENV !== 'production',
    );
    state.acl.rule(`app_stage.${import.meta.env.VITE_APP_STAGE}`, true);

    Sentry.setUser({
      ...state.user,
      id: user.id,
      username: user.email,
      email: user.email,
    });
  },
};

export default {
  namespaced: true,
  state: AclState,
  getters,
  actions,
  mutations,
};
