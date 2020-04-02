import Pda from '@/models/Pda';
import PhoneOutbound from '@/models/PhoneOutbound';
import Worksite from '@/models/Worksite';
import { mapActions, mapGetters } from 'vuex';

export const AgentMixin = {
  methods: {
    ...mapActions('phone', ['setCaseStatus']),
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
      'agentState',
      'agentAvailable',
      'contactState',
      'currentCase',
      'callerId',
      'pdas',
      'worksites',
      'caseStatusId',
      'currentOutbound',
      'currentCaseType',
      'currentCaseId',
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
  },
};
