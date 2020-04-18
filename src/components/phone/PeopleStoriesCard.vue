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
    <!-- Header -->
    <base-text
      variant="h3"
      class="text-crisiscleanup-dark-400 justify-between font-bold m-1 p-3"
    >
      Stories from people you helped
    </base-text>
    <!-- line -->
    <hr class="bg-white" />
    <!-- Individual Stories Tab -->
    <div class="stories">
      <i-story />
      <i-story />
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
    'i-story': IndividualStoriesCard,
    CallHistory,
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
