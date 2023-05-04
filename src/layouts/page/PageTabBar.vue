<template>
  <div class="page h-full w-full">
    <div ref="tabBar" :class="`page__tabbar border-t border-gray-300 flex`">
      <div
        v-for="(t, idx) in state.tabs"
        :key="t.key"
        :class="`page__tab page__tab--${idx} page__tab--${
          idx === activeIndex ? 'active' : ''
        }`"
        @click="() => setTab(idx, t.route)"
      >
        <base-text variant="h3" weight="600">
          {{ $t(t.title) }}
        </base-text>
      </div>
      <div ref="tabSelector" class="page__selector" :style="selectorStyle" />
    </div>
    <div class="page__body h-full w-full">
      <keep-alive>
        <router-view />
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import useTabs from '../../hooks/useTabs';

/**
 * PageTabBar
 * This component is utilized by the Page component.
 * This component should NOT be used directly.
 */
export default defineComponent({
  name: 'PageTabBar',
  props: {
    tabs: {
      type: Array,
    },
  },
  setup(props) {
    const tabBar = ref(null);
    const tabSelector = ref(null);
    return {
      tabBar,
      tabSelector,
      ...useTabs({
        tabContainer: tabBar,
        tabSelector,
        useRoutes: true,
        tabs: props.tabs,
      }),
    };
  },
});
</script>

<style scoped lang="postcss">
$neg-top-space: calc(0rem - theme('spacing.6'));
$neg-left-space: calc(0rem - theme('spacing.0'));
$neg-y-pad: calc(0rem - theme('spacing.4'));
$neg-x-pad: calc(0rem - theme('spacing.5'));
$tab-x-pad: calc(theme('spacing.5') * 4);

.page {
  &__tabbar {
    display: flex;
    @apply bg-white;
    margin: $neg-top-space $neg-left-space $neg-top-space;
    position: fixed;
    z-index: 99;
    width: 100%;
  }
  &__tab {
    @apply py-4 px-5 text-crisiscleanup-dark-400;
    cursor: pointer;
    transition: color 250ms ease;
    position: relative;
    &:hover {
      @apply text-crisiscleanup-dark-400;
    }
    &--active {
      @apply text-crisiscleanup-dark-500;
      font-weight: 700;
    }
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
  &__body {
    @apply pt-16;
  }
}
</style>
