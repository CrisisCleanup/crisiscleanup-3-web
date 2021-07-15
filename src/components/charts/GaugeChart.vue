<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';

export type GaugeT = {|
  radius: number,
  fillPercent: number,
  gradients?: string[],
|};

export default {
  name: 'GaugeChart',
  components: {},
  props: {
    gauges: VueTypes.arrayOf<GaugeT[]>(
      VueTypes.shape<GaugeT>({
        radius: VueTypes.number.isRequired,
        fillPercent: VueTypes.number.isRequired,
        gradients: VueTypes.arrayOf(String).isRequired,
      }),
    ).def(() => [
      {
        radius: 100,
        fillPercent: 50,
        gradients: [
          'rgba(238, 40, 218, 1)',
          'rgba(97, 213, 248, 1)',
          'rgba(97, 213, 248, 1)',
          'rgba(97, 247, 150, 0.984165)',
        ],
      },
      {
        radius: 170,
        fillPercent: 70,
        gradients: [
          'rgba(238, 40, 218, 1)',
          'rgba(97, 213, 248, 1)',
          'rgba(97, 213, 248, 1)',
          'rgba(97, 247, 150, 0.984165)',
        ],
      },
      {
        radius: 250,
        fillPercent: 0,
        gradients: [
          'rgba(238, 40, 218, 1)',
          'rgba(97, 213, 248, 1)',
          'rgba(97, 213, 248, 1)',
          'rgba(97, 247, 150, 0.984165)',
        ],
      },
    ]),
    /**
     * top, bottom, left, right margins
     */
    margin: {
      type: Number,
      required: false,
      default: 0,
    },
    /**
     * Percent Value to move knob around the arc
     */
    fillPercent: {
      type: [String, Number],
      required: true,
      default: 0,
    },
  },

  data() {
    return {
      chartId: 'velocity-gauge-chart',
      svg: null,
      scale: null,
      radius: null,
    };
  },

  watch: {
    fillPercent: {
      handler(data) {
        this.renderKnob(this.radius, this.scale(+data));
      },
    },
  },

  mounted() {
    this.renderChart();
    console.log(this.gauges);
  },

  computed: {
    width() {
      const w = +d3.select(`#${this.chartId}`).style('width').slice(0, -2);
      console.log(w);
      return w - this.margin * 2;
    },
    height() {
      const h = +d3.select(`#${this.chartId}`).style('height').slice(0, -2);
      console.log(h);
      return h - this.margin * 2;
    },
    innerRadius() {
      return Math.abs(Math.min(this.width, this.height) / 6);
    },
    outerRadius() {
      return Math.abs(Math.min(this.width, this.height) / 2);
    },
    labelFontSize() {
      return (this.width + this.height) * 0.012;
    },
  },

  methods: {
    destroyChart() {
      d3.select(`#${this.chartId} svg`).remove();
    },

    renderChart() {
      this.svg = d3
        .select(`#${this.chartId}`)
        .append('svg')
        .attr('width', this.width + this.margin * 2)
        .attr('height', this.height + this.margin * 2)
        .style(
          'background',
          'linear-gradient(rgb(44, 55, 65, 0.85) 0%, rgba(44, 55, 65, 0.95) 100%)',
        )
        .append('g')
        .attr(
          'transform',
          `translate(${this.width / 2 + this.margin}, ${
            this.height / 2 + this.margin
          })`,
        );

      this.addDefs();

      this.scale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([-Math.PI / 2, Math.PI / 2])
        .clamp(true); // prevent values from going out of domain

      this.radius = 200;

      this.gauges.forEach((gauge: GaugeT, index: number) => {
        console.log(gauge);
        this.svg
          .append('path')
          .attr('d', this.getInnerSemiCircle(gauge.radius))
          .attr('fill', `url(#gauge-gradient-${index})`);

        this.renderKnob(gauge.radius, this.scale(+gauge.fillPercent));
      });
    },

    getInnerSemiCircle(radius: number) {
      return d3
        .arc()
        .outerRadius(radius)
        .innerRadius(radius - 30)
        .cornerRadius(radius * 0.2)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);
    },

    renderKnob(radius: number, angle: number) {
      d3.selectAll('path.gauge-knob').remove();

      this.gauges.forEach((gauge: GaugeT) => {
        this.svg
          .append('path')
          .classed('gauge-knob', true)
          .attr(
            'd',
            d3
              .arc()
              .outerRadius(gauge.radius + gauge.radius * 0.22)
              .innerRadius(gauge.radius - gauge.radius * 0.022)
              .cornerRadius(9999)
              .startAngle(angle - 110 / 1000)
              .endAngle(angle + 110 / 1000),
          )
          .attr('fill', '#fff');
      });
    },

    addDefs() {
      const defs = this.svg.append('defs');

      this.gauges.forEach((gauge: GaugeT, index: number) => {
        const linGradient = defs
          .append('linearGradient')
          .attr('id', `gauge-gradient-${index}`)
          .attr('gradient-transform', 'rotate(90)');

        linGradient
          .append('stop')
          .attr('offset', '0%')
          .attr('stop-color', gauge.gradients[0]);

        linGradient
          .append('stop')
          .attr('offset', '40%')
          .attr('stop-color', gauge.gradients[1]);

        linGradient
          .append('stop')
          .attr('offset', '60%')
          .attr('stop-color', gauge.gradients[2]);

        linGradient
          .append('stop')
          .attr('offset', '100%')
          .attr('stop-color', gauge.gradients[3]);
      });
    },
  },
};
</script>

<style scoped lang="postcss"></style>
