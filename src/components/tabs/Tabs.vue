<template>
  <div class="tabs">
    <ul class="tabs-header flex h-full w-auto">
      <li
        v-for="(tab, index) in tabs"
        :key="index"
        :class="{
          'is-active': index === selectedIndex,
          disabled: tab.disabled,
          [tabClasses]: true,
          [tabActiveClasses]: index === selectedIndex,
          [tabDefaultClasses]: true,
        }"
        class="tab cursor-pointer"
        @click="selectTab(index)"
      >
        {{ tab.props.name }}
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import type { VNode } from 'vue';
import {
  defineComponent,
  reactive,
  provide,
  onMounted,
  onBeforeMount,
  toRefs,
} from 'vue';

interface TabProps {
  name: string;
  disabled: boolean;
}

export default defineComponent({
  name: 'Tabs',
  props: {
    classes: {
      type: String,
      default: '',
    },
    tabDefaultClasses: {
      type: String,
      default: 'py-1 px-3 border-b-2 last:flex-grow',
    },
    tabClasses: {
      type: String,
      default: '',
    },
    tabActiveClasses: {
      type: String,
      default: 'border-b-2 border-primary-light',
    },
    tabDetailsClasses: {
      type: String,
      default: 'tabs-details p-3',
    },
    details: {
      type: Boolean,
      default: true,
    },
  },
  setup(_, { slots, emit }) {
    const state = reactive({
      selectedIndex: 0,
      tabs: [] as VNode<TabProps>[],
      count: 0,
    });

    provide('TabsProvider', state);

    const selectTab = (i: number) => {
      state.selectedIndex = i;
      emit('tabSelected', state.tabs[i]);
    };

    const nextTab = () => {
      if (state.selectedIndex < state.tabs.length - 1) {
        selectTab(state.selectedIndex + 1);
      }
    };

    const previousTab = (i: number) => {
      if (state.selectedIndex > 0) {
        selectTab(state.selectedIndex - 1);
      }
    };

    const isLast = computed(
      () => state.selectedIndex === state.tabs.length - 1,
    );

    onBeforeMount(() => {
      if (slots.default) {
        state.tabs = slots
          .default()
          .filter(
            (child) =>
              child.type.name === 'Tab' || child.type.name === 'LightTab',
          );
      }
    });

    onMounted(() => {
      selectTab(0);
    });

    return { ...toRefs(state), selectTab, nextTab, previousTab, isLast };
  },
});
</script>
