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
    bgColor: VueTypes.string.def('#232323'),
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
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) * 0.065;
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
          this.scale(d) < this.scale(this.chartData)
            ? 'url(#active-spike-grad)'
            : 'url(#inactive-spike-grad)',
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

      // inner semicircle for shadow glow effect
      this.svg
        .append('path')
        .classed('shadow-semicircle', true)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(0)
            .outerRadius(radius * 0.71)
            .startAngle(this.scale(0))
            .endAngle(this.scale(101)),
        )
        .attr('fill', '#13141E')
        .attr('filter', 'url(#shadow-glow)');

      // inner arc to display filled gray semicircle
      this.svg
        .append('path')
        .classed('filled-semicircle', true)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(0)
            .outerRadius(radius * 0.68)
            .startAngle(this.scale(0))
            .endAngle(this.scale(this.chartData)),
        )
        .attr('fill', '#242C36');

      // circle for attaching arrow
      this.svg
        .append('circle')
        .attr('r', radius * 0.1)
        .attr('fill', '#fefefe');

      // set initial arrow arc at 0
      const arrowArc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius * 1.1)
        .startAngle(this.scale(0))
        .endAngle(this.scale(1));

      // gauge arrow
      const arrow = this.svg
        .selectAll('path.arrow')
        .data([this.chartData])
        .join('path')
        .attr('class', 'arrow')
        .attr('fill', '#fff');

      arrow.append('title').text(`${this.chartData}%`);

      // transition arrow to endAngle
      arrow
        .transition()
        .duration(2000)
        .attrTween('d', (d) => {
          const interpolateStart = d3.interpolate(this.scale(0), this.scale(d));
          const interpolateEnd = d3.interpolate(
            this.scale(1),
            this.scale(d + 1),
          );
          return (t) => {
            arrowArc.startAngle(interpolateStart(t));
            arrowArc.endAngle(interpolateEnd(t));
            return arrowArc();
          };
        });

      // label group
      const labelGroup = this.svg.append('g').attr('fill', '#fefefe');
      const labelHeightOffset = this.getInnerHeight() * 0.1;

      // left label
      labelGroup
        .append('text')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('font-size', this.getFontSize())
        .attr('font-weight', 'bold')
        .attr(
          'transform',
          `translate(${
            -(radius * 1.1 + radius * 0.7) / 2
          }, ${labelHeightOffset})`,
        )
        .text('Slow');

      // right label
      labelGroup
        .append('text')
        .attr('dominant-baseline', 'middle')
        .attr('text-anchor', 'middle')
        .attr('font-size', this.getFontSize())
        .attr('font-weight', 'bold')
        .attr(
          'transform',
          `translate(${
            (radius * 1.1 + radius * 0.7) / 2
          }, ${labelHeightOffset})`,
        )
        .text('Strong');
    },

    addDefs() {
      // defs container
      const defs = this.svg.append('defs');

      // radical gradient for the active (filled up) spikes
      const activeRadialGrad = defs
        .append('radialGradient')
        .attr('id', 'active-spike-grad');
      activeRadialGrad
        .append('stop')
        .attr('offset', '10%')
        .attr('stop-color', '#61D5F8');
      activeRadialGrad
        .append('stop')
        .attr('offset', '95%')
        .attr('stop-color', '#61D5F8AA');

      // radical gradient for the inactive spikes
      const inactiveRadialGrad = defs
        .append('radialGradient')
        .attr('id', 'inactive-spike-grad');
      inactiveRadialGrad
        .append('stop')
        .attr('offset', '10%')
        .attr('stop-color', '#728090');
      inactiveRadialGrad
        .append('stop')
        .attr('offset', '95%')
        .attr('stop-color', '#728090AA');

      // glow filters
      const shadowFilter = defs
        .append('filter')
        .attr('id', 'shadow-glow')
        .attr('x', '-500%')
        .attr('y', '-500%')
        .attr('width', '1000%')
        .attr('height', '1000%');
      const glowFilter = defs.append('filter').attr('id', 'spike-glow');
      const noGlowFilter = defs.append('filter').attr('id', 'spike-noglow');

      shadowFilter
        .append('feFlood')
        .attr('result', 'flood')
        .attr('flood-color', '#000')
        .attr('flood-opacity', '1');
      shadowFilter
        .append('feComposite')
        .attr('in', 'flood')
        .attr('result', 'mask')
        .attr('in2', 'SourceGraphic')
        .attr('operator', 'in');
      shadowFilter
        .append('feMorphology')
        .attr('in', 'mask')
        .attr('result', 'dilated')
        .attr('operator', 'dilate')
        .attr('radius', 2);
      shadowFilter
        .append('feGaussianBlur')
        .attr('stdDeviation', '15')
        .attr('in', 'dilated')
        .attr('result', 'blurred');

      glowFilter
        .append('feGaussianBlur')
        .attr('stdDeviation', '4')
        .attr('result', 'coloredBlur');

      noGlowFilter
        .append('feGaussianBlur')
        .attr('stdDeviation', '0')
        .attr('result', 'coloredBlur');

      const shadowFeMerge = shadowFilter.append('feMerge');
      shadowFeMerge.append('feMergeNode').attr('in', 'blurred');
      shadowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      const glowFeMerge = glowFilter.append('feMerge');
      glowFeMerge.append('feMergeNode').attr('in', 'coloredBlur');
      glowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

      const noGlowFeMerge = glowFilter.append('feMerge');
      noGlowFeMerge.append('feMergeNode').attr('in', 'coloredBlur');
      noGlowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    },
  },
};
</script>

<style scoped lang="postcss"></style>
