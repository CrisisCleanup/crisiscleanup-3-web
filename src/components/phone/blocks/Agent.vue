<template>
  <div class="agentgrid grid-container">
    <div class="grid--contact">
      <agent-card />
    </div>
    <div class="grid--analytics">
      <agent-analytics-card />
    </div>
    <div class="grid--metrics">
      <operator-metrics />
    </div>
  </div>
</template>

<script>
import AgentCard from '@/components/phone/AgentCard.vue';
import OperatorMetrics from '@/components/phone/OperatorStatisticsCard.vue';
import AgentAnalyticsCard from '@/components/phone/AgentAnalyticsCard.vue';

export default {
  name: 'AgentBlock',
  components: {
    AgentCard,
    OperatorMetrics,
    AgentAnalyticsCard,
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
