<template>
  <div
    class="badge flex items-center justify-center rounded-full"
    :style="{
      backgroundColor: color,
      width: width || '10px',
      height: height || '10px',
    }"
  >
    <div>
      <slot />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Badge",
  props: {
    color: {
      type: String,
      default: "",
    },
    width: {
      type: String,
      default: "",
    },
    height: {
      type: String,
      default: "",
    },
  },
});
</script>

<style scoped>
.badge {
  width: 10px;
  height: 10px;
}
</style>
