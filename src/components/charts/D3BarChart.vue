<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';

export type BarChartT = {|
  group: Date,
  newCases: number,
  closedCases: number,
|};

export default {
  name: 'D3BarChart',
  components: {},
  props: {
    /**
     * Unique chart ID
     */
    chartId: VueTypes.string.def('d3-bar-chart'),
    /**
     * Data for Bar chart
     */
    chartData: VueTypes.arrayOf(VueTypes.shape({}).isRequired).def(() => []),
    /**
     * top, bottom, left, right margins
     */
    marginAll: VueTypes.number.def(5),
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
        this.addHeaderCol();
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

    this.addHeaderCol();
    this.destroyChart();
    this.renderChart();

    window.addEventListener('resize', () => {
      this.destroyChart();
      this.renderChart();
    });
  },

  beforeDestroy() {
    window.removeEventListener('resize', () => {});
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

    getFontSize(): number {
      return (this.getWidth() + this.getHeight()) * 0.012;
    },

    // add header columns to chartData array for d3 stacking
    addHeaderCol() {
      if (!_.isEmpty(this.chartData)) {
        this.chartData.columns = _.keys(this.chartData[0]);
      } else {
        this.chartData.columns = [];
      }
    },

    destroyChart() {
      d3.select(`#${this.chartId} svg`).remove();
    },

    renderChart() {
      console.log(this.chartData);
      const xValues = (d) => d.x;
      const yValues = (d) => d.cases;
      const groups = this.chartData.map((d) => d.group);
      const subgroups = _.filter(this.chartData.columns, (c) => c !== 'group');

      // stack per subgroup
      const stackedData = d3.stack().keys(subgroups)(this.chartData);
      console.log(stackedData);

      // set x scale
      this.x = d3
        .scaleBand()
        .domain(this.chartData.map(xValues))
        .range([this.margin.left, this.getInnerWidth()])
        .padding(0.2);

      // set y scale
      this.y = d3
        .scaleLinear()
        .domain([
          d3.min(this.chartData.map(yValues)),
          d3.max(this.chartData.map(yValues)),
        ])
        .range([this.getInnerHeight(), this.margin.top])
        .nice();

      // set color scale for groups
      this.colorScale = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(['#61D5F8', '#00C4FF']);

      this.svg = d3
        .select(`#${this.chartId}`)
        .append('svg')
        .attr('width', this.getWidth())
        .attr('height', this.getHeight())
        .style(
          'background',
          'linear-gradient(rgb(44, 55, 65, 0.85) 0%, rgba(44, 55, 65, 0.95) 100%)',
        )
        .append('g')
        .attr(
          'transform',
          `translate(${this.margin.left}, ${this.margin.top})`,
        );

      this.addDefs();

      this.svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${this.getInnerHeight() - 10})`)
        .call(d3.axisBottom(this.x).tickSizeOuter(0));

      this.svg
        .append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${this.margin.left}, ${-10})`)
        .call(d3.axisLeft(this.y));

      // this.svg
      //   .selectAll('.bar')
      //   .data(this.chartData)
      //   .enter()
      //   .append('rect')
      //   .attr('x', (d) => this.x(d.x))
      //   .attr('y', (d) => this.getInnerHeight() - 10)
      //   .attr('width', this.x.bandwidth())
      //   .transition()
      //   .duration(1000)
      //   .delay((d, i) => i * 20)
      //   .attr('x', (d) => this.x(d.x))
      //   .attr('y', (d) => -this.y(d.cases) + this.getInnerHeight() - 10)
      //   .attr('width', this.x.bandwidth())
      //   .attr('height', (d) => this.y(d.cases))
      //   .attr('fill', (d) => this.colorScale(d.group));

      // Show the bars
      this.svg
        .append('g')
        .selectAll('g')
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .join('g')
        .attr('fill', (d) => this.colorScale(d.key))
        .selectAll('rect')
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data((d) => d)
        .join('rect')
        .attr('x', (d) => this.x(d.data.x))
        .attr('y', this.getInnerHeight() - 10)
        .attr('width', this.x.bandwidth())
        .transition()
        .duration(1000)
        .delay((d, i) => i * 20)
        .attr('x', (d) => this.x(d.data.x))
        .attr('y', (d) => this.y(d[1]) - this.margin.bottom - 10)
        .attr('height', (d) => this.y(d[0]) - this.y(d[1]))
        .attr('width', this.x.bandwidth());
    },

    addDefs() {
      const defs = this.svg.append('defs');

      const linGradient = defs
        .append('linearGradient')
        .attr('id', `bar-gradient`)
        .attr('gradient-transform', 'rotate(90)');

      linGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', 'rgba(238, 40, 218, 1)');

      linGradient
        .append('stop')
        .attr('offset', '40%')
        .attr('stop-color', 'rgba(97, 213, 248, 1)');

      linGradient
        .append('stop')
        .attr('offset', '60%')
        .attr('stop-color', 'rgba(97, 213, 248, 1)');

      linGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', 'rgba(97, 247, 150, 0.984165)');
    },
  },
};
</script>

<style scoped lang="postcss"></style>
