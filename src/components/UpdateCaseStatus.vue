<template>
  <div class="p-3 flex flex-col">
    <StatusDropdown
      class="block"
      :phase="currentIncident.phase"
      @input="$emit('updatedStatus', $event)"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';
import { useState } from '@u3u/vue-hooks';
import StatusDropdown from '@/components/StatusDropdown.vue';
import Incident from '@/models/Incident';

export default defineComponent({
  name: 'UpdateCaseStatus',
  components: { StatusDropdown },
  setup() {
    const { currentIncidentId } = useState('incident', ['currentIncidentId']);
    const currentIncident = computed(() =>
      Incident.find(currentIncidentId.value),
    );
    return { currentIncident };
  },
});
</script>

<style scoped></style>
