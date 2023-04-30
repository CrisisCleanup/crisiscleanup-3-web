<template>
  <div v-if="isActive" class="tab">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { onBeforeMount, ref, watch, inject, defineComponent } from 'vue';

export default defineComponent({
  name: 'LightTab',
  props: {
    name: { required: true, type: String },
    selected: { type: Boolean },
    disabled: { type: Boolean, default: false },
  },
  setup() {
    const index = ref(0);
    const isActive = computed(() => index.value === tabs.selectedIndex);

    const tabs = inject('TabsProvider');

    onBeforeMount(() => {
      index.value = tabs.count;
      tabs.count++;
    });
    return { index, isActive };
  },
});
</script>

<style scoped></style>
