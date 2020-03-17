<template>
  <div>
    <base-button
      v-for="tab in tabs"
      :key="tab"
      @click="selected = tab"
      :class="['border-2 cursor-pointer -my-1', { active: selected === tab }]"
    >
      {{ tab }}
    </base-button>

    <component :is="selected" />
    <!-- line -->
    <hr class="bg-white" />
  </div>
</template>

<script>
import NewsCard from './NewsCard';
import TrainingsCard from './TrainingsCard';
export default {
  name: 'NewsTrainingCard',
  data() {
    return {
      tabs: ['NewsCard', 'TrainingsCard'],
      selected: 'NewsCard',
    };
  },
  components: {
    NewsCard,
    TrainingsCard,
  },
};
</script>

<style scoped>
/* tab selection colors */
.active {
  border-bottom: 3px #f79820;
}
</style>
