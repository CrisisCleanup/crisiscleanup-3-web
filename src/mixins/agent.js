import Pda from '@/models/Pda';
import PhoneOutbound from '@/models/PhoneOutbound';
import Worksite from '@/models/Worksite';
import { STATES as CCState } from '@/services/acs.service';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { mapActions, mapGetters } from 'vuex';

export const AgentMixin = {
  methods: {
    ...mapActions('phone', [
      'setCaseStatus',
      'setCurrentPage',
      'setCurrentCase',
      'setContactState',
      'addCases',
      'setResolved',
      'endCurrentCall',
      'acceptCallback',
    ]),
    async fetchCasesByType(caseModel, ids) {
      const cases = await Promise.all(
        ids.map(async (id) => {
          if (!caseModel.exists(id)) {
            await caseModel.api().get(`/${caseModel.entity}/${id}`);
          }
          return caseModel.find(id);
        }),
      );
      return cases;
    },
    async fetchAllCases() {
      const worksites = await this.fetchCasesByType(Worksite, this.worksites);
      const pdas = await this.fetchCasesByType(Pda, this.pdas);
      // not technically a case, but it works
      const outboundIds = await this.fetchCasesByType(
        PhoneOutbound,
        this.outboundIds,
      );
      return { worksites, pdas, outboundIds };
    },
    getStateFriendlyName(value) {
      let state = value;
      if (value.includes('#')) {
        [, , state] = value.split('#');
      }
      const stateMap = {
        [CCState.ROUTABLE]: 'online',
        [CCState.PENDING_CALL]: 'talking',
        [CCState.AGENT_CALLING]: 'talking',
        [CCState.PAUSED]: 'paused',
        [CCState.ON_CALL]: 'talking',
        [CCState.AGENT_PENDING]: 'talking',
      };
      if (Object.keys(stateMap).includes(state)) {
        return stateMap[state];
      }
      return state;
    },
  },
  computed: {
    ...mapGetters('phone', [
      'agentId',
      'agentState',
      'agentAvailable',
      'contactState',
      'contactAttributes',
      'currentCase',
      'currentCases',
      'currentDnis',
      'callerId',
      'pdas',
      'worksites',
      'caseStatusId',
      'currentOutbound',
      'currentCaseType',
      'currentCaseId',
      'currentAniIncident',
      'casesResolved',
      'callerLocale',
      'callType',
      'connectReady',
      'currentExternalResource',
      'contactMetrics',
    ]),
    callerName() {
      return this.currentCase ? this.currentCase.name : 'Unknown';
    },
    callerTotalCases() {
      return this.pdas.length + this.worksites.length;
    },
    callerHistory() {
      if (this.currentDnis) {
        return {
          total: this.currentDnis.totalCalls,
          recent: this.currentDnis.lastCallDays,
        };
      }
      return {
        total: 1,
        recent: 'Never',
      };
    },
    callerFormattedNumber() {
      if (!this.callerId) return '';
      const number = parsePhoneNumberFromString(this.callerId);
      return number.formatNational();
    },
    extResourceFormattedNumber() {
      if (!this.currentExternalResource) return '';
      const number = parsePhoneNumberFromString(
        this.currentExternalResource.dnis,
      );
      return number.formatNational();
    },
  },
};
