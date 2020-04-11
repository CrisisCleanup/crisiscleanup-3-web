import actions from './actions';
import getters from './getters';
import mutations from './mutations';

const getStateDefaults = () => {};

const RCState = {
  client: null,
  authenticated: false,
  ...getStateDefaults(),
};

export default {
  namespaced: true,
  state: RCState,
  actions,
  getters,
  mutations,
};
