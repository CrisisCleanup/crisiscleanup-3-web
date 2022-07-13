<template>
  <div>
    <div v-for="(incident, index) in incidents" :key="index">
      <div class="grid grid-cols-6 my-1">
        <div class="col-span-2" :class="$mq === 'sm' ? 'truncate' : ''">
          {{ incident.name }}
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300 truncate">
            {{ $t('CASES') }}
          </div>
          <div>{{ incident.cases }}</div>
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300 truncate">
            {{ $t('CLAIMED') }}
          </div>
          <div class="w-full h-10">
            <CaseDonutChart
              class="w-full h-full"
              :chart-id="`case-donut-chart-${index}`"
              :chart-data="{
                reportedCases: incident.cases,
                claimedCases: incident.claimed,
                completedCases: incident.completed,
              }"
            />
          </div>
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300 truncate">
            {{ $t('CALLS') }}
          </div>
          <div>{{ incident.calls }}</div>
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300 truncate">
            {{ $t('VALUE') }}
          </div>
          <div>{{ incident.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api';
import CaseDonutChart from '@/components/charts/CaseDonutChart.vue';

export default defineComponent({
  name: 'Incidents',
  components: { CaseDonutChart },
  props: {
    incidents: {
      type: Array,
      default: () => [],
    },
  },
});
</script>
