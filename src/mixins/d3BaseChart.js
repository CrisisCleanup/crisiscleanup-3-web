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
    marginAll: VueTypes.number.def(5),
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
    };
  },

  mounted() {
    this.d3 = require('d3');
    this.$nextTick(this.doRerender);
    window.addEventListener('resize', this.doRerender);
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.doRerender);
  },

  methods: {
    doRerender: _.debounce(() => {
      this.margin.top = this.marginAll;
      this.margin.bottom = this.marginAll;
      this.margin.left = this.marginAll;
      this.margin.right = this.marginAll;

      this.destroyChart();
      this.renderChart();
    }, 1500),

    getWidth() {
      // eslint-disable-next-line no-undef
      return (
        +this.d3.select(`#${this.chartId}`).style('width').slice(0, -2) || 0
      );
    },

    getHeight() {
      // eslint-disable-next-line no-undef
      return (
        +this.d3.select(`#${this.chartId}`).style('height').slice(0, -2) || 0
      );
    },

    getInnerWidth() {
      return this.getWidth() - this.margin.left - this.margin.right;
    },

    getInnerHeight() {
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
