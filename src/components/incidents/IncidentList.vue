<template>
  <div v-if="incidentList">
    <div class="grid grid-cols-6 items-center justify-center">
      <div class="col-span-2">{{ $t('incidentList.all_incidents') }}</div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">{{ $t('incidentList.cases') }}</div>
        <div>{{ totalCases }}</div>
      </div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">{{ $t('incidentList.claimed') }}</div>
        <div>{{ totalClaimed }}</div>
      </div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">{{ $t('incidentList.calls') }}</div>
        <div>{{ totalCalls / 1000 }}K</div>
      </div>
      <div class="col-span-1 text-center">
        <div class="text-gray-500">{{ $t('incidentList.value') }}</div>
        <div>{{ totalValue / 1000000 }}M</div>
      </div>
    </div>
    <div v-for="(incident, index) in incidentList" :key="index">
      <div class="grid grid-cols-6 items-center justify-center">
        <div class="col-span-2">{{ incident.name }}</div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">{{ $t('incidentList.cases') }}</div>
          <div>{{ incident.cases }}</div>
        </div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">{{ $t('incidentList.claimed') }}</div>
          <div>{{ incident.claimed }}</div>
        </div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">{{ $t('incidentList.calls') }}</div>
          <div>{{ incident.calls / 1000 }}K</div>
        </div>
        <div class="col-span-1 text-center">
          <div class="text-gray-500">{{ $t('incidentList.value') }}</div>
          <div>{{ incident.value / 1000000 }}M</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>{{ $t('incidentList.no_incidents_found') }}</div>
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
