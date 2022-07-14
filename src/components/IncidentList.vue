<template>
  <div>
    <div class="m-1" v-for="incident in incidents" :key="`${incident.id}`">
      {{ incident.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
export default defineComponent({
  name: 'IncidentList',
  props: {
    incidents: {
      type: Array,
      default: () => [],
    },
  },
});
</script>

<style scoped></style>
