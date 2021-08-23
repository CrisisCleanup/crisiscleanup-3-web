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
    this.$nextTick(() => {
      this.margin.top = this.marginAll;
      this.margin.bottom = this.marginAll;
      this.margin.left = this.marginAll;
      this.margin.right = this.marginAll;

      this.destroyChart();
      this.renderChart();
    });

    window.addEventListener(
      'resize',
      _.debounce(() => {
        this.destroyChart();
        this.renderChart();
      }, 1500),
    );
  },

  beforeDestroy() {
    window.removeEventListener('resize', _.noop);
  },

  methods: {
    getWidth(): number {
      return +d3.select(`#${this.chartId}`).style('width').slice(0, -2) || 0;
    },

    getHeight(): number {
      return +d3.select(`#${this.chartId}`).style('height').slice(0, -2) || 0;
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
      d3.select(`#${this.chartId} svg`).remove();
    },
  },
};
