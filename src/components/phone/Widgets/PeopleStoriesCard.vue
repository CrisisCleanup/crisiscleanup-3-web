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
import CallHistory from '@/components/phone/Widgets/CallHistory.vue';
import TitledCard from '@/components/cards/TitledCard.vue';
import IndividualStoriesCard from './IndividualStoriesCard.vue';

export default {
  name: 'PeopleStoriesCard',
  components: {
    TitledCard,
    'phoneDashboard.stories_from_people_you_helped': IndividualStoriesCard,
    'phoneDashboard.last_10_people': CallHistory,
  },
  data() {
    return {
      tabs: ['phoneDashboard.last_10_people'],
      selected: 'phoneDashboard.last_10_people',
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
