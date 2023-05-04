/**
 * Use Tabs Hook
 */
// @ts-nocheck TODO(tabiodun): Fix this file
import {
  ref,
  computed,
  reactive,
  type Ref,
  watchEffect,
  onMounted,
  onBeforeUnmount,
  watch,
} from 'vue';
import _ from 'lodash';
import { type Route } from 'vue-router';
import type VueRouter from 'vue-router';
import { useRoute, useRouter } from 'vue-router';
import { useOnResize } from 'vue-composable';
// import Logger from '@/utils/log';

interface Tab {
  key: string;
  title?: string;
  route: string | Record<string, unknown>;
}

interface UseTabProps {
  tabs: Tab[];
  tabContainer: Ref<undefined | HTMLElement>;
  tabSelector: Ref<undefined | HTMLElement>;
  useRoutes?: boolean;
}

/**
 * Hook for using a dynamically resizing tab bar.
 * @param tabs - list of tabs to use.
 * @param useRoutes - optionally use vue router routes.
 * @param tabContainer - HTML ref to tabs parent container.
 * @param tabSelector - HTML ref to tab selector element.
 * @returns {{activeIndex: Ref<UnwrapRef<number>>, setTab: (function(number, Route=): Promise<void>), route: Ref<Route>, selectorState: UnwrapRef<{transform: number, scale: number}>, selectorStyle: ComputedRef<{transform: string}>, state: UnwrapRef<{tabs: *}>}}
 */
export default ({
  tabs,
  useRoutes = false,
  tabContainer,
  tabSelector,
}: UseTabProps) => {
  // const Log = Logger({ name: 'useTabs' });
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
    // Log.debug(tabContainer);
    if (!tabContainer || !tabContainer.value) return;
    const nodes = _.get(tabContainer.value, 'children', []);
    if (nodes.length === 0) return;
    const activeTab: HTMLElement = nodes.item(activeIndex.value);
    // Log.debug(activeTab, activeIndex.value);
    // get scale multiplier (ratio of active tab to tab container width)
    const scaleMulti = activeTab.clientWidth / tabContainer.value.clientWidth;
    // selector displacement from left edge
    const selectOffsetLeft =
      (tabSelector.value && tabSelector.value.offsetWidth / 2) || 0;
    // find the scaled offset and determine distance to left edge of container.
    const selectScaledOffsetDiff = selectOffsetLeft * scaleMulti;
    const selectDistToEdge = selectOffsetLeft - selectScaledOffsetDiff;
    const selectDistToLeftEdge = selectDistToEdge * -1;
    // now take the distance to the left edge of container and add the
    // active tab's offset distance from the left edge.
    selectorState.transform = selectDistToLeftEdge + activeTab.offsetLeft;
    selectorState.scale = scaleMulti;
    // Log.debug('transforming:', selectorState.transform);
    // Log.debug('scaling:', selectorState.scale);
  };

  const selectorStyle = computed(() => ({
    transform: `translateX(${selectorState.transform}px) scaleX(${selectorState.scale})`,
  }));

  // grab router in case tabs are using routes.
  let route: undefined | Ref<Route> = null;
  let router: undefined | VueRouter;
  if (useRoutes) {
    route = useRoute();
    router = useRouter();
  }

  const setTab = async (idx: number, newRoute?: any) => {
    activeIndex.value = idx;
    if (useRoutes && router && newRoute) {
      try {
        await router.replace(newRoute);
      } catch {
        // Log.error('Failed to navigate tab!', e);
      }
    }
  };

  let removeResize;

  onMounted(() => {
    const { remove, width, height } = useOnResize(tabContainer, 100);
    removeResize = remove;
    watch([width, height], () => {
      updateSelector();
    });
    watchEffect(() => {
      updateSelector();
    });
    if (useRoutes && router) {
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
