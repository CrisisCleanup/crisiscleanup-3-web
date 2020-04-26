<template>
  <div class="agentgrid grid-container">
    <div class="grid--contact">
      <AgentCard />
    </div>
    <div class="grid--analytics">
      <GeneralStatistics />
    </div>
    <div class="grid--metrics">
      <AgentAnalytics />
    </div>
  </div>
</template>

<script>
import AgentCard from '@/components/phone/AgentCard.vue';
import AgentAnalytics from '@/components/phone/Widgets/AgentAnalytics.vue';
import GeneralStatistics from '@/components/phone/Widgets/GeneralStatistics.vue';

export default {
  name: 'AgentBlock',
  components: {
    AgentCard,
    AgentAnalytics,
    GeneralStatistics,
  },
};
</script>

<style scoped lang="scss">
$areas: contact metrics analytics;

.agentgrid {
  &.grid-container {
    display: inline-grid;
    grid-row-gap: 1rem;
    grid:
      [r1] 'contact' [r1end]
      [r2] 'analytics' [r2end]
      [r3] 'metrics' [r3end]
      / auto;

    .grid {
      @each $area in $areas {
        &--#{area} {
          grid-area: $area;
        }
      }
    }
  }
}
</style>
