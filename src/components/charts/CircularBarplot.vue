<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';

// add proper Date type validator to VueTypes
VueTypes.extend({
  name: 'date',
  getter: true,
  type: Date,
  validator(value) {
    return (
      Object.prototype.toString.call(value) === '[object Date]' &&
      Number.isFinite(value)
    );
  },
});

export type ChartDataT = {|
  name: string,
  timestamp: Date,
  open: number,
  closed: number,
|};

export default {
  name: 'CircularBarplot',
  props: {
    chartData: VueTypes.arrayOf(
      VueTypes.shape<ChartDataT>({
        name: VueTypes.string.isRequired,
        timestamp: VueTypes.date.isRequired,
        open: VueTypes.number,
        closed: VueTypes.number,
      }),
    ).def((): ChartDataT =>
      Array.from({ length: 24 * 6 }, (v, i) => ({
        name: `id-${i}`,
        timestamp: new Date(
          +new Date() - Math.floor(Math.random() * 100000000),
        ).getTime(),
        closed: Math.floor(Math.random() * 200 + 25),
        open: Math.floor(Math.random() * 200 + 25),
      })),
    ),

    /**
     * Chart type for
     * stacked | unstacked bars
     */
    isStacked: {
      type: Boolean,
      required: false,
      default: true,
    },

    /**
     * Unique chart ID
     */
    chartId: VueTypes.string.def('d3-circular-barplot'),
    /**
     * top, bottom, left, right margins
     */
    marginAll: VueTypes.number.def(5),
    /**
     * background color / gradient
     */
    bgColor: VueTypes.string.def('#232323'),
  },

  data() {
    return {
      margin: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    };
  },

  mounted() {
    if (!_.isEmpty(this.chartData)) {
      this.$nextTick(() => {
        this.margin.top = this.marginAll;
        this.margin.bottom = this.marginAll;
        this.margin.left = this.marginAll;
        this.margin.right = this.marginAll;

        this.destroyChart();
        this.renderChart(this.chartData);
      });
    } else {
      console.log('No data found');
    }

    window.addEventListener(
      'resize',
      _.debounce(() => {
        if (!_.isEmpty(this.chartData)) {
          this.destroyChart();
          this.renderChart(this.chartData);
        }
      }, 1500),
    );
  },

  watch: {
    chartData: {
      immediate: true,
      handler(data) {
        if (!_.isEmpty(data)) {
          this.destroyChart();
          this.renderChart(data);
        } else {
          console.log('No data found');
        }
      },
    },

    isStacked: {
      handler() {
        this.destroyChart();
        this.renderChart(this.chartData);
      },
    },
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

    getInnerRadius(): number {
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) / 5;
    },

    getOuterRadius(): number {
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) / 2;
    },

    getFontSize(): number {
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) * 0.026;
    },

    renderInnerCircle(svg) {
      return svg
        .append('g')
        .append('circle')
        .attr('r', this.getInnerRadius())
        .attr('fill', '#13141Eaa');
    },

    renderChart(data) {
      // append the svg object
      const svg = d3
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

      // Add inner circle
      this.renderInnerCircle(svg);

      // add x and y scales
      const x = d3
        .scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing
        .domain(data.map((d) => d.name)); // The domain of the X axis is the list of states.

      const y = d3
        .scaleRadial()
        .range([this.getInnerRadius(), this.getOuterRadius()]) // Domain will be define later.
        .domain([
          0,
          this.isStacked
            ? d3.max(data, (d) => d.open) + d3.max(data, (d) => d.closed)
            : Math.max(
                d3.max(data, (d) => d.closed),
                d3.max(data, (d) => d.open),
              ),
        ]); // set domain based on chart type (stacked | unstacked)

      const textContainer = svg
        .append('g')
        .attr('class', 'text-label')
        .attr('transform', `translate(0, ${this.getInnerRadius() * 0.1})`)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('fill', '#fefefe');

      this.renderOverallInfo(textContainer, data);

      this.renderOpenCases(svg, data, x, y, textContainer);

      this.renderClosedCases(svg, data, x, y, textContainer);

      this.renderAxesAndLabels(svg, data, x, y);
    },

    renderOverallInfo(textContainer, data) {
      this.renderCaseInfo(textContainer, {
        name: 'Overall Info',
        timestamp: new Date(),
        closed: d3.sum(data.map((d) => d.closed)),
        open: d3.sum(data.map((d) => d.open)),
      });
    },

    renderOpenCases(svg, data, x, y, textContainer) {
      const vm = this;
      svg
        .append('g')
        .selectAll('path')
        .data(data, (d) => d.name)
        .join('path')
        .attr('fill', '#728091')
        .attr('transform', 'scale(1.4)')
        .classed('open-case-path', true)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(y(0))
            .outerRadius((d) => y(d.closed))
            .startAngle((d) => x(d.name))
            .endAngle(x(0) + x.bandwidth())
            .padAngle(0.015)
            .padRadius((d) => y(d.closed)),
        )
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('filter', 'brightness(70%)')
            .style('transform', 'scale(1.015)')
            .style('opacity', '1')
            .style('transition', 'all 200ms');
          vm.renderCaseInfo(textContainer, d);
        })
        .on('mouseout', function (event, d) {
          d3.select(this)
            .style('filter', 'brightness(100%)')
            .style('transform', 'scale(1)')
            .style('transition', 'all 200ms');

          vm.renderOverallInfo(textContainer, d);
        })
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          this.isStacked
            ? d3
                .arc()
                .innerRadius((d) => y(d.closed))
                .outerRadius((d) => y(d.closed + d.open))
                .startAngle((d) => x(d.name))
                .endAngle((d) => x(d.name) + x.bandwidth())
                .padAngle(0.015)
                .padRadius((d) => y(d.closed))
            : d3
                .arc()
                .innerRadius(this.getInnerRadius())
                .outerRadius((d) => y(d.open))
                .startAngle((d) => x(d.name))
                .endAngle((d) => x(d.name) + x.bandwidth())
                .padAngle(0.003)
                .padRadius(this.getInnerRadius()),
        )
        .attr('transform', 'scale(1)');
    },

    renderClosedCases(svg, data, x, y, textContainer) {
      const vm = this;

      svg
        .append('g')
        .selectAll('path')
        .data(data, (d) => d.name)
        .join('path')
        .attr('fill', '#61D5F8')
        .attr('class', 'closed-case-path')
        .attr('transform', 'scale(1.2)')
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(y(0))
            .outerRadius(y(0))
            .startAngle((d) => x(d.name))
            .endAngle(x(0) + x.bandwidth())
            .padAngle(0.03)
            .padRadius(this.getInnerRadius()),
        )
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('filter', 'brightness(70%)')
            .style('transform', 'scale(1.015)')
            .style('opacity', '1')
            .style('transition', 'all 200ms');

          vm.renderCaseInfo(textContainer, d);
        })
        .on('mouseout', function () {
          d3.select(this)
            .style('filter', 'brightness(100%)')
            .style('transform', 'scale(1)')
            .style('transition', 'all 200ms');

          vm.renderOverallInfo(textContainer, data);
        })
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.getInnerRadius())
            .outerRadius((d) => y(d.closed))
            .startAngle((d) => x(d.name))
            .endAngle((d) => x(d.name) + x.bandwidth())
            .padAngle(0.03)
            .padRadius(this.getInnerRadius()),
        )
        .attr('transform', 'scale(1)');
    },

    renderAxesAndLabels(svg, data, x, y) {
      const xTimeLabels = Array.from({ length: 24 }, (v, i) => i + 1);

      const timeScale = d3
        .scaleBand()
        .range([0, 2 * Math.PI])
        .align(0)
        .domain(xTimeLabels);

      const xAxis = (g) =>
        g.attr('text-anchor', 'middle').call((g1) =>
          g1
            .selectAll('g')
            .data(xTimeLabels, (d) => d)
            .join('g')
            .attr(
              'transform',
              (d) => `
          rotate(${
            ((timeScale(d) + timeScale.bandwidth() / 2) * 180) / Math.PI - 81
          })
          translate(${this.getInnerRadius()}, 0)
        `,
            )
            .call((g2) =>
              g2.append('line').attr('x2', -5).attr('stroke', '#fff'),
            )
            .call((g3) =>
              g3
                .append('text')
                .attr('font-size', `${this.getFontSize()}px`)
                .attr('fill', '#fefefe')
                .attr('transform', (d) =>
                  (timeScale(d) + timeScale.bandwidth() / 2 + Math.PI / 2) %
                    (2 * Math.PI) <
                  Math.PI
                    ? 'rotate(90) translate(0, 16)'
                    : 'rotate(-90) translate(0, -9)',
                )
                .text((d) => d),
            ),
        );

      const yAxis = (g) =>
        g
          .attr('text-anchor', 'middle')
          .call((g1) =>
            g1
              .append('text')
              .attr('font-size', `${this.getFontSize()}px`)
              .attr('fill', '#fff')
              .attr('y', -y(y.ticks(3).pop()))
              .attr('dy', '-8')
              .text('Call Volumes'),
          )
          .call((g2) =>
            g2
              .selectAll('g')
              .data(y.ticks(4).slice(1))
              .join('g')
              .attr('fill', 'none')
              .call((g3) =>
                g3
                  .append('circle')
                  .attr('stroke', '#5d717f')
                  .style('stroke-dasharray', '6, 6')
                  .attr('stroke-width', 3)
                  .attr('stroke-opacity', 0.8)
                  .attr('r', y),
              )
              .call((g4) =>
                g4
                  .append('text')
                  .attr('y', (d) => -y(d))
                  .attr('dy', '0.35em')
                  .attr('stroke', '#fff')
                  .attr('stroke-width', 2)
                  .text(y.tickFormat(4, 's'))
                  .attr('font-size', `${this.getFontSize()}px`)
                  .clone(true)
                  .attr('fill', '#000')
                  .attr('stroke', 'none'),
              ),
          );
      svg.append('g').call(xAxis);
      svg.append('g').call(yAxis);
    },

    renderCaseInfo(textbox, info) {
      // remove existing tspan
      textbox.selectAll('tspan').remove();

      const textContainer = textbox
        .selectAll('tspan')
        .data([info], (d) => d.name)
        .enter();

      textContainer
        .append('tspan')
        .text('Cases')
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('x', 0)
        .attr('y', `${-2.5 * this.getFontSize()}px`);

      textContainer
        .append('tspan')
        .text('Open')
        .attr('x', 0)
        .attr('y', `${-1 * this.getFontSize()}px`);

      textContainer
        .append('tspan')
        .text((d) => d.open)
        .attr('x', 0)
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('y', `${0}px`);

      textContainer
        .append('tspan')
        .text('Closed')
        .attr('x', 0)
        .attr('y', `${1.5 * this.getFontSize()}px`);

      textContainer
        .append('tspan')
        .text((d) => d.closed)
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('x', 0)
        .attr('y', `${2.5 * this.getFontSize()}px`);
    },

    renderOpenCaseLabels(svg, data, x, y) {
      svg
        .append('g')
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('text-anchor', function (d) {
          return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
            Math.PI
            ? 'end'
            : 'start';
        })
        .attr('transform', function (d) {
          return `rotate(${
            ((x(d.name) + x.bandwidth() / 2) * 180) / Math.PI - 90
          })translate(${y(d.closed) - 50},0)`;
        })
        .append('text')
        .text(function (d) {
          return d.closed;
        })
        .attr('transform', function (d) {
          return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
            Math.PI
            ? 'rotate(180)'
            : 'rotate(0)';
        })
        .style('font-size', `${this.getFontSize()}px`)
        .style('fill', 'white')
        .attr('alignment-baseline', 'middle');
    },

    destroyChart() {
      d3.select(`#${this.chartId} svg`).remove();
    },
  },
};
</script>

<style scoped lang="postcss"></style>