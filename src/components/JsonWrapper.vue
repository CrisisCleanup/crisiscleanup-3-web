<template>
  <div class="overflow-auto">
    <json-viewer :value="jsonData" copyable sort></json-viewer>
  </div>
</template>

<script lang="ts">
export default defineComponent({
  name: "JsonWrapper",
  props: {
    jsonData: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style scoped></style>
