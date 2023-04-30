<template>
  <div v-show="isActive"><slot></slot></div>
</template>

<script lang="ts">
import { computed, inject, onBeforeMount, ref, watch } from 'vue';

export default defineComponent({
  name: 'Step',
  props: {
    name: { required: true, type: String },
    onSave: { required: false, type: Function, default: () => {} },
    selected: { type: Boolean },
    disabled: { type: Boolean, default: false },
  },

  setup(props) {
    const index = ref(0);
    const isActive = ref(false);

    const href = computed(() => {
      return `#${props.name.toLowerCase().replace(/ /g, '-')}`;
    });

    const steps = inject('StepsProvider');

    watch(
      () => steps.selectedIndex,
      () => {
        isActive.value = index.value === steps.selectedIndex;
      },
    );

    onBeforeMount(() => {
      index.value = steps.count;
      steps.count++;
      isActive.value = index.value === steps.selectedIndex;
    });
    return { index, isActive, href };
  },
});
</script>

<style scoped></style>
