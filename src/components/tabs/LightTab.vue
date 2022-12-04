<template>
  <!-- Lightweight alternative of Tab.vue which uses v-if to unmount child components when not active -->
  <div v-if="isActive"><slot></slot></div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';

export default {
  name: 'LightTab',
  props: {
    name: { required: true, type: String },
    selected: { type: Boolean },
    disabled: { type: Boolean, default: false },
  },

  setup(props) {
    const isActive = ref(false);

    watch(props.selected, (newValue) => {
      isActive.value = newValue;
    });

    const href = computed(() => {
      return `#${props.name.toLowerCase().replace(/ /g, '-')}`;
    });

    onMounted(() => {
      isActive.value = props.selected;
    });

    return {
      isActive,
      href,
    };
  },
};
</script>

<style scoped></style>
