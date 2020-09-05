<template>
  <Card :loading="loading" :overlay="true">
    <template #header>
      <div ref="tabContainer" :class="`left tabs card__tabbar`">
        <div
          v-for="(t, idx) in state.tabs"
          :class="`card__tab tab-item tab-${idx} ${
            idx === activeIndex ? 'active' : ''
          }`"
          :key="t.key"
          @click="() => setTab(idx)"
        >
          <base-text variant="h3" weight="600">
            {{ $t(t.title) }}
          </base-text>
        </div>
        <div ref="tabSelector" class="card__selector" :style="selectorStyle" />
      </div>
    </template>
    <div
      class="flex flex-grow flex-col"
      v-for="(t, idx) in tabs"
      v-show="idx === activeIndex"
      :key="t.key"
    >
      <slot :name="t.key" />
    </div>
  </Card>
</template>

<script>
import VueTypes from 'vue-types';
import useTabs from '@/use/useTabs';
import { ref } from '@vue/composition-api';
import Card from './Card.vue';

export default {
  name: 'TabbedCard',
  components: { Card },
  props: {
    tabs: VueTypes.any,
    routes: VueTypes.any,
    name: VueTypes.string,
    loading: VueTypes.bool.def(false),
  },
  setup(props) {
    const tabContainer = ref(null);
    const tabSelector = ref(null);
    return {
      tabContainer,
      tabSelector,
      ...useTabs({
        tabSelector,
        tabContainer,
        tabs: props.tabs,
        routes: props.routes,
      }),
    };
  },
};
</script>

<style lang="postcss" scoped>
.card {
  &__tabbar {
    display: flex;
    justify-content: flex-start;
    position: relative;
    @apply h-full w-full bg-white;
  }

  &__selector {
    height: 4px;
    @apply bg-primary-light;
    position: absolute;
    z-index: 99;
    bottom: 0;
    width: 100%;
    display: inline-block;
    transition: transform 300ms easeInOutCirc;
  }

  &__tab {
    @apply py-4 px-6 text-crisiscleanup-dark-400;
    position: relative;
    cursor: pointer;
    transition: opacity 300ms easeInOutCirc;
    opacity: 0.5;
    &:hover,
    &.active {
      opacity: 1;
    }
  }
}
</style>
