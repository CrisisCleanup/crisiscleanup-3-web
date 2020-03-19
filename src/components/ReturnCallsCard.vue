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
    <!--- Content --->
    <component :is="selected" class="tab"></component>
  </div>
</template>

<script>
import CurrentCallCard from './CurrentCallCard';
import CallScriptsCard from './CallScriptsCard';
export default {
  name: 'ReturnCallsCard',
  data() {
    return {
      tabs: ['Current Call', 'Scripts', 'Resources', 'Live Help'],
      selected: 'Current Call',
    };
  },
  components: {
    'Current Call': CurrentCallCard,
    Scripts: CallScriptsCard,
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
