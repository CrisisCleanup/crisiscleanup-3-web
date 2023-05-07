import type { Module } from 'vuex';
import type { CCURootState } from '@/store/types';

export interface MapModuleState {
  autocompleteToken: string | undefined;
}

const mapModule: Module<MapModuleState, CCURootState> = {
  namespaced: true,
  state: {
    autocompleteToken: undefined,
  },
  getters: {
    autocompleteToken(state) {
      return state.autocompleteToken;
    },
  },
  actions: {},
  mutations: {
    setAutocompleteToken(state, token: MapModuleState['autocompleteToken']) {
      state.autocompleteToken = token;
    },
  },
};

export default mapModule;
