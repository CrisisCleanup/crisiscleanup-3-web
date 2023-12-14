import type { Module } from 'vuex';
import type { WorkType, Status, IncidentPhase, Portal } from '@/models/types';
import type LocationType from '@/models/LocationType';
import type { CCURootState } from '@/store/types';

export interface EnumsModuleState {
  statuses: Status[];
  workTypes: WorkType[];
  locationTypes: LocationType[];
  phases: IncidentPhase[];
  portal: Portal | undefined;
}

const enumsModule: Module<EnumsModuleState, CCURootState> = {
  namespaced: true,
  state: {
    statuses: [],
    workTypes: [],
    locationTypes: [],
    phases: [],
    portal: undefined,
  },
  getters: {
    statuses(state) {
      return state.statuses;
    },
    workTypes(state) {
      return state.workTypes;
    },
    portal(state) {
      return state.portal;
    },
    phases(state) {
      return state.phases;
    },
    locationTypes(state) {
      return state.locationTypes;
    },
    workTypeCommercialValues(state) {
      return Object.assign(
        {},
        ...state.workTypes.map((s) => ({ [s.key]: s.commercial_value })),
      ) as Record<WorkType['key'], WorkType['commercial_value']>;
    },
  },
  mutations: {
    setStatuses(state, statuses: EnumsModuleState['statuses']) {
      state.statuses = statuses;
    },
    setWorkTypes(state, workTypes: EnumsModuleState['workTypes']) {
      state.workTypes = workTypes;
    },
    setLocationTypes(state, locationTypes: EnumsModuleState['locationTypes']) {
      state.locationTypes = locationTypes;
    },
    setPhases(state, phases: EnumsModuleState['phases']) {
      state.phases = phases;
    },
    setPortal(state, portal: EnumsModuleState['portal']) {
      state.portal = portal;
    },
  },
};

export default enumsModule;
