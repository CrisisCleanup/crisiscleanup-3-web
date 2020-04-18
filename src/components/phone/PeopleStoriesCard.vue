<template>
  <div class="bg-white shadow-crisiscleanup-card">
    <!--- Tabs --->
    <button
      v-for="tab in tabs"
      :key="tab"
      @click="selected = tab"
      :class="['tab-btn', { active: selected === tab }]"
      class="m-1"
    >
      {{ tab }}
    </button>
    <component :is="selected" class="tab"></component>
    <!-- Individual Stories Tab -->
    <div class="stories">
      <hr class="bg-white" />
      <IndividualStoriesCard />
      <IndividualStoriesCard />
    </div>
    <!-- Call History Tab -->
    <call-history />
  </div>
</template>

<script>
import CallHistory from '@/components/phone/CallHistory.vue';
import IndividualStoriesCard from './IndividualStoriesCard.vue';
export default {
  name: 'PeopleStoriesCard',
  components: {
    'Stories from people you helped': IndividualStoriesCard,
    'Last 10 people I talk to': CallHistory,
  },
  data() {
    return {
      tabs: ['Stories from people you helped', 'Last 10 people I talk to'],
      selected: 'Stories from people you helped',
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
