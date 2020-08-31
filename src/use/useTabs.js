// @flow
/**
 * Use Tabs Hook
 */

import {
  ref,
  computed,
  reactive,
  Ref,
  watchEffect,
  onMounted,
  onBeforeUnmount,
  watch,
} from '@vue/composition-api';
import _ from 'lodash';
import { useRouter } from '@u3u/vue-hooks';
import Logger from '@/utils/log';
import VueRouter, { Route } from 'vue-router';
import { useOnResize } from 'vue-composable';

export type Tab = {|
  key: string,
  title?: string,
  route: string | {},
|};

export type UseTabProps = {|
  tabs: Tab[],
  tabContainer: Ref<null | HTMLElement>,
  tabSelector: Ref<null | HTMLElement>,
  routes?: any,
|};

/**
 * Hook for using a dynamically resizing tab bar.
 * @param tabs - list of tabs to use.
 * @param routes - optionally pass routes to route tabs to.
 * @param tabContainer - HTML ref to tabs parent container.
 * @param tabSelector - HTML ref to tab selector element.
 * @returns {{activeIndex: Ref<UnwrapRef<number>>, setTab: (function(number, Route=): Promise<void>), route: Ref<Route>, selectorState: UnwrapRef<{transform: number, scale: number}>, selectorStyle: ComputedRef<{transform: string}>, state: UnwrapRef<{tabs: *}>}}
 */
export default ({ tabs, routes, tabContainer, tabSelector }: UseTabProps) => {
  const Log = Logger({ name: 'useTabs' });
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

  const updateSelector = () => {
    Log.debug(tabContainer);
    if (!tabContainer || !tabContainer.value) return;
    const nodes = _.get(tabContainer.value, 'children', []);
    if (!nodes.length) return;
    const activeTab: HTMLElement = nodes.item(activeIndex.value);
    Log.debug(activeTab, activeIndex.value);
    // get scale multiplier (ratio of active tab to tab container width)
    const scaleMulti = activeTab.clientWidth / tabContainer.value.clientWidth;
    // selector displacement from left edge
    const selectOffsetLeft = tabSelector.value.offsetWidth / 2;
    // find the scaled offset and determine distance to left edge of container.
    const selectScaledOffsetDiff = selectOffsetLeft * scaleMulti;
    const selectDistToEdge = selectOffsetLeft - selectScaledOffsetDiff;
    const selectDistToLeftEdge = selectDistToEdge * -1;
    // now take the distance to the left edge of container and add the
    // active tab's offset distance from the left edge.
    selectorState.transform = selectDistToLeftEdge + activeTab.offsetLeft;
    selectorState.scale = scaleMulti;
    Log.debug('transforming:', selectorState.transform);
    Log.debug('scaling:', selectorState.scale);
  };

  const selectorStyle = computed(() => ({
    transform: `translateX(${selectorState.transform}px) scaleX(${selectorState.scale})`,
  }));

  // grab router in case tabs are using routes.
  let route: null | Ref<Route>;
  let router: null | VueRouter;
  if (!_.isNil(routes)) {
    const routerHook = useRouter();
    route = routerHook.route;
    router = routerHook.router;
  }

  const setTab = async (idx: number, newRoute?: Route) => {
    activeIndex.value = idx;
    if (newRoute && router) {
      try {
        await router.replace(newRoute);
      } catch (e) {
        Log.error('Failed to navigate tab!', e);
      }
    }
  };

  let removeResize;

  onMounted(() => {
    const { remove, width, height } = useOnResize(tabContainer, 100);
    removeResize = remove;
    watch([width, height], () => updateSelector());
    watchEffect(() => updateSelector());
    if (!_.isNil(routes) && router) {
      router.beforeEach((to, from, next) => {
        updateSelector();
        next();
      });
    }
  });

  onBeforeUnmount(() => {
    if (removeResize) {
      removeResize();
    }
  });

  return {
    state,
    activeIndex,
    selectorState,
    setTab,
    selectorStyle,
    route,
  };
};
