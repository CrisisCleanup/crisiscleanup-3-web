<template>
  <div :id="chartId" v-bind="$attrs" class="stacked-bar-chart"></div>
</template>

<script>
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';
import { D3BaseChartMixin } from '@/mixins';

export default {
  name: 'D3BarChart',
  mixins: [D3BaseChartMixin],
  components: {},
  props: {
    /**
     * Data for Bar chart
     */
    chartData: VueTypes.arrayOf(VueTypes.object).def(() => [
      { group: new Date('2021-08-15'), newCases: 28, closedCases: 30 },
      { group: new Date('2021-08-16'), newCases: 43, closedCases: 38 },
      { group: new Date('2021-08-17'), newCases: 81, closedCases: 30 },
      { group: new Date('2021-08-18'), newCases: 19, closedCases: 80 },
      { group: new Date('2021-08-19'), newCases: 52, closedCases: 30 },
      { group: new Date('2021-08-20'), newCases: 24, closedCases: 35 },
    ]),
    /**
     * Stacked | Unstacked
     */
    isStacked: VueTypes.bool.def(false),
  },

  data() {
    return {
      colorScale: null,
      colorRange: ['#00C4FF', '#728090'],
    };
  },

  watch: {
    chartData: {
      handler(newValue, oldValue) {
        if (!_.isEmpty(newValue) && _.isEmpty(oldValue)) {
          this.doRerender();
        } else {
          console.log('No data found');
        }
      },
    },
  },

  methods: {
    getFontSize() {
      return (this.getWidth() + this.getHeight()) * 0.012;
    },

    loadSvg() {
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
    },

    loadAxes() {
      this.svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${this.getInnerHeight()})`)
        .call(
          d3
            .axisBottom(this.x)
            .tickValues(this.x.domain().filter((d, i) => !(i % 5))) // render ticks with 5 day gaps
            .tickFormat((d) =>
              d3.timeFormat('%b %d')(new Date(d) || new Date()),
            )
            .tickSizeOuter(0),
        )
        .selectAll('text')
        .style('font-size', '8px')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-35)')
        .append('title')
        .text((d) => this.$t(`${d}`));

      this.svg
        .append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${this.margin.left}, ${0})`)
        .call(d3.axisLeft(this.y));
    },

    loadTooltip() {
      d3.selectAll('#bar-chart-tooltip').remove();
      d3.select('body')
        .append('div')
        .attr('id', 'bar-chart-tooltip')
        .attr('class', 'text-xs px-2 py bg-white rounded-md font-bold')
        .attr('style', 'position: absolute; opacity: 0;')
        .on('mouseover', function () {
          // remove ghosted tooltip on mouseover
          d3.select(this).style('opacity', 0);
        });
    },

    renderChart() {
      // override default bottom margin to make space for x-axis
      this.margin.bottom = 40;
      // add header columns to chartData array for d3 stacking
      if (!_.isEmpty(this.chartData)) {
        this.chartData.columns = _.keys(this.chartData[0]);
      } else {
        this.chartData.columns = [];
      }
      if (this.isStacked) {
        this.renderStackedChart();
      } else {
        this.renderUnstackedChart();
      }
    },

    renderUnstackedChart() {
      const newCases = this.chartData.map((d) => d.newCases);
      const closedCases = this.chartData.map((d) => d.closedCases);
      const groups = this.chartData.map((d) => d.group);
      const subgroups = _.filter(this.chartData.columns, (c) => c !== 'group');
      const { addHoverEffects } = this;

      // set x scale
      this.x = d3
        .scaleBand()
        .domain(groups)
        .range([this.margin.left, this.getInnerWidth()])
        .padding(0.2);

      // set y scale
      this.y = d3
        .scaleLinear()
        .domain([0, d3.max([d3.max(newCases), d3.max(closedCases)])])
        .range([this.getInnerHeight(), this.margin.top])
        .nice();

      // set color scale for groups
      this.colorScale = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(this.colorRange);

      this.loadSvg();
      this.loadAxes();
      this.loadTooltip();

      const closedCaseBars = this.svg
        .append('g')
        .attr('class', 'closed-case-bars')
        .selectAll('g')
        .data(this.chartData)
        .join('rect')
        .attr('x', (d) => this.x(d.group))
        .attr('y', this.getInnerHeight())
        .attr('width', this.x.bandwidth())
        .transition()
        .duration(1000)
        .delay((d, i) => i * 50)
        .ease(d3.easeCubicInOut)
        .attr('x', (d) => this.x(d.group))
        .attr('y', (d) => this.y(d.closedCases))
        .attr('width', this.x.bandwidth())
        .attr('height', (d) => this.getInnerHeight() - this.y(d.closedCases))
        .attr('fill', this.colorScale('closedCases'))
        .on('end', function (d) {
          addHoverEffects(this, d.closedCases);
        });

      const newCaseBars = this.svg
        .append('g')
        .attr('class', 'new-case-bars')
        .selectAll('g')
        .data(this.chartData)
        .join('rect')
        .attr('x', (d) => this.x(d.group))
        .attr('y', this.getInnerHeight())
        .attr('width', this.x.bandwidth())
        .transition()
        .duration(1000)
        .delay((d, i) => i * 50)
        .ease(d3.easeCubicInOut)
        .attr('x', (d) => this.x(d.group))
        .attr('y', (d) => this.y(d.newCases))
        .attr('width', this.x.bandwidth())
        .attr('height', (d) => this.getInnerHeight() - this.y(d.newCases))
        .attr('fill', this.colorScale('newCases'))
        .on('end', function (d) {
          addHoverEffects(this, d.newCases);
        });

      this.renderLegend();
      this.animateBars(closedCaseBars);
      this.animateBars(newCaseBars);
    },

    renderStackedChart() {
      const groups = this.chartData.map((d) => d.group);
      const subgroups = _.filter(this.chartData.columns, (c) => c !== 'group');
      const { addHoverEffects } = this;

      // normalize data to filter out falsy values
      const normalizedData = this.chartData.map((item) => ({
        group: new Date(item.group) ? item.group : '',
        newCases: item.newCases ?? 0,
        closedCases: item.closedCases ?? 0,
      }));

      // stack per subgroup
      const stackedData = d3.stack().keys(subgroups)(normalizedData);

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
          d3.max(this.chartData.map((c) => c.newCases + c.closedCases)),
        ])
        .range([this.getInnerHeight(), this.margin.top])
        .nice();

      // set color scale for groups
      this.colorScale = d3
        .scaleOrdinal()
        .domain(subgroups)
        .range(this.colorRange);

      this.loadSvg();
      this.loadAxes();
      this.loadTooltip();

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
        .attr('y', this.getInnerHeight())
        .attr('width', this.x.bandwidth())
        .transition()
        .duration(1000)
        .delay((d, i) => i * 50)
        .ease(d3.easeCubicInOut)
        .attr('x', (d) => this.x(d.data.group))
        .attr('y', (d) => this.y(d[1]))
        .attr('height', (d) => this.y(d[0]) - this.y(d[1]))
        .attr('width', this.x.bandwidth())
        .on('end', function (d) {
          addHoverEffects(this, d[1] - d[0]);
        });

      this.renderLegend();
      this.animateBars(bars);
    },

    renderLegend() {
      const legend = this.svg
        .append('g')
        .attr('class', 'legend-container')
        .attr('transform', `translate(${this.getInnerWidth() * 0.1}, ${0})`);

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
        .text((d) => this.$t(`${_.startCase(d)}`))
        .attr('transform', (d, i) => `translate(${i * 70 + 15}, ${5})`)
        .attr('dominant-baseline', 'middle')
        .style('font-size', '8px')
        .attr('fill', 'white');
    },

    addHoverEffects(ctx, tooltipText) {
      const { $t } = this;
      d3.select(ctx)
        .on('mouseover', function (event) {
          d3.select(this).attr('class', 'stroke--active');
          d3.select('#bar-chart-tooltip')
            .transition()
            .duration(20)
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`)
            .text($t(`~~${tooltipText}`));
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
            .text($t(`~~${tooltipText}`));
        });
    },

    animateBars(bars) {
      bars
        .transition()
        .delay(function (d, i) {
          return i * 50;
        })
        .on('start', function repeat() {
          d3.active(this)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .transition()
            .duration(500)
            .delay(50)
            .attr('stroke', 'transparent')
            .attr('stroke-width', 0)
            .transition()
            .duration(500)
            .delay(10000)
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
