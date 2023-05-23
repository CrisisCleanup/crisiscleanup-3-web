<template>
  <div v-if="incidentList">
    <div class="grid grid-cols-6 items-center justify-center">
      <div class="col-span-2">~~All Incidents</div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">~~Cases</div>
        <div>{{ totalCases }}</div>
      </div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">~~Claimed</div>
        <div>{{ totalClaimed }}</div>
      </div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">~~Calls</div>
        <div>{{ totalCalls / 1000 }}K</div>
      </div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">~~Value</div>
        <div>{{ totalValue / 1000000 }}M</div>
      </div>
    </div>
    <div v-for="(incident, index) in incidentList" :key="index">
      <div class="grid grid-cols-6 items-center justify-center">
        <div class="col-span-2">{{ incident.name }}</div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">~~Cases</div>
          <div>{{ incident.cases }}</div>
        </div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">~~Claimed</div>
          <div>{{ incident.claimed }}</div>
        </div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">~~Calls</div>
          <div>{{ incident.calls / 1000 }}K</div>
        </div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">~~Value</div>
          <div>{{ incident.value / 1000000 }}M</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>~~No Incidents Found</div>
</template>
<script lang="ts">
import type { PropType } from 'vue';

export default defineComponent({
  name: 'IncidentList',
  props: {
    incidentList: {
      type: Array as PropType<Record<string, any>[]>,
      default: null,
    },
  },
  setup(props: { incidentList: any }) {
    let totalCases = 0;
    let totalClaimed = 0;
    let totalCalls = 0;
    let totalValue = 0;
    for (const incident of props.incidentList) {
      totalCases += incident.cases;
      totalClaimed += incident.claimed;
      totalCalls += incident.calls;
      totalValue += incident.value;
    }

    return {
      totalCases,
      totalClaimed,
      totalCalls,
      totalValue,
    };
  },
});
</script>
