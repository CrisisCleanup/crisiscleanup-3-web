<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';

export default {
  name: 'SiteActivityGauge',
  components: {},
  props: {
    /**
     * Unique chart ID
     */
    chartId: VueTypes.string.def('d3-site-activity-gauge'),
    /**
     * Data for gauge
     */
    chartData: VueTypes.number.def(35),
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
      scale: null,
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
      }, 10000),
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
      this.scale = d3
        .scaleLinear()
        .domain([0, 101])
        .range([-Math.PI / 2, Math.PI / 2])
        .clamp(true); // prevent values from going out of domain

      const radius = this.getInnerRadius();
      const spikesData = Array.from({ length: 21 }, (v, i) => i * 5);
      const arc = d3
        .arc()
        .innerRadius(radius * 0.7)
        .outerRadius(radius * 1.1);

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
          `translate(${this.getWidth() / 2}, ${this.getHeight() / 1.5})`,
        );

      this.addDefs();
      this.svg.append('circle').attr('r', 10).attr('fill', '#fff');

      const spikes = this.svg.selectAll('path').data(spikesData).join('path');
      spikes.append('title').text((d) => `${d}%`);

      // spike transitions
      spikes
        .attr('d', (d) =>
          arc({
            startAngle: this.scale(d),
            endAngle: this.scale(d + 1),
          }),
        )
        .attr('fill', 'transparent')
        .transition()
        .duration(400)
        .delay((d, i) => i * 20)
        .attr('d', (d) =>
          arc({
            startAngle: this.scale(d),
            endAngle: this.scale(d + 1),
          }),
        )
        .attr('fill', (d) =>
          this.scale(d) < this.scale(this.chartData) ? '#61D5F8' : '#728090',
        )
        .transition()
        .delay(function (d, i) {
          return i * 50;
        })
        .on('start', function repeat() {
          d3.select(this)
            .attr('filter', 'url(#spike-noglow)')
            .transition()
            .duration(500)
            .delay(50)
            .attr('filter', 'url(#spike-glow)')
            .transition()
            .duration(500)
            .delay(50)
            .attr('filter', 'url(#spike-noglow)')
            .transition()
            .delay(5000)
            .on('start', repeat);
        });
      const { scale } = this;

      function arcTween(d) {
        let maxAngArc = d.endAngle;
        let minAngArc = d.startAngle;
        d3.select(this)
          .transition()
          .duration(1000)
          .attrTween('d', function (d) {
            const interpolate = d3.interpolate(d.endAngle, d.startAngle);
            return function (t) {
              maxAngArc = interpolate(t);
              return arc(d);
            };
          });
      }

      const arrow = this.svg
        .selectAll('path.arrow')
        .data([this.chartData])
        .join('path')
        .classed('arrow', true)
        .attr('fill', '#fff')
        .attr('d', (d) =>
          d3
            .arc()
            .innerRadius(0)
            .outerRadius(radius * 1.1)({
            startAngle: this.scale(0),
            endAngle: this.scale(0 + 1),
          }),
        )
        .transition()
        .duration(2000)
        .attrTween('d', arcTween)
        .attr('d', (d) =>
          d3
            .arc()
            .innerRadius(0)
            .outerRadius(radius * 1.1)({
            startAngle: this.scale(d),
            endAngle: this.scale(d + 1),
          }),
        );
    },

    addDefs() {
      // defs container
      const defs = this.svg.append('defs');

      // glow filters
      const glowFilter = defs.append('filter').attr('id', 'spike-glow');
      const noGlowFilter = defs.append('filter').attr('id', 'spike-noglow');

      glowFilter
        .append('feGaussianBlur')
        .attr('stdDeviation', '4')
        .attr('result', 'coloredBlur');

      noGlowFilter
        .append('feGaussianBlur')
        .attr('stdDeviation', '0')
        .attr('result', 'coloredBlur');

      const glowFeMerge = glowFilter.append('feMerge');
      glowFeMerge.append('feMergeNode').attr('in', 'coloredBlur');
      glowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      const noGlowFeMerge = glowFilter.append('feMerge');
      noGlowFeMerge.append('feMergeNode').attr('in', 'coloredBlur');
      noGlowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    },

    animateSpikes(spikes) {
      spikes
        .transition()
        .delay(function (d, i) {
          return i * 50;
        })
        .on('start', function repeat() {
          d3.selectAll(this)
            .attr('filter', 'url(#spike-noglow)')
            .transition()
            .duration(500)
            .delay(50)
            .attr('filter', 'url(#spike-glow)')
            .transition()
            .duration(500)
            .delay(5000)
            .on('start', repeat);
        });
    },
  },
};
</script>

<style scoped lang="postcss"></style>
