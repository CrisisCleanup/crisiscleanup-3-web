import Pda from '@/models/Pda';
import PhoneOutbound from '@/models/PhoneOutbound';
import Worksite from '@/models/Worksite';
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
  computed: {
    ...mapGetters('phone', [
      'agentId',
      'agentState',
      'agentAvailable',
      'contactState',
      'currentCase',
      'currentCases',
      'callerId',
      'pdas',
      'worksites',
      'caseStatusId',
      'currentOutbound',
      'currentCaseType',
      'currentCaseId',
      'casesResolved',
      'callerLocale',
      'callType',
      'connectReady',
      'currentExternalResource',
    ]),
    callerName() {
      return this.currentCase ? this.currentCase.name : 'Unknown';
    },
    callerTotalCases() {
      return this.pdas.length + this.worksites.length;
    },
    callerHistory() {
      return {
        total: 2,
        recent: 6,
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
