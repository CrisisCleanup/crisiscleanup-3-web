<template>
  <div class="tabs">
    <div class="tabs-header">
      <div
          v-for="(tab, index) in tabs"
          :key="index"
          @click="selectTab(index)"
          :class="{'tab-selected': index === selectedIndex}"
          class="tab"
      >
        {{ tab.props.title }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {defineComponent, reactive, provide, onMounted, onBeforeMount, toRefs, VNode} from "vue";

interface TabProps {
  title: string;
}

export default defineComponent({
  name: "Tabs",
  setup(_, {slots}) {
    const state = reactive({
      selectedIndex: 0,
      tabs: [] as VNode<TabProps>[],
      count: 0
    });

    provide("TabsProvider", state);

    const selectTab = (i: number) => {
      state.selectedIndex = i;
    };

    onBeforeMount(() => {
      if (slots.default) {
        state.tabs = slots.default().filter((child) => child.type.name === "Tab");
      }
    });

    onMounted(() => {
      selectTab(0);
    });

    return {...toRefs(state), selectTab};
  }
});
</script>
