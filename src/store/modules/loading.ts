import type { Module } from 'vuex';
import type { CCURootState } from '@/store/types';

export interface LoadingModuleState {
  worksitesLoading: boolean;
}

const loadingModule: Module<LoadingModuleState, CCURootState> = {
  namespaced: true,
  state: {
    worksitesLoading: false,
  },
  getters: {},
  actions: {},
  mutations: {
    setWorksitesLoading(state, worksitesLoading: boolean) {
      state.worksitesLoading = worksitesLoading;
    },
  },
};

export default loadingModule;
