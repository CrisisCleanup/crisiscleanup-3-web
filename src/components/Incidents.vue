<template>
  <div>
    <div v-for="(incident, index) in incidents" :key="index">
      <div class="grid grid-cols-6 my-1">
        <div class="col-span-2">
          {{ incident.name }}
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300">{{ $t('CASES') }}</div>
          <div>{{ incident.cases }}</div>
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300">{{ $t('CLAIMED') }}</div>
          <div>{{ incident.claimed }}</div>
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300">{{ $t('CALLS') }}</div>
          <div>{{ incident.calls }}</div>
        </div>
        <div class="col-span-1 flex flex-col text-center">
          <div class="text-crisiscleanup-dark-300">{{ $t('VALUE') }}</div>
          <div>{{ incident.value }}</div>
        </div>
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
