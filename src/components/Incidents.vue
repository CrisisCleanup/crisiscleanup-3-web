<template>
  <div class="grid grid-cols-6">
    <div v-for="(incident, index) in incidents" :key="index">
      <div class="col-span-2">
        {{ incident.name }}
      </div>
      <div class="col-span-1 flex flex-col">
        <div>{{ $t('CASES') }}</div>
        <div>{{ incident.cases }}</div>
      </div>
      <div class="col-span-1 flex flex-col">
        <div>{{ $t('CLAIMED') }}</div>
        <div>{{ incident.claimed }}</div>
      </div>
      <div class="col-span-1 flex flex-col">
        <div>{{ $t('CALLS') }}</div>
        <div>{{ incident.calls }}</div>
      </div>
      <div class="col-span-1 flex flex-col">
        <div>{{ $t('VALUE') }}</div>
        <div>{{ incident.value }}</div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'Incidents',
  props: {
    incidents: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
