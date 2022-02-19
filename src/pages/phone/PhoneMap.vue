<template>
  <div id="map" ref="map" class="absolute top-0 left-0 right-0 bottom-0">
    <div
      v-if="mapLoading"
      style="z-index: 1001"
      class="
        absolute
        top-0
        left-0
        right-0
        bottom-0
        flex
        items-center
        justify-center
      "
    >
      <spinner />
    </div>
  </div>
</template>
<script>
export default {
  name: 'PhoneMap',
  props: {
    mapLoading: {
      type: Boolean,
    },
  },
};
</script>
