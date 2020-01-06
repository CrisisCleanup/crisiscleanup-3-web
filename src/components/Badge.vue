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

<script>
export default {
  name: 'Badge',
  props: {
    color: String,
    width: String,
    height: String,
  },
};
</script>

<style scoped>
.badge {
  width: 10px;
  height: 10px;
}
</style>
