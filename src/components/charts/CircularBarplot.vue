<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';
import { D3BaseChartMixin } from '@/mixins';

export type CallVolumeDataT = {|
  name: string,
  timestamp: number,
  calls: number,
  missed: number,
|};

export default {
  name: 'CircularBarplot',
  mixins: [D3BaseChartMixin],
  props: {
    /**
     * Data for Donut chart
     */
    chartData: VueTypes.arrayOf(VueTypes.object).def((): CallVolumeDataT =>
      Array.from({ length: 24 * 2 }, (v, i) => ({
        name: `id=${i}`,
        timestamp: new Date(),
        calls: Math.floor(Math.random() * (100 - 50 + 1) + 50),
        missed: Math.floor(Math.random() * (40 - 10 + 1) + 10),
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
  },

  data() {
    return {
      timeScale: null,
      colorScale: null,
      textContainer: null,
      xTimeLabels: null,
      // helper mapping functions
      mappedNames: null,
      mappedTotalCalls: null,
      mappedMissedCalls: null,
      mappedTimestamps: null,
    };
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
  },

  methods: {
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
      this.mappedNames = (d) => d.name;
      this.mappedTimestamps = (d) => d.timestamp;
      this.mappedTotalCalls = (d) => d.calls;
      this.mappedMissedCalls = (d) => d.missed;

      console.log(this.chartData);

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
        .domain(this.chartData.map(this.mappedNames)); // The domain of the X axis is the list of states.

      this.y = d3
        .scaleRadial()
        .range([this.getInnerRadius(), this.getOuterRadius()])
        .domain([0, d3.max(this.chartData, this.mappedTotalCalls)]);

      this.colorScale = d3
        .scaleOrdinal()
        .domain(['missed', 'calls'])
        .range(['#728091', '#61D5F8']);

      this.xTimeLabels = Array.from({ length: 24 }, (v, i) => i + 1);

      this.timeScale = d3
        .scaleBand()
        .range([0, 2 * Math.PI])
        .align(0)
        .domain(this.xTimeLabels);

      this.textContainer = this.svg
        .append('g')
        .attr('class', 'text-label')
        .attr('transform', `translate(0, ${-this.getInnerRadius() / 3})`)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', 0);

      this.renderOverallInfo();
      this.renderTotalCalls();
      this.renderMissedCalls();
      this.renderAxesAndLabels();
    },

    renderOverallInfo() {
      this.renderCaseInfo({
        name: 'Overall Info',
        timestamp: new Date(),
        calls: d3.sum(this.chartData.map(this.mappedTotalCalls)),
        missed: d3.sum(this.chartData.map(this.mappedMissedCalls)),
      });
    },

    renderTotalCalls() {
      const vm = this;
      const totalCallsGroup = this.svg
        .append('g')
        .selectAll('path')
        .data(this.chartData, (d) => d.name)
        .join('path')
        .attr('fill', this.colorScale('calls'))
        .attr('class', 'total-call-path');

      // initial transition
      totalCallsGroup
        .attr('transform', 'scale(1.4)')
        .style('opacity', '0')
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.getInnerRadius())
            .outerRadius((d) => this.y(d.calls))
            .startAngle((d) => this.x(d.name))
            .endAngle((d) => this.x(d.name) + this.x.bandwidth())
            .padAngle(0.025),
        )
        .style('opacity', '1')
        .attr('transform', 'scale(1)');

      totalCallsGroup
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('stroke', '#fff')
            .style('stroke-width', 2)
            .style('transform', 'scale(1.015)')
            .style('opacity', '1')
            .style('transition', 'all 200ms');
          vm.renderCaseInfo(d);
        })
        .on('mouseout', function (event, d) {
          d3.select(this)
            .style('stroke', 'none')
            .style('transform', 'scale(1)')
            .style('transition', 'all 200ms');

          vm.renderOverallInfo(d);
        });
    },

    renderMissedCalls() {
      const vm = this;

      const missedCallsGroup = this.svg
        .append('g')
        .selectAll('path')
        .data(this.chartData, (d) => d.name)
        .join('path')
        .attr('fill', this.colorScale('missed'))
        .attr('class', 'missed-call-path');

      missedCallsGroup
        .attr('transform', 'scale(1.2)')
        .style('opacity', '0')
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.getInnerRadius())
            .outerRadius((d) => this.y(d.missed))
            .startAngle((d) => this.x(d.name))
            .endAngle((d) => this.x(d.name) + this.x.bandwidth())
            .padAngle(0.03),
        )
        .style('opacity', '1')
        .attr('transform', 'scale(1)');

      missedCallsGroup
        .on('mouseover', function (event, d) {
          d3.select(this)
            .style('stroke', '#fff')
            .style('stroke-width', 2)
            .style('transform', 'scale(1.015)')
            .style('transition', 'all 200ms');

          vm.renderCaseInfo(d);
        })
        .on('mouseout', function () {
          d3.select(this)
            .style('stroke', 'none')
            .style('transform', 'scale(1)')
            .style('transition', 'all 200ms');

          vm.renderOverallInfo();
        });
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
        g.attr('text-anchor', 'middle').call((g2) =>
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
                .attr('stroke-width', 4)
                .text(this.y.tickFormat(4, 's'))
                .attr('font-size', `${0.85}em`)
                .clone(true)
                .attr('fill', '#000')
                .attr('stroke', 'none'),
            ),
        );

      this.svg.append('g').call(xAxis);
      this.svg.append('g').call(yAxis);
    },

    renderCaseInfo(info) {
      const innerTextContainer = this.textContainer
        .selectAll('tspan')
        .data([info], (d) => d.name);

      innerTextContainer
        .join('tspan')
        .attr('font-size', this.getInnerRadius() * 0.2)
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .attr('x', 0)
        .attr('dy', `${0}em`)
        .text(this.$t('pewPew.calls'));

      innerTextContainer
        .join('tspan')
        .attr('font-size', this.getInnerRadius() * 0.23)
        .attr('font-weight', 'bold')
        .attr('fill', this.colorScale('calls'))
        .attr('x', 0)
        .attr('dy', `${1.1}em`)
        .transition()
        .duration(400)
        .textTween((d) => d3.interpolateRound(0, this.$t(`${d.calls}`)));

      innerTextContainer
        .join('tspan')
        .attr('font-size', this.getInnerRadius() * 0.2)
        .attr('font-weight', 'bold')
        .attr('fill', '#ffffff')
        .attr('x', 0)
        .attr('dy', `${1.5}em`)
        .text(this.$t('pewPew.missed'));

      innerTextContainer
        .join('tspan')
        .attr('font-size', this.getInnerRadius() * 0.23)
        .attr('font-weight', 'bold')
        .attr('fill', this.colorScale('missed'))
        .attr('x', 0)
        .attr('dy', `${1.1}em`)
        .transition()
        .duration(400)
        .textTween((d) => d3.interpolateRound(0, this.$t(`${d.missed}`)));
    },
  },
};
</script>

<style scoped lang="postcss"></style>
