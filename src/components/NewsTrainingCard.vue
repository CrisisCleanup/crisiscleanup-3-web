<template>
  <div>
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
    <!-- line -->
    <hr class="bg-white" />
    <!--- Content --->
    <component :is="selected" class="tab"></component>
    <!-- line -->
    <hr class="bg-white" />
    <!--- See All Button --->
    <div class="m-3 pb-2">
      <base-link
        variant="bodysm"
        class="bg-crisis-cleanup-yellow-900 text-black align-right"
      >
        See All
      </base-link>
    </div>
  </div>
</template>

<script>
import NewsCard from './NewsCard';
import TrainingsCard from './TrainingsCard';
export default {
  name: 'NewsTrainingCard',
  data() {
    return {
      tabs: ['News', 'Trainings'],
      selected: 'News',
    };
  },
  components: {
    News: NewsCard,
    Trainings: TrainingsCard,
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
