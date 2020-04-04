<template>
  <div class="w-full h-full">
    <component :is="page" />
    <incoming-popup v-if="callIncoming && preresolved" :cases="cases" />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex';
import { EventBus } from '@/event-bus';
import { EVENTS as CCEvent, STATES as CCState } from '@/services/acs.service';
import Worksite from '@/models/Worksite';
import PhoneOutbound from '@/models/PhoneOutbound';
import Pda from '@/models/Pda';
import { AgentMixin } from '@/mixins';
import IncomingPopup from '@/components/phone/Popup.vue';
import { mixin as VueTimer } from 'vue-timers';
import Gateway from './Gateway.vue';
import Dashboard from './Dashboard.vue';
import Controller from './Controller.vue';

export default {
  name: 'PhoneLayout',
  mixins: [AgentMixin, VueTimer],
  components: { IncomingPopup },
  data() {
    return {
      page: Gateway,
      preresolved: false,
      cases: {},
    };
  },
  timers: {
    callNextOutbound: {
      time: 30000,
      autostart: true,
      repeat: true,
    },
  },
  computed: {
    ...mapGetters('phone', ['connectReady', 'agentState', 'callIncoming']),
  },
  methods: {
    ...mapActions('phone', [
      'setPopup',
      'setCurrentCase',
      'setOutboundId',
      'setContactState',
    ]),
    async resolveCases({ outboundIds, pdas, worksites }) {
      this.$log.debug('resolving caller cases...');
      const currentCase = {
        id: null,
        type: null,
      };
      const worksiteCases = await this.fetchCasesByType(Worksite, worksites);
      const pdasCases = await this.fetchCasesByType(Pda, pdas);
      const outboundPhones = await this.fetchCasesByType(
        PhoneOutbound,
        outboundIds,
      );
      const freshPdas = [];
      this.$log.debug('caller PDAs:', pdasCases);
      this.$log.debug('caller Worksites:', worksiteCases);
      this.$log.debug('caller outbound Ids:', outboundPhones);

      await Promise.all(
        pdasCases.map(async (p) => {
          if (p.worksite_id) {
            const wksite = await Worksite.api().fetch(p.worksite_id);
            worksiteCases.push(wksite);
          } else {
            freshPdas.push(p);
          }
        }),
      );

      this.cases = {
        worksites: worksiteCases,
        pdas: pdasCases,
      };

      if (freshPdas.length >= 1) {
        this.$log.debug(
          'this appears to be a non-verified PDA call',
          freshPdas,
        );
        currentCase.type = 'pda';
        // set the first one to active
        currentCase.id = freshPdas.shift().id;
        return this.setCurrentCase(currentCase);
      }
      if (worksiteCases.length >= 1) {
        this.$log.debug(
          'this call appears to refer to an existing worksite(s)',
          worksiteCases,
        );
        currentCase.type = 'worksite';
        currentCase.id = worksiteCases.shift().id;
        return this.setCurrentCase(currentCase);
      }
      // no pdas or worksites found
      // must be a new case
      this.$log.debug('this call appears to refer to a new worksite');
      currentCase.type = 'new';
      currentCase.id = -1;
      return this.setCurrentCase(currentCase);
    },
    async callNextOutbound() {
      if (this.contactState === CCState.POLLING && this.agentAvailable) {
        const {
          entities: { phone_outbound },
        } = await PhoneOutbound.api().getNextOutbound();
        if (phone_outbound) {
          this.$log.debug('outbound call queued up...', phone_outbound[0]);
          PhoneOutbound.api().callOutbound(phone_outbound[0].id);
          this.setOutboundId(phone_outbound[0].id);
        }
      }
    },
  },
  created() {
    EventBus.$on(CCEvent.INBOUND, async (attrs) => {
      if (!this.preresolved) {
        await this.resolveCases(attrs);
        this.preresolved = true;
      }
    });
    EventBus.$on(CCEvent.ON_CALL, () => {
      this.page = Controller;
    });
    EventBus.$on(CCEvent.OFF_CALL, () => {
      this.$store.dispatch('phone/resetState');
      this.page = Dashboard;
    });
    if (!this.connectReady) {
      this.unsub = this.$store.subscribe((mutation) => {
        if (mutation.type === 'phone/setAgentState') {
          this.$toasted.success('Success!');
          this.page = Dashboard;
          this.setPopup(false);
          this.unsub();
        }
      });
    } else {
      this.page = Dashboard;
    }
  },
  beforeDestroy() {
    this.unsub();
  },
};
</script>

<style></style>
