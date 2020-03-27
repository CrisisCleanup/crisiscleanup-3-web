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
        <case-form class="shadow-xl" />
      </div>
    </template>
  </phone-layout>
</template>

<script>
import PhoneLayout from '@/layouts/Phone.vue';
import AgentBlock from '@/components/phone/blocks/Agent.vue';
import CaseForm from '@/pages/CaseForm';
import AgentBoard from '@/components/phone/AgentBoard/Board.vue';

export default {
  name: 'Controller',
  components: {
    PhoneLayout,
    CaseForm,
    AgentBlock,
    AgentBoard,
  },
};
</script>

<style></style>
