<template>
  <div v-if="isActive" class="tab">
    <slot></slot>
  </div>
</template>

<script>
import { onBeforeMount, ref, watch, inject, defineComponent } from 'vue';

export default defineComponent({
  name: 'LightTab',
  props: {
    name: { required: true, type: String },
    selected: { type: Boolean },
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const index = ref(0);
    const isActive = ref(false);

    const tabs = inject('TabsProvider');

    watch(
      () => tabs.selectedIndex,
      () => {
        isActive.value = index.value === tabs.selectedIndex;
      },
    );

    watch(
      () => props.selected,
      () => {
        tabs.selectedIndex = index;
      },
    );

    onBeforeMount(() => {
      index.value = tabs.count;
      tabs.count++;
      isActive.value = index.value === tabs.selectedIndex;
    });
    return { index, isActive };
  },
});
</script>

<style scoped></style>
