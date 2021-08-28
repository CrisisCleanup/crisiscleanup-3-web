// @flow
import _ from 'lodash';
import VueTypes from 'vue-types';

export const D3BaseChartMixin = {
  props: {
    /**
     * Unique chart ID
     * Defaults to component name with suffixing unique id
     */
    chartId: VueTypes.string.def(`d3-chart-${_.uniqueId()}`),
    /**
     * top, bottom, left, right margins
     */
    marginAll: VueTypes.number.def(20),
    /**
     * background color / gradient
     */
    bgColor: VueTypes.string.def('transparent'),
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
    };
  },

  mounted() {
    this.d3 = require('d3');
    this.$nextTick(() => {
      /**
       * ResizeObserver to rerender chart
       * when dimensions of chart's parent container changes
       *
       * @see https://developer.mozilla.org/en-US/docs/Web/API/Resize_Observer_API
       */

      this.resizeObserver = new ResizeObserver(
        _.debounce(() => {
          this.margin.top = this.marginAll;
          this.margin.bottom = this.marginAll;
          this.margin.left = this.marginAll;
          this.margin.right = this.marginAll;

          this.destroyChart();
          this.renderChart();
          console.log('rerender', this.chartId);
        }, 1500),
      );

      this.resizeObserver.observe(document.querySelector(`#${this.chartId}`));
    });
  },

  beforeDestroy() {
    this.resizeObserver.disconnect();
  },

  methods: {
    doRerender: _.debounce(function () {
      this.margin.top = this.marginAll;
      this.margin.bottom = this.marginAll;
      this.margin.left = this.marginAll;
      this.margin.right = this.marginAll;

      this.destroyChart();
      this.renderChart();
    }, 1500),

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
