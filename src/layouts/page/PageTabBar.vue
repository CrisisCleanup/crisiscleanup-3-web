<template>
  <div class="flex flex-col h-full" data-testid="testAdminDashboardDiv">
    <div
      class="h-max bg-white mx-5 border-t md:flex grid grid-cols-2 justify-around"
    >
      <template v-for="r in state.tabs" :key="r.key">
        <router-link
          :to="r.route"
          class="flex justify-center mx-2 cursor-pointer"
          :data-testid="`testAdminNav${r.title}Link`"
          :class="{ 'router-link-active': route.name === r.route.name }"
        >
          <span class="p-2">
            {{ $t(r.title) }}
          </span>
        </router-link>
      </template>
    </div>
    <div class="flex-grow overflow-auto p-3 mb-16">
      <router-view></router-view>
    </div>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
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
    const route = useRoute();

    return {
      tabBar,
      tabSelector,
      route,
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
.router-link:hover {
  text-decoration: none !important;
}

.router-link:active {
  text-decoration: none !important;
}

.router-link-active {
  background-color: transparent;
  border-bottom: solid 3px theme('colors.primary.light');
  @apply text-black;
}
</style>
