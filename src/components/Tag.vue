<template>
  <div class="tag flex items-center px-1 justify-center text-xs">
    <div v-if="closeable" class="close px-1" @click="onClose"></div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'Tag',
  props: {
    closeable: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    onClose() {
      this.$emit('closed');
    },
  },
};
</script>

<style scoped>
.tag {
  @apply border bg-white;
  font-weight: lighter;
}

.close {
  margin-top: 1px;
  cursor: pointer;
}

.close:after {
  content: '\00d7';
  font-weight: lighter;
  font-size: 15px;
  opacity: 0.5;
}
</style>
