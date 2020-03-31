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
              class="shadow-xl"
              incident-id="199"
              :pda-id="pdas ? pdas[0] : null"
              disable-claim-and-save
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
import { mapGetters } from 'vuex';
import Loader from '@/components/Loader.vue';

export default {
  name: 'Controller',
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
    savedWorksite(worksite) {
      this.worksite = worksite;
    },
  },
  computed: {
    ...mapGetters('phone', ['pdas', 'worksites', 'currentCase']),
  },
};
</script>

<style></style>
