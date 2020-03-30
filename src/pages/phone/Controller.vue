<template>
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
          v-if="caseId"
          class="shadow-xl"
          incident-id="199"
          :pda-id="caseId"
          disable-claim-and-save
          @savedWorksite="savedWorksite"
          @closeWorksite="closeWorksite"
        />
      </div>
    </template>
  </phone-layout>
</template>

<script>
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import CaseForm from '@/pages/CaseForm.vue';
import AgentBoard from '@/components/phone/AgentBoard/Board.vue';
import { EVENTS as CCEvent } from '@/services/acs.service';
import { EventBus } from '@/event-bus';
import { mapGetters } from 'vuex';

export default {
  name: 'Controller',
  components: {
    PhoneLayout,
    CaseForm,
    AgentBlock,
    AgentBoard,
  },
  data() {
    return {
      worksite: null,
    };
  },
  methods: {
    closeWorksite() {
      EventBus.$emit(CCEvent.OFF_CALL);
    },
    savedWorksite(worksite) {
      this.worksite = worksite;
    },
  },
  computed: {
    ...mapGetters('phone', ['caseId']),
  },
};
</script>

<style></style>
