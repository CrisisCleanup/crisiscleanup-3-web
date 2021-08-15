<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';

export type DonutChartDataT = {|
  reportedCases: number,
  completedCases: number,
  claimedCases: number,
|};

export default {
  name: 'CaseDonutChart',
  components: {},
  props: {
    /**
     * Unique chart ID
     */
    chartId: VueTypes.string.def('d3-case-donut-chart'),
    /**
     * Data for Donut chart
     */
    chartData: VueTypes.shape<DonutChartDataT>({
      reportedCases: VueTypes.number,
      completedCases: VueTypes.number,
      claimedCases: VueTypes.number,
    }).def((): DonutChartDataT => ({
      reportedCases: 10,
      completedCases: 20,
      claimedCases: 10,
    })),
    /**
     * top, bottom, left, right margins
     */
    marginAll: VueTypes.number.def(5),
    /**
     * background color / gradient
     */
    bgColor: VueTypes.string.def(
      'linear-gradient(rgb(44, 55, 65, 0.85) 0%, rgba(44, 55, 65, 0.95) 100%)',
    ),
  },

  data() {
    return {
      svg: null,
      x: null,
      y: null,
      xScale: null,
      yScale: null,
      colorScale: null,
      margin: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    };
  },

  watch: {
    chartData: {
      deep: true,
      handler() {
        this.destroyChart();
        this.renderChart();
      },
    },
  },

  mounted() {
    this.margin.top = this.marginAll;
    this.margin.bottom = this.marginAll;
    this.margin.left = this.marginAll;
    this.margin.right = this.marginAll;

    this.destroyChart();
    this.renderChart();

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

  computed: {},

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

    getInnerRadius(): number {
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) / 2;
    },

    getFontSize(): number {
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) * 0.25;
    },

    destroyChart() {
      d3.select(`#${this.chartId} svg`).remove();
    },

    renderChart() {
      // set the color scale
      this.colorScale = d3
        .scaleOrdinal()
        .domain(['reportedCases', 'completedCases', 'claimedCases'])
        .range(['#ffffff', '#61F8B0', '#F79820']);

      // render svg with translated group
      this.svg = d3
        .select(`#${this.chartId}`)
        .append('svg')
        .attr('width', this.getWidth())
        .attr('height', this.getHeight())
        .style('background', this.bgColor)
        .append('g')
        .attr(
          'transform',
          `translate(${this.getWidth() / 2}, ${this.getHeight() / 2})`,
        );

      this.addGlowDefs();

      // Compute the position of each group on the pie:
      const pie = d3
        .pie()
        .sort(null)
        .value((d) => d[1]);

      const data_ready = pie(_.entries(this.chartData));

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      const chart = this.svg
        .selectAll('whatever')
        .data(data_ready)
        .join('path');

      chart
        .attr('d', d3.arc().innerRadius(50).outerRadius(100))
        .transition()
        .duration(500)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.getInnerRadius() * 0.67) // size of the donut hole
            .outerRadius(this.getInnerRadius()),
        )
        .attr('fill', (d) => this.colorScale(d.data[0]))
        .attr('filter', 'url(#glow)')
        .on('end', function () {
          d3.select(this)
            .on('mouseover', () => d3.select(this).attr('stroke', 'white'))
            .on('mouseout', () =>
              d3.select(this).attr('stroke', 'transparent'),
            );
        });

      chart
        .append('title')
        .text((d) => `${_.startCase(d.data[0])}: ${d.data[1]}`);

      this.svg
        .append('text')
        .attr('fill', '#fff')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('font-size', this.getFontSize())
        .text(d3.sum(d3.map(data_ready, (d) => d.data[1]))); // calculate sum of all values
    },

    addGlowDefs() {
      // gradient container
      const defs = this.svg.append('defs');

      // outside glow filter
      const filter = defs.append('filter').attr('id', 'glow');
      filter
        .append('feGaussianBlur')
        .attr('stdDeviation', '0.5')
        .attr('result', 'coloredBlur');

      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    },
  },
};
</script>

<style scoped lang="postcss"></style>
