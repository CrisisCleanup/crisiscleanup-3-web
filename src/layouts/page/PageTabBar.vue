<template>
  <div class="page">
    <div class="page__tabbar border-t border-gray-300">
      <div
        v-for="(t, idx) in state.tabs"
        :class="`page__tab page__tab--${idx} page__tab--${
          t.key === $route.name ? 'active' : ''
        }`"
        :key="t.key"
        @click="() => $router.replace(t.route)"
      >
        <base-text variant="h3" weight="600">
          {{ $t(t.title) }}
        </base-text>
      </div>
    </div>
    <div class="page__body">
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
import { reactive } from '@vue/composition-api';

export type Tab = {|
  key: string,
  title?: string,
  route: string | {},
|};

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
  setup({ tabs }) {
    const state = reactive({
      tabs: tabs.map(({ key, ...rest }) =>
        _.defaults(rest, {
          title: _.startCase(_.last(_.last(key.split('.')).split('_'))),
          route: { name: key },
          key,
        }),
      ),
    });
    return {
      state,
    };
  },
};
</script>

<style scoped lang="postcss">
.page {
  --top-spacing: calc(0rem - theme('spacing.6'));
  &__tabbar {
    display: flex;
    @apply bg-white;
    margin: var(--top-spacing) var(--top-spacing) var(--top-spacing);
    position: fixed;
    z-index: 99;
    width: 100%;
  }
  &__tab {
    --neg-y-pad: calc(0rem - theme('spacing.4'));
    --neg-x-pad: calc(0rem - theme('spacing.5'));
    @apply py-4 px-5 text-crisiscleanup-dark-300;
    cursor: pointer;
    transition: color 250ms ease;
    position: relative;
    &:after {
      content: '';
      height: 4px;
      width: 100%;
      @apply bg-primary-light;
      position: absolute;
      z-index: 99;
      margin-left: var(--neg-x-pad);
      bottom: 0;
    }
    &:hover {
      @apply text-crisiscleanup-dark-400;
    }
    &--active {
      @apply text-crisiscleanup-dark-500;
      font-weight: 700;
    }
  }
  &__body {
    @apply pt-8;
  }
}
</style>
