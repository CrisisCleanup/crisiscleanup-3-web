import Pda from '@/models/Pda';
import PhoneOutbound from '@/models/PhoneOutbound';
import Worksite from '@/models/Worksite';
import { STATES as CCState } from '@/services/acs.service';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { mapActions, mapGetters } from 'vuex';
import {
  differenceBy,
  reverse,
  sortBy,
  unionBy,
  isNil,
  negate,
  filter,
} from 'lodash';

export const AgentMixin = {
  data() {
    return {
      caseCards: [],
    };
  },
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
        [CCState.PENDING_CALL]: 'connecting',
        [CCState.AGENT_CALLING]: 'connecting',
        [CCState.PAUSED]: 'paused',
        [CCState.ON_CALL]: 'talking',
        [CCState.AGENT_PENDING]: 'connecting',
      };
      if (Object.keys(stateMap).includes(state)) {
        return stateMap[state];
      }
      return state;
    },
    async createCaseCards() {
      const wksites = await this.fetchCasesByType(Worksite, this.worksites);
      const pdas = await this.fetchCasesByType(Pda, this.pdas);
      const cases = filter(
        differenceBy(
          [...Array.from(wksites), ...Array.from(pdas)],
          this.caseCards,
          'id',
        ),
        negate(isNil),
      );

      this.$log.debug('generating cards from cases:', cases);
      const cards = cases.map((c) => ({
        caseNumber: c.case_number ? c.case_number : `PDA-${c.id}`,
        address: c.short_address,
        state: c.state,
        worktype: c.getWorkType ? c.getWorkType() : 'wellness_check',
        fullAddress: c.full_address,
        id: c.id,
        type: this.pdas.includes(c.id) ? 'pda' : 'worksite',
      }));
      if (!this.caseCards.length) {
        cards.push({
          caseNumber: 'New Case',
          address: '123 Example Street',
          state: 'NY',
          worktype: 'unknown',
          id: -1,
          type: 'new',
        });
      }
      this.caseCards = reverse(
        sortBy(unionBy(this.caseCards, cards, 'id'), 'id'),
      );
      this.$log.debug('cards:', this.caseCards);
      return cards;
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
      'modifiedCases',
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
        recent: 'First Call',
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
  watch: {
    async worksites() {
      // Create case cards checks
      // if any actually need to be retrieved
      if (!this.casesResolved) return;
      await this.createCaseCards();
    },
  },
};
