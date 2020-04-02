<template>
  <Loader :loading="loading" class="h-full w-full">
    <template #content>
      <phone-layout>
        <template #grid-start>
          <div class="grid-start">
            <agent-block />
          </div>
        </template>
        <template #grid-main>
          <div class="grid-main">
            <agent-board />
          </div>
        </template>
        <template #grid-end>
          <div class="grid-end flex">
            <case-form
              :key="currentCaseId"
              class="shadow-crisiscleanup-card"
              incident-id="199"
              :pda-id="currentCaseType === 'pda' ? currentCaseId : null"
              disable-claim-and-save
              :before-save="beforeWorksiteSave"
              @savedWorksite="savedWorksite"
              @closeWorksite="closeWorksite"
            />
          </div>
        </template>
      </phone-layout>
    </template>
  </Loader>
</template>

<script>
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import CaseForm from '@/pages/CaseForm.vue';
import AgentBoard from '@/components/phone/AgentBoard/Board.vue';
import { EVENTS as CCEvent } from '@/services/acs.service';
import { EventBus } from '@/event-bus';
import Loader from '@/components/Loader.vue';
import { AgentMixin } from '@/mixins';
import PhoneOutbound from '@/models/PhoneOutbound';
import Pda from '@/models/Pda';

export default {
  name: 'Controller',
  mixins: [AgentMixin],
  components: {
    PhoneLayout,
    CaseForm,
    AgentBlock,
    AgentBoard,
    Loader,
  },
  data() {
    return {
      worksite: null,
      loading: false,
    };
  },
  methods: {
    closeWorksite() {
      EventBus.$emit(CCEvent.OFF_CALL);
    },
    async savedWorksite(worksite) {
      this.worksite = worksite;
      this.$log.debug('Saved worksite: ', worksite);
      if (this.currentCaseType === 'pda') {
        this.$log.debug('associating worksite to pda...');
        await Pda.api().associateWorksite(this.currentCase.id, worksite.id);
      }
      this.$log.debug('updating outbound status with:', this.caseStatusId);

      await PhoneOutbound.api().updateStatus(
        this.currentOutbound.id,
        this.caseStatusId,
        worksite.id,
      );
    },
    async beforeWorksiteSave() {
      if (!this.caseStatusId) {
        this.$toasted.error(this.$t('~~You must set a Call Status!'));
        return false;
      }
      return true;
    },
  },
};
</script>

<style></style>
