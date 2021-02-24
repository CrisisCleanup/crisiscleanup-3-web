// @flow
import { ref, onUnmounted, getCurrentInstance } from '@vue/composition-api';

/**
 * Wrapper for `setInterval` with controls
 * Adapted from @vueuse/core
 * @see https://github.com/vueuse/vueuse/blob/main/packages/shared/useIntervalFn/index.ts
 *
 * @param cb
 * @param interval
 * @param immediate
 */
export function useIntervalFn(cb: Function, interval = 1000, immediate = true) {
  let timer = null;
  const isActive = ref(false);

  function clean() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function pause() {
    isActive.value = false;
    clean();
  }

  function resume() {
    isActive.value = true;
    clean();
    timer = setInterval(cb, interval);
  }

  if (immediate && typeof window !== 'undefined') resume();

  if (getCurrentInstance()) {
    onUnmounted(pause);
  }

  return {
    isActive,
    pause,
    resume,
    start: resume,
    stop: pause,
  };
}
