import type { Module } from 'vuex';
import type { CCURootState } from '@/store/types';
import Incident from '@/models/Incident';

export interface IncidentModuleState {
  currentIncidentId: number | undefined;
}

const incidentModule: Module<IncidentModuleState, CCURootState> = {
  namespaced: true,
  state: {
    currentIncidentId: undefined,
  },
  getters: {
    currentIncidentId(state) {
      return state.currentIncidentId;
    },
    currentIncident(state) {
      return state.currentIncidentId
        ? Incident.find(state.currentIncidentId)
        : null;
    },
  },
  actions: {},
  mutations: {
    setCurrentIncidentId(
      state,
      currentIncidentId: IncidentModuleState['currentIncidentId'],
    ) {
      state.currentIncidentId = currentIncidentId
        ? Number(currentIncidentId.toString())
        : currentIncidentId;
    },
  },
};

export default incidentModule;
