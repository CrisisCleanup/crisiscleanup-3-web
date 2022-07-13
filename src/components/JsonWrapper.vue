<template>
  <div class="overflow-auto">
    <json-viewer :value="jsonData" copyable sort></json-viewer>
  </div>
</template>

<script>
import { defineComponent } from '@vue/composition-api';
export default defineComponent({
  name: 'JsonWrapper',
  props: {
    jsonData: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style scoped></style>
