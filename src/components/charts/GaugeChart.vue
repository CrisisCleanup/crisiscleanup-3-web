<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';

export type GaugeT = {|
  radius: number,
  fillPercent: number,
  gradients?: string[],
  leftLabel: string,
  rightLabel: string,
|};

export default {
  name: 'GaugeChart',
  components: {},
  props: {
    gauges: VueTypes.arrayOf(
      VueTypes.shape<GaugeT>({
        radius: VueTypes.number.isRequired,
        fillPercent: VueTypes.oneOfType([VueTypes.number, VueTypes.string])
          .isRequired,
        gradients: VueTypes.arrayOf(VueTypes.string),
        leftLabel: VueTypes.string,
        rightLabel: VueTypes.string,
      }).isRequired,
    ).def(() => [
      {
        radius: 100,
        fillPercent: 50,
        leftLabel: 'Low 1',
        rightLabel: 'High 1',
      },
      {
        radius: 170,
        fillPercent: 70,
        leftLabel: 'Low 2',
        rightLabel: 'High 2',
      },
      {
        radius: 250,
        fillPercent: 0,
        leftLabel: 'Low 3',
        rightLabel: 'High 3',
      },
    ]),
    /**
     * Unique chart ID
     */
    chartId: VueTypes.string.def('d3-velocity-gauge-chart'),
    /**
     * top, bottom, left, right margins
     */
    margin: VueTypes.number.def(5),
    /**
     * background color / gradient
     */
    bgColor: VueTypes.string.def('#232323'),
  },

  data() {
    return {
      svg: null,
      scale: null,
    };
  },

  watch: {
    gauges: {
      deep: true,
      handler(data: GaugeT[]) {
        this.redrawKnob(data);
      },
    },
  },

  mounted() {
    this.$nextTick(() => {
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
        .style('background', this.bgColor)
        .append('g')
        .attr(
          'transform',
          `translate(${this.width / 2 + this.margin}, ${
            this.height / 1.5 + this.margin
          })`,
        );

      this.addDefs();

      this.scale = d3
        .scaleLinear()
        .domain([0, 100])
        .range([-Math.PI / 2, Math.PI / 2])
        .clamp(true); // prevent values from going out of domain

      this.gauges.forEach((gauge: GaugeT, index: number) => {
        console.log(JSON.stringify(gauge));
        console.log(this.scale.ticks(1));
        this.svg
          .append('path')
          .attr('transform', 'scale(0)')
          .attr(
            'd',
            d3
              .arc()
              .outerRadius(0)
              .innerRadius(0)
              .startAngle(-Math.PI / 2)
              .endAngle(-Math.PI / 2),
          )
          .transition()
          .duration(500)
          .delay(gauge.radius * 2)
          .attr('d', this.getInnerSemiCircle(gauge.radius))
          .attr('transform', 'scale(1)')
          .attr('fill', `url(#gauge-gradient-${index})`);
      });

      this.redrawKnob(this.gauges);
    },

    getInnerSemiCircle(radius: number) {
      return d3
        .arc()
        .outerRadius(radius)
        .innerRadius(radius - 10)
        .cornerRadius(radius * 0.2)
        .startAngle(-Math.PI / 2)
        .endAngle(Math.PI / 2);
    },

    redrawKnob(data: GaugeT[]) {
      const knobs = this.svg
        .selectAll('path.gauge-knob')
        .data(data)
        .join('path')
        .classed(`gauge-knob`, true)
        .attr('fill', '#fff')
        .transition()
        .duration(1000)
        .delay((d: GaugeT) => d.radius * 5)
        .attr('d', (d: GaugeT) =>
          d3
            .arc()
            .outerRadius(d.radius + 4)
            .innerRadius(d.radius - 14)
            .cornerRadius(999)({
            startAngle: this.scale(+d.fillPercent),
            endAngle: this.scale(+d.fillPercent + 10),
          }),
        );

      this.animateKnobs(knobs);
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
          .attr(
            'stop-color',
            (gauge.gradients && gauge.gradients[0]) || 'rgba(238, 40, 218, 1)',
          );

        linGradient
          .append('stop')
          .attr('offset', '40%')
          .attr(
            'stop-color',
            (gauge.gradients && gauge.gradients[1]) || 'rgba(97, 213, 248, 1)',
          );

        linGradient
          .append('stop')
          .attr('offset', '60%')
          .attr(
            'stop-color',
            (gauge.gradients && gauge.gradients[2]) || 'rgba(97, 213, 248, 1)',
          );

        linGradient
          .append('stop')
          .attr('offset', '100%')
          .attr(
            'stop-color',
            (gauge.gradients && gauge.gradients[3]) ||
              'rgba(97, 247, 150, 0.984165)',
          );
      });
    },

    animateKnobs(knobs) {
      const { scale } = this;
      knobs
        .transition()
        .delay(function (d, i) {
          return i * 500;
        })
        .on('start', function repeat() {
          d3.active(this)
            .attr('d', (d: GaugeT) =>
              d3
                .arc()
                .outerRadius(d.radius + 4)
                .innerRadius(d.radius - 14)
                .cornerRadius(999)({
                startAngle: scale(+d.fillPercent + 1),
                endAngle: scale(+d.fillPercent + 10 + 1),
              }),
            )
            .transition()
            .duration(1000)
            .delay(Math.random() * 5000)
            .attr('d', (d: GaugeT) =>
              d3
                .arc()
                .outerRadius(d.radius + 4)
                .innerRadius(d.radius - 14)
                .cornerRadius(999)({
                startAngle: scale(+d.fillPercent - 2),
                endAngle: scale(+d.fillPercent + 10 - 2),
              }),
            )
            .transition()
            .duration(1000)
            .delay(Math.random() * 5000)
            .attr('d', (d: GaugeT) =>
              d3
                .arc()
                .outerRadius(d.radius + 4)
                .innerRadius(d.radius - 14)
                .cornerRadius(999)({
                startAngle: scale(+d.fillPercent + 3),
                endAngle: scale(+d.fillPercent + 10 + 3),
              }),
            )
            .transition()
            .duration(1000)
            .delay(Math.random() * 5000)
            .on('start', repeat);
        });
    },
  },
};
</script>

<style scoped lang="postcss"></style>
