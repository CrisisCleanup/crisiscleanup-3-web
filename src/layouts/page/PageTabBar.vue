<template>
  <div class="page h-full w-full">
    <div ref="tabBar" :class="`page__tabbar border-t border-gray-300`">
      <div
        v-for="(t, idx) in state.tabs"
        :class="`page__tab page__tab--${idx} page__tab--${
          t.key === $route.name ? 'active' : ''
        }`"
        :key="t.key"
        @click="() => setTab(t.route, idx)"
      >
        <base-text variant="h3" weight="600">
          {{ $t(t.title) }}
        </base-text>
      </div>
      <div class="page__selector" :style="selectorStyle" />
    </div>
    <div class="page__body h-full w-full">
      <keep-alive>
        <router-view />
      </keep-alive>
    </div>
  </div>
</template>

<script>
// @flow
import VueTypes from 'vue-types';
import _ from 'lodash';
import {
  reactive,
  ref,
  watchEffect,
  computed,
  onMounted,
} from '@vue/composition-api';

export type Tab = {|
  key: string,
  title?: string,
  route: string | {},
|};

/**
 * PageTabBar
 * This component is utilized by the Page component.
 * This component should NOT be used directly.
 */
export default {
  name: 'PageTabBar',
  props: {
    tabs: VueTypes.arrayOf(
      VueTypes.shape(
        ({
          key: VueTypes.string.isRequired,
          title: VueTypes.string,
          route: VueTypes.oneOfType([VueTypes.string, VueTypes.object]),
        }: Tab),
      ),
    ),
  },
  setup({ tabs }, { root }) {
    const state = reactive({
      tabs: tabs.map(({ key, ...rest }) =>
        reactive(
          _.defaults(rest, {
            title: _.startCase(_.last(_.last(key.split('.')).split('_'))),
            route: { name: key },
            key,
          }),
        ),
      ),
    });
    const activeIndex = ref(0);
    const selectorState = reactive({
      transform: 0,
      scale: 0,
    });
    const setTab = (route, idx) => {
      activeIndex.value = idx;
      try {
        root.$router.replace(route);
      } catch (e) {
        root.$log.error('Ran into an error trying to navigate!');
        root.$log.error(e);
      }
    };
    const tabBar = ref(null);
    const updateSelector = () => {
      if (!tabBar || !tabBar.value) return;
      const nodes = _.get(tabBar.value, 'children', []);
      if (!nodes.length) return;
      const activeTab: HTMLElement = nodes.item(activeIndex.value);
      root.$log.debug(activeTab, activeIndex.value);
      const scaleMulti = activeTab.clientWidth / tabBar.value.clientWidth;
      const newWS = tabBar.value.clientWidth - activeTab.clientWidth; // new whitespace
      const scaledOffset = newWS / 2;
      root.$log.debug(`selector scale multiplier: ${scaleMulti}`);
      root.$log.debug(`scaled offset: ${scaledOffset}`);
      selectorState.transform = scaledOffset - activeTab.offsetLeft;
      selectorState.scale = scaleMulti;
    };

    const selectorStyle = computed(() => ({
      transform: `translateX(-${selectorState.transform}px) scaleX(${selectorState.scale})`,
    }));

    onMounted(() => {
      watchEffect(() => updateSelector());
    });
    return {
      state,
      tabBar,
      setTab,
      updateSelector,
      selectorState,
      selectorStyle,
      activeIndex,
    };
  },
  beforeRouteLeave(to, from, next) {
    // workaround for: https://github.com/vuejs/composition-api/issues/49
    from.matched[0].instances.default.updateSelector();
    next();
  },
};
</script>

<style scoped lang="postcss">
$neg-top-space: calc(0rem - theme('spacing.6'));
$neg-y-pad: calc(0rem - theme('spacing.4'));
$neg-x-pad: calc(0rem - theme('spacing.5'));
$tab-x-pad: calc(theme('spacing.5') * 4);

.page {
  &__tabbar {
    display: flex;
    @apply bg-white;
    margin: $neg-top-space $neg-top-space $neg-top-space;
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
    @apply pt-8;
  }
}
</style>
