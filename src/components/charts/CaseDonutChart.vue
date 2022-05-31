<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import _ from 'lodash';
import { D3BaseChartMixin } from '@/mixins';
import { nFormatter } from '@/utils/helpers';

export default {
  name: 'CaseDonutChart',
  mixins: [D3BaseChartMixin],
  props: {
    /**
     * Data for Donut chart
     */
    chartData: VueTypes.shape({
      reportedCases: VueTypes.number,
      completedCases: VueTypes.number,
      claimedCases: VueTypes.number,
    }).def(() => ({
      reportedCases: 10,
      completedCases: 20,
      claimedCases: 10,
    })),
  },

  data() {
    return {
      colorScale: null,
    };
  },

  watch: {
    chartData: {
      handler(newData, oldData) {
        if (!_.isEqual(newData, oldData)) {
          this.doRerender();
        }
      },
    },
  },

  methods: {
    getInnerRadius() {
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) / 2;
    },

    getFontSize() {
      return Math.min(this.getInnerWidth(), this.getInnerHeight()) * 0.25;
    },

    renderChart() {
      // set the color scale
      this.colorScale = d3
        .scaleOrdinal()
        .domain(['reportedCases', 'completedCases', 'claimedCases'])
        .range(['#ffffff', '#61F8B0', '#F79820']);

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
          `translate(${this.getWidth() / 2}, ${this.getHeight() / 2})`,
        );

      this.addGlowDefs();

      // Compute the position of each group on the pie:
      const pie = d3
        .pie()
        .sort(null)
        .value((d) => d[1]);

      const data_ready = pie(_.entries(this.chartData));
      const totalCases = d3.sum(d3.map(data_ready, (d) => d.data[1]));

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      const chart = this.svg
        .selectAll('whatever')
        .data(data_ready)
        .join('path');

      chart
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(this.getInnerRadius() * 0.67) // size of the donut hole
            .outerRadius(this.getInnerRadius()),
        )
        .attr('fill', (d) => this.colorScale(d.data[0]))
        .attr('filter', 'url(#glow)')
        .on('mouseover', function () {
          d3.select(this).attr('stroke', 'white');
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', 'transparent');
        });

      chart.append('title').text(
        // d.data[0] represents labels i.e. Reported Cases, Closed Cases, etc
        // d.data[1] represents total number of Reported/Closed cases
        (d) => `${this.$t(_.startCase(d.data[0]))}: ${this.$t(d.data[1])}`,
      );

      this.svg
        .append('text')
        .attr('fill', '#fff')
        .attr('dominant-baseline', 'central')
        .attr('text-anchor', 'middle')
        .attr('font-size', this.getFontSize())
        .text(nFormatter(totalCases)) // calculate sum of all values
        .append('title')
        .text(totalCases);
    },

    addGlowDefs() {
      // gradient container
      const defs = this.svg.append('defs');

      // outside glow filter
      const filter = defs.append('filter').attr('id', 'glow');
      filter
        .append('feGaussianBlur')
        .attr('stdDeviation', '1.5')
        .attr('result', 'coloredBlur');

      const feMerge = filter.append('feMerge');
      feMerge.append('feMergeNode').attr('in', 'coloredBlur');
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic');
    },
  },
};
</script>

<style scoped lang="postcss"></style>
