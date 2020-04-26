<template>
  <TitledCard :title="selected">
    <component :is="selected" class="tab"></component>
    <!-- Individual Stories Tab -->
    <!-- <div class="stories">
      <hr class="bg-white" />
      <IndividualStoriesCard />
      <IndividualStoriesCard />
    </div> -->
    <!-- Call History Tab -->
    <!-- <call-history /> -->
  </TitledCard>
</template>

<script>
import CallHistory from '@/components/phone/CallHistory.vue';
import TitledCard from '@/components/phone/Cards/TitledCard.vue';
import IndividualStoriesCard from './IndividualStoriesCard.vue';

export default {
  name: 'PeopleStoriesCard',
  components: {
    TitledCard,
    'Stories from people you helped': IndividualStoriesCard,
    'Last 10 people I talk to': CallHistory,
  },
  data() {
    return {
      tabs: ['Last 10 people I talk to'],
      selected: 'Last 10 people I talk to',
    };
  },
};
</script>

<style scoped>
/* tab selection colors */
.tab-btn {
  padding: 6px 10px;
  cursor: pointer;
  margin-bottom: 1rem;
  border: 2px;
  outline: none;
}
.active {
  border-bottom: 3px solid #ffb92f;
}
</style>
