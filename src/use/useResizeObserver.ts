/**
 * useResizeObserver Hook
 */

/**
 * Reports changes to the dimensions of an Element's content or the border-box
 * Adapted from @vueuse/core
 *
 * @see https://github.com/vueuse/vueuse/blob/main/packages/core/useResizeObserver/index.ts
 * @param target
 * @param callback
 * @param options
 * @returns {{stop: () => void, isSupported: boolean}}
 */
export function useResizeObserver(
  target: HTMLElement | Element,
  callback: () => void,
  options: Record<string, unknown> = {},
): {
  isSupported: boolean;
  stop: () => void;
} {
  let observer;
  const isSupported = window && 'ResizeObserver' in window;

  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };

  const start = (el) => {
    cleanup();

    if (isSupported && window && el) {
      observer = new window.ResizeObserver(callback);
      observer.observe(el, options);
    }
  };

  const stop = () => {
    cleanup();
  };

  start(target);
  return {
    isSupported,
    stop,
  };
}
