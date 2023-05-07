import type { Module } from 'vuex';
import type { CCURootState } from '@/store/types';

export interface LocaleModuleState {
  language: string | undefined;
}

const localeModule: Module<LocaleModuleState, CCURootState> = {
  namespaced: true,
  state: {
    language: undefined,
  },
  getters: {},
  actions: {},
  mutations: {
    setLanguage(state, language: LocaleModuleState['language']) {
      state.language = language;
    },
  },
};

export default localeModule;
