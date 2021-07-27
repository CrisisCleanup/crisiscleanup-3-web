<template>
  <div :id="chartId" v-bind="$attrs" class="stacked-bar-chart"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';

export type BarChartT = {|
  group: Date | number | string,
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
    chartData: VueTypes.arrayOf(
      VueTypes.shape<BarChartT>({
        group: VueTypes.number,
        newCases: VueTypes.number,
        closedCases: VueTypes.number,
      }).def(() => ({ group: 0, newCases: 0, closedCases: 0 })).isRequired,
    ).def((): BarChartT[] => [
      { group: 0, newCases: 28, closedCases: 30 },
      { group: 1, newCases: 43, closedCases: 38 },
      { group: 2, newCases: 81, closedCases: 30 },
      { group: 3, newCases: 19, closedCases: 80 },
      { group: 4, newCases: 52, closedCases: 30 },
      { group: 5, newCases: 24, closedCases: 35 },
    ]),
    /**
     * top, bottom, left, right margins
     */
    marginAll: VueTypes.number.def(25),
    /**
     * background color / gradient
     */
    bgColor: VueTypes.string.def('#232323'),
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
    this.$nextTick(() => {
      this.margin.top = this.marginAll;
      this.margin.bottom = this.marginAll;
      this.margin.left = this.marginAll;
      this.margin.right = this.marginAll;

      this.addHeaderCol();
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
      const groups = this.chartData.map((d) => d.group);
      const subgroups = _.filter(this.chartData.columns, (c) => c !== 'group');

      // stack per subgroup
      const stackedData = d3.stack().keys(subgroups)(this.chartData);

      // set x scale
      this.x = d3
        .scaleBand()
        .domain(groups)
        .range([this.margin.left, this.getInnerWidth()])
        .padding(0.2);

      // set y scale
      this.y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(
            this.chartData.map((c: BarChartT) => c.newCases + c.closedCases),
          ),
        ])
        .range([this.getInnerHeight(), this.margin.top])
        .nice();

      // set color scale for groups
      this.colorScale = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(['#61D5F8', '#00C4FF']);

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
          `translate(${this.margin.left}, ${this.margin.top})`,
        );

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

      d3.selectAll('#bar-chart-tooltip').remove();
      d3.select('body')
        .append('div')
        .attr('id', 'bar-chart-tooltip')
        .attr('class', 'text-xs px-2 py bg-white rounded-md font-bold')
        .attr('style', 'position: absolute; opacity: 0;');

      // render bars
      const bars = this.svg
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
        .attr('x', (d) => this.x(d.data.group))
        .attr('y', this.getInnerHeight() - 10)
        .attr('width', this.x.bandwidth())
        .transition()
        .duration(1000)
        .delay((d, i) => i * 50)
        .ease(d3.easeCubicInOut)
        .attr('x', (d) => this.x(d.data.group))
        .attr('y', (d) => this.y(d[1]) - 10)
        .attr('height', (d) => this.y(d[0]) - this.y(d[1]))
        .attr('width', this.x.bandwidth())
        .on('end', function (d) {
          d3.select(this)
            .on('mouseover', function (event) {
              d3.select(this).attr('class', 'stroke--active');
              d3.select('#bar-chart-tooltip')
                .transition()
                .duration(20)
                .style('opacity', 1)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`)
                .text(d[1] - d[0]);
            })
            .on('mouseout', function () {
              d3.select('#bar-chart-tooltip').style('opacity', 0);
              d3.select(this).attr('class', null);
            })
            .on('mousemove', function (event) {
              d3.select('#bar-chart-tooltip')
                .transition()
                .duration(50)
                .style('opacity', 1)
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`)
                .text(d[1] - d[0]);
            });
        });

      d3.select('#bar-chart-tooltip').on('mouseover', function () {
        d3.select(this).style('opacity', 0);
      });

      this.renderLegend();
      this.animateBars(bars);
    },

    renderLegend() {
      const legend = this.svg
        .append('g')
        .attr('class', 'legend-container')
        .attr('transform', `translate(${this.getInnerWidth() * 0.1}, ${-10})`);

      legend
        .append('g')
        .selectAll('g')
        .data(this.colorScale.range())
        .join('rect')
        .attr('width', '10px')
        .attr('height', '10px')
        .attr('transform', (d, i) => `translate(${i * 70}, ${0})`)
        .attr('fill', (d) => d);

      legend
        .append('g')
        .selectAll('g')
        .data(this.colorScale.domain())
        .join('text')
        .text((d) => _.startCase(d))
        .attr('transform', (d, i) => `translate(${i * 70 + 15}, ${5})`)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '8px')
        .attr('fill', 'white');
    },

    animateBars(bars) {
      const { x, y } = this;
      bars
        .transition()
        .delay(function (d, i) {
          return i * 50;
        })
        .on('start', function repeat() {
          d3.active(this)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .attr('y', (d) => y(d[1]) - 15)
            .attr('height', (d) => y(d[0]) - y(d[1] + 5))
            .transition()
            .duration(500)
            .delay(50)
            .attr('stroke', 'transparent')
            .attr('stroke-width', 0)
            .attr('y', (d) => y(d[1]) - 10)
            .attr('height', (d) => y(d[0]) - y(d[1]))
            .transition()
            .duration(500)
            .delay(5000)
            .on('start', repeat);
        });
    },
  },
};
</script>

<style scoped lang="postcss">
::v-deep .stroke--active {
  stroke: #ffffff;
  stroke-width: 2px;
  transition: all 10ms;
}

::v-deep .stroke--inactive {
  stroke: transparent;
  stroke-width: 0;
  transition: all 500ms;
}
</style>
