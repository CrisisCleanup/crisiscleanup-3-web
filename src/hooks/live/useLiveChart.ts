import * as d3 from 'd3';
import { useResizeObserver } from '@vueuse/core';
import debounce from 'lodash/debounce';

export default function useLiveChart(
  chartId: string,
  margin: Record<string, any>,
  onRerender: () => void,
  autoResize = false,
  renderTimeout = 1500,
) {
  function getWidth() {
    const chartContainer = d3.select(`#${chartId}`);
    try {
      if (chartContainer) {
        return +chartContainer.style('width').slice(0, -2) || 0;
      }
    } catch {
      return 0;
    }
    return 0;
  }

  function getHeight() {
    const chartContainer = d3.select(`#${chartId}`);
    if (chartContainer) {
      return +chartContainer.style('height').slice(0, -2) || 0;
    }
    return 0;
  }

  function getInnerWidth() {
    return getWidth() - margin.left - margin.right;
  }

  function getInnerHeight() {
    return getHeight() - margin.top - margin.bottom;
  }

  function destroyChart() {
    d3.select(`#${chartId} svg`).remove();
  }

  (() => {
    const chartContainer = document.querySelector(`#${chartId}`) as any;

    // define and attach ResizeObserver only if `hasAutoResizing` prop is true
    if (autoResize && chartContainer) {
      /**
       * ResizeObserver to rerender chart
       * when dimensions of chart's parent container changes
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API
       */
      const resizeObserver = useResizeObserver(
        chartContainer,
        debounce((entries) => {
          const [first] = entries;
          const dimensions = first;
          onRerender();
        }, renderTimeout),
      );

      if (!resizeObserver.isSupported) {
        console.error('Resize Observer is not supported on this browser');
      }
    } else {
      onRerender();
    }
  })();

  return {
    getHeight,
    getWidth,
    getInnerHeight,
    getInnerWidth,
    destroyChart,
  };
}
