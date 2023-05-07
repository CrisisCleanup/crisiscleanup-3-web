import Acl from 'browser-acl';
import * as Sentry from '@sentry/browser';
import type { Module } from 'vuex';
import User from '@/models/User';
import type { CCURootState } from '@/store/types';

export interface AclModuleState {
  acl: Acl;
}

const aclModule: Module<AclModuleState, CCURootState> = {
  namespaced: true,
  state: {
    acl: new Acl(),
  },
  getters: {
    acl(state) {
      return state.acl;
    },
  },
  actions: {},
  mutations: {
    addRule(state, { key, value }: Record<string, any>) {
      state.acl.addRule(key, value);
    },
    setUserAcl(state, user_id: any) {
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
        ['development', 'staging'].includes(import.meta.env.NODE_ENV),
      );
      state.acl.rule(`app_stage.${import.meta.env.VITE_APP_STAGE}`, true);

      console.log('currentState', state);

      Sentry.setUser({
        ...state.user,
        id: user.id,
        username: user.email,
        email: user.email,
      });
    },
  },
};

export default aclModule;
