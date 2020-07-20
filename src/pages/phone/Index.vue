<template>
  <div class="w-full h-full">
    <component :is="currentComponent" />
    <IncomingPopup v-if="callIncoming && casesResolved" />
  </div>
</template>

<script>
// @flow
import { mapGetters, mapActions } from 'vuex';
import { EventBus } from '@/event-bus';
import { EVENTS as CCEvent, STATES as CCState } from '@/services/acs.service';
import Worksite from '@/models/Worksite';
import PhoneOutbound from '@/models/PhoneOutbound';
import Pda from '@/models/Pda';
import { AgentMixin } from '@/mixins';
import IncomingPopup from '@/components/phone/Popup.vue';
import { mixin as VueTimer } from 'vue-timers';
import { isNil } from 'lodash';
import { getModule } from 'vuex-module-decorators';
import ControllerStore, {
  ControllerPages,
} from '@/store/modules/phone/controller';
import Controller from './Controller.vue';
import Dashboard from './Dashboard.vue';

export default {
  name: 'Phone',
  mixins: [AgentMixin, VueTimer],
  components: { IncomingPopup },
  // timers: {
  //   getNextCallback: { time: 60000, autostart: true, repeat: true },
  // },
  computed: {
    ...mapGetters('phone', [
      'connectReady',
      'agentState',
      'callIncoming',
      'currentPage',
      'currentContactId',
      'casesResolved',
    ]),
    pages() {
      return {
        [ControllerPages.DASHBOARD]: Dashboard,
        [ControllerPages.CONTROLLER]: Controller,
      };
    },
    currentComponent() {
      const controller = getModule(ControllerStore, this.$store);
      return this.pages[controller.view.page];
    },
  },
  methods: {
    ...mapActions('phone', [
      'setPopup',
      'setCurrentCase',
      'setOutboundId',
      'setContactState',
      'setResolved',
    ]),
    async getNextCallback() {
      this.$log.debug('checking next callback...');
      if (
        !this.agentOnCall &&
        !this.currentContactId &&
        this.connectReady &&
        this.agentState === CCState.ROUTABLE
      ) {
        try {
          let aId = this.agentId;
          if (!aId) {
            aId = await this.$store.dispatch('phone/getAgent');
          }
          const callback = await PhoneOutbound.api().getNextOutbound({
            agentId: aId,
          });
          this.$log.debug('serving up next callback...', callback);
          await PhoneOutbound.api().callOutbound(callback.id);
        } catch (e) {
          this.$log.debug('no callbacks available!', e);
        }
      }
    },
    async resolveCases({ outboundIds, pdas, worksites }) {
      this.$log.debug('resolving caller cases...', pdas, worksites);
      const incompletePdas = pdas.filter((p) => isNil(p.worksite));
      await this.addCases({
        worksites,
        pdas: incompletePdas,
      });
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
          if (p.worksite) {
            this.$log.debug(
              `fetching worksite [${p.worksite}] from pda: ${p.id}`,
            );
            if (!Worksite.exists(p.worksite)) {
              await Worksite.api().fetch(p.worksite);
            }
            const wksite = Worksite.find(p.worksite);
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
      this.$log.debug('resolved cases:', this.cases);

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
  },
  created() {
    EventBus.$emit(CCEvent.INIT);
  },
  // created() {
  //   // EventBus.$emit(CCEvent.INIT);
  //   PhoneResource.api().get('/phone_resources', {
  //     dataKey: 'results',
  //   });
  //   EventBus.$on(CCEvent.INBOUND, async (attrs) => {
  //     if (!this.$store.getters['phone/casesResolved']) {
  //       this.$log.info('inbound event recv, resolving cases');
  //       await this.setResolved(true);
  //       await this.resolveCases(attrs);
  //     }
  //   });
  //   EventBus.$on(CCEvent.ON_CALL, () => {
  //     this.setCurrentPage('controller');
  //   });
  //   EventBus.$on(CCEvent.OFF_CALL, () => {
  //     this.$store.dispatch('phone/resetState');
  //     this.setCurrentPage('dashboard');
  //   });
  //   if (!this.connectReady) {
  //     this.$store.dispatch('phone/syncContact').then(() => {
  //       this.$store.dispatch('phone/syncExternalContact');
  //     });
  //     this.unsub = this.$store.subscribe((mutation) => {
  //       if (mutation.type === 'phone/setAgentState') {
  //         this.$toasted.success('Success!');
  //         if (this.callIncoming || this.agentOnCall) {
  //           this.setCurrentPage('controller');
  //         } else {
  //           this.setCurrentPage('dashboard');
  //         }
  //         this.setPopup(false);
  //         this.unsub();
  //       }
  //     });
  //   } else if (this.callIncoming || this.agentOnCall) {
  //     this.setCurrentPage('controller');
  //   } else {
  //     this.setCurrentPage('dashboard');
  //   }
  // },
  // beforeDestroy() {
  //   if (this.unsub) {
  //     this.unsub();
  //   }
  // },
};
</script>

<style></style>
