import Acl from "browser-acl";
import State from "@vuex-orm/core/dist/src/model/contracts/State";
import User from "../../models/User";
import * as Sentry from "@sentry/browser";

const AclState = {
  acl: new Acl(),
};

// getters
const getters = {};

// actions
const actions = {};

// mutations
const mutations = {
  addRule(state: State, { key, value }: Record<any, any>) {
    state.acl.addRule(key, value);
  },
  setUserAcl(state: State, user_id: any) {
    const user = User.find(user_id) as User;
    const { permissions, beta_features } = user;
    Object.keys(permissions).forEach((permissionKey: string) => {
      state.acl.rule(permissionKey, user.permissions[permissionKey]);
    });
    beta_features.forEach((feature) => {
      state.acl.rule(`beta_feature.${feature}`, true);
    });
    state.acl.rule(
      `development_mode`,
      import.meta.env.NODE_ENV !== "production"
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
