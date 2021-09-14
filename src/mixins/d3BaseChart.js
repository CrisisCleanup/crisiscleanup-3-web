// @flow
import _ from 'lodash';
import { useResizeObserver } from '@/use/useResizeObserver';

export const D3BaseChartMixin = {
  props: {
    /**
     * Unique chart ID
     * Defaults to component name with suffixing unique id
     */
    chartId: {
      type: String,
      default: `d3-chart-${_.uniqueId()}`,
      required: false,
    },
    /**
     * top, bottom, left, right margins
     */
    marginAll: {
      type: Number,
      default: 20,
      required: false,
    },
    /**
     * background color / gradient
     */
    bgColor: {
      type: String,
      default: 'transparent',
      required: false,
    },
    /**
     * enable/disable auto rerender on page resize
     */
    hasAutoResizing: {
      type: Boolean,
      default: true,
      required: false,
    },
    /**
     * render timeout (in ms)
     */
    renderTimeout: {
      type: Number,
      default: 1500,
      required: false,
    },
  },

  data() {
    return {
      margin: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      svg: null,
      x: null,
      y: null,
      resizeObserver: null,
      dimensions: null,
      chartContainer: null,
    };
  },

  mounted() {
    this.d3 = require('d3');
    this.$nextTick(() => {
      this.chartContainer = document.querySelector(`#${this.chartId}`);

      // define and attach ResizeObserver only if `hasAutoResizing` prop is true
      if (this.hasAutoResizing) {
        /**
         * ResizeObserver to rerender chart
         * when dimensions of chart's parent container changes
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API
         */
        this.resizeObserver = useResizeObserver(
          ((this.chartContainer: any): HTMLElement),
          _.debounce((entries: any) => {
            const [first] = entries;
            this.dimensions = first;
            this.doRerender();
          }, this.renderTimeout),
        );

        if (!this.resizeObserver.isSupported) {
          console.error('Resize Observer is not supported on this browser');
        }
      } else {
        this.doRerender();
      }
    });
  },

  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.stop();
    }
  },

  methods: {
    doRerender() {
      this.margin.top = this.marginAll;
      this.margin.bottom = this.marginAll;
      this.margin.left = this.marginAll;
      this.margin.right = this.marginAll;

      this.destroyChart();
      this.renderChart();
    },

    getWidth(): number {
      const chartContainer = this.d3.select(`#${this.chartId}`);
      try {
        if (chartContainer) {
          return +chartContainer.style('width').slice(0, -2) || 0;
        }
      } catch (e) {
        return 0;
      }
      return 0;
    },

    getHeight(): number {
      const chartContainer = this.d3.select(`#${this.chartId}`);
      if (chartContainer) {
        return +chartContainer.style('height').slice(0, -2) || 0;
      }
      return 0;
    },

    getInnerWidth(): number {
      return this.getWidth() - this.margin.left - this.margin.right;
    },

    getInnerHeight(): number {
      return this.getHeight() - this.margin.top - this.margin.bottom;
    },

    renderChart() {
      console.log('base render chart function');
    },

    destroyChart() {
      // eslint-disable-next-line no-undef
      this.d3.select(`#${this.chartId} svg`).remove();
    },
  },
};
