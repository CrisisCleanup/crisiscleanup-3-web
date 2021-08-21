<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';

export type CallVolumeDataT = {|
  id: number,
  total: number,
  missed: number,
  open: number,
|};

export default {
  name: 'CircularBarplot',
  props: {
    /**
     * Data for Donut chart
     */
    chartData: VueTypes.arrayOf(
      VueTypes.shape<CallVolumeDataT>({
        total: VueTypes.number,
        missed: VueTypes.number,
        open: VueTypes.number,
      }),
    ).def((): CallVolumeDataT => []),

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
      svg: null,
      x: null,
      y: null,
      timeScale: null,
      colorScale: null,
      textContainer: null,
      xTimeLabels: null,
      // helper mapping functions
      mappedIds: null,
      mappedTotalCalls: null,
      mappedMissedCalls: null,
      mappedOpenCases: null,
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
        this.renderChart();
      });
    } else {
      console.log('No data found');
    }

    window.addEventListener(
      'resize',
      _.debounce(() => {
        if (!_.isEmpty(this.chartData)) {
          this.destroyChart();
          this.renderChart();
        }
      }, 1500),
    );
  },

  watch: {
    chartData: {
      handler() {
        if (!_.isEmpty(this.chartData)) {
          this.destroyChart();
          this.renderChart();
        } else {
          console.log('No data found');
        }
      },
    },

    isStacked: {
      handler() {
        this.destroyChart();
        this.renderChart();
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

    renderInnerCircle() {
      this.svg
        .append('g')
        .append('circle')
        .attr('r', this.getInnerRadius())
        .attr('fill', '#13141Eaa');
    },

    renderChart() {
      this.mappedIds = (d) => d.id;
      this.mappedTotalCalls = (d) => d.total;
      this.mappedMissedCalls = (d) => d.missed;
      this.mappedOpenCases = (d) => d.open;

      // append the svg object
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

      // Add inner circle
      this.renderInnerCircle();

      // add x and y scales
      this.x = d3
        .scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing
        .domain(this.chartData.map((d) => d.name)); // The domain of the X axis is the list of states.

      this.y = d3
        .scaleRadial()
        .range([this.getInnerRadius(), this.getOuterRadius()]) // Domain will be define later.
        .domain([
          0,
          this.isStacked
            ? d3.max(this.chartData, (d) => d.open) +
              d3.max(this.chartData, (d) => d.closed)
            : Math.max(
                d3.max(this.chartData, (d) => d.closed),
                d3.max(this.chartData, (d) => d.open),
              ),
        ]); // set domain based on chart type (stacked | unstacked)

      this.xTimeLabels = Array.from({ length: 24 }, (v, i) => i + 1);

      this.timeScale = d3
        .scaleBand()
        .range([0, 2 * Math.PI])
        .align(0)
        .domain(this.xTimeLabels);

      this.textContainer = this.svg
        .append('g')
        .attr('class', 'text-label')
        .attr('transform', `translate(0, ${this.getInnerRadius() * 0.1})`)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('fill', '#fefefe');

      this.renderOverallInfo();
      this.renderOpenCases();
      this.renderClosedCases();
      this.renderAxesAndLabels();
    },

    renderOverallInfo() {
      this.renderCaseInfo({
        name: 'Overall Info',
        timestamp: new Date(),
        closed: d3.sum(this.chartData.map((d) => d.closed)),
        open: d3.sum(this.chartData.map((d) => d.open)),
      });
    },

    renderOpenCases() {
      const vm = this;
      this.svg
        .append('g')
        .selectAll('path')
        .data(this.chartData, (d) => d.name)
        .join('path')
        .attr('fill', '#728091')
        .attr('transform', 'scale(1.4)')
        .classed('open-case-path', true)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.y(0))
            .outerRadius((d) => this.y(d.closed))
            .startAngle((d) => this.x(d.name))
            .endAngle(this.x(0) + this.x.bandwidth())
            .padAngle(0.015)
            .padRadius((d) => this.y(d.closed)),
        )
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('filter', 'brightness(70%)')
            .style('transform', 'scale(1.015)')
            .style('opacity', '1')
            .style('transition', 'all 200ms');
          vm.renderCaseInfo(d);
        })
        .on('mouseout', function (event, d) {
          d3.select(this)
            .style('filter', 'brightness(100%)')
            .style('transform', 'scale(1)')
            .style('transition', 'all 200ms');

          vm.renderOverallInfo(d);
        })
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          this.isStacked
            ? d3
                .arc()
                .innerRadius((d) => this.y(d.closed))
                .outerRadius((d) => this.y(d.closed + d.open))
                .startAngle((d) => this.x(d.name))
                .endAngle((d) => this.x(d.name) + this.x.bandwidth())
                .padAngle(0.015)
                .padRadius((d) => this.y(d.closed))
            : d3
                .arc()
                .innerRadius(this.getInnerRadius())
                .outerRadius((d) => this.y(d.open))
                .startAngle((d) => this.x(d.name))
                .endAngle((d) => this.x(d.name) + this.x.bandwidth())
                .padAngle(0.003)
                .padRadius(this.getInnerRadius()),
        )
        .attr('transform', 'scale(1)');
    },

    renderClosedCases() {
      const vm = this;

      this.svg
        .append('g')
        .selectAll('path')
        .data(this.chartData, (d) => d.name)
        .join('path')
        .attr('fill', '#61D5F8')
        .attr('class', 'closed-case-path')
        .attr('transform', 'scale(1.2)')
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.y(0))
            .outerRadius(this.y(0))
            .startAngle((d) => this.x(d.name))
            .endAngle(this.x(0) + this.x.bandwidth())
            .padAngle(0.03)
            .padRadius(this.getInnerRadius()),
        )
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('filter', 'brightness(70%)')
            .style('transform', 'scale(1.015)')
            .style('opacity', '1')
            .style('transition', 'all 200ms');

          vm.renderCaseInfo(d);
        })
        .on('mouseout', function () {
          d3.select(this)
            .style('filter', 'brightness(100%)')
            .style('transform', 'scale(1)')
            .style('transition', 'all 200ms');

          vm.renderOverallInfo();
        })
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.getInnerRadius())
            .outerRadius((d) => this.y(d.closed))
            .startAngle((d) => this.x(d.name))
            .endAngle((d) => this.x(d.name) + this.x.bandwidth())
            .padAngle(0.03)
            .padRadius(this.getInnerRadius()),
        )
        .attr('transform', 'scale(1)');
    },

    renderAxesAndLabels() {
      const xAxis = (g) =>
        g.attr('text-anchor', 'middle').call((g1) =>
          g1
            .selectAll('g')
            .data(this.xTimeLabels, (d) => d)
            .join('g')
            .attr(
              'transform',
              (d) => `
          rotate(${
            ((this.timeScale(d) + this.timeScale.bandwidth() / 2) * 180) /
              Math.PI -
            81
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
                  (this.timeScale(d) +
                    this.timeScale.bandwidth() / 2 +
                    Math.PI / 2) %
                    (2 * Math.PI) <
                  Math.PI
                    ? 'rotate(90) translate(0, 16)'
                    : 'rotate(-90) translate(0, -9)',
                )
                .text((d) => this.$t(`${d}`)),
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
              .attr('y', -this.y(this.y.ticks(3).pop()))
              .attr('dy', '-8')
              .text(this.$t('reports.pp_call_volume_call_volume')),
          )
          .call((g2) =>
            g2
              .selectAll('g')
              .data(this.y.ticks(4).slice(1))
              .join('g')
              .attr('fill', 'none')
              .call((g3) =>
                g3
                  .append('circle')
                  .attr('stroke', '#5d717f')
                  .style('stroke-dasharray', '6, 6')
                  .attr('stroke-width', 3)
                  .attr('stroke-opacity', 0.8)
                  .attr('r', this.y),
              )
              .call((g4) =>
                g4
                  .append('text')
                  .attr('y', (d) => -this.y(d))
                  .attr('dy', '0.35em')
                  .attr('stroke', '#fff')
                  .attr('stroke-width', 2)
                  .text(this.y.tickFormat(4, 's'))
                  .attr('font-size', `${this.getFontSize()}px`)
                  .clone(true)
                  .attr('fill', '#000')
                  .attr('stroke', 'none'),
              ),
          );
      this.svg.append('g').call(xAxis);
      this.svg.append('g').call(yAxis);
    },

    renderCaseInfo(info) {
      // remove existing tspan
      this.textContainer.selectAll('tspan').remove();

      const innerTextContainer = this.textContainer
        .selectAll('tspan')
        .data([info], (d) => d.name)
        .enter();

      innerTextContainer
        .append('tspan')
        .text(this.$t('reports.pp_call_volume_cases'))
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('x', 0)
        .attr('y', `${-2.5 * this.getFontSize()}px`);

      innerTextContainer
        .append('tspan')
        .text(this.$t('reports.pp_call_volume_open'))
        .attr('x', 0)
        .attr('y', `${-1 * this.getFontSize()}px`);

      innerTextContainer
        .append('tspan')
        .text((d) => this.$t(`${d.open}`))
        .attr('x', 0)
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('y', `${0}px`);

      innerTextContainer
        .append('tspan')
        .text(this.$t('reports.pp_call_volume_closed'))
        .attr('x', 0)
        .attr('y', `${1.5 * this.getFontSize()}px`);

      innerTextContainer
        .append('tspan')
        .text((d) => this.$t(`${d.closed}`))
        .attr('font-size', `${this.getFontSize()}px`)
        .attr('x', 0)
        .attr('y', `${2.5 * this.getFontSize()}px`);
    },

    renderOpenCaseLabels() {
      this.svg
        .append('g')
        .selectAll('g')
        .data(this.chartData)
        .join('g')
        .attr('text-anchor', function (d) {
          return (this.x(d.name) + this.x.bandwidth() / 2 + Math.PI) %
            (2 * Math.PI) <
            Math.PI
            ? 'end'
            : 'start';
        })
        .attr('transform', function (d) {
          return `rotate(${
            ((this.x(d.name) + this.x.bandwidth() / 2) * 180) / Math.PI - 90
          })translate(${this.y(d.closed) - 50},0)`;
        })
        .append('text')
        .text((d) => this.$t(`${d.closed}`))
        .attr('transform', function (d) {
          return (this.x(d.name) + this.x.bandwidth() / 2 + Math.PI) %
            (2 * Math.PI) <
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
