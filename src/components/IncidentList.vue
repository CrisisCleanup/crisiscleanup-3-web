<template>
  <div>
    <div class="m-1" v-for="incident in incidents">
      {{ incident.name }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'IncidentList',
  props: {
    incidents: {
      type: Array,
      default: () => [],
    },
  },
};
</script>

<style scoped></style>
