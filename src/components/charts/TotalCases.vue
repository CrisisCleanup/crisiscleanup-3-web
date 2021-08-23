<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import _ from 'lodash';
import VueTypes from 'vue-types';
import { D3BaseChartMixin } from '@/mixins';

export type TotalCaseDataT = {|
  open: number,
  closed: number,
  inProgress: number,
|};

export default {
  name: 'TotalCases',
  mixins: [D3BaseChartMixin],
  props: {
    chartData: VueTypes.any,
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

  data() {
    return {
      node: null,
      label: null,
      focus: null,
      view: null,
      colorScale: null,
    };
  },

  methods: {
    pack(data) {
      return d3
        .pack()
        .size([this.getInnerWidth(), this.getInnerHeight()])
        .padding(3)(
        d3
          .hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => b.value - a.value),
      );
    },
    renderChart() {
      // normalize incoming data
      const root = this.pack({
        name: 'Total Cases',
        value: d3.sum(_.values(this.chartData)),
        children: [
          ..._.map(_.keys(this.chartData), (key) => ({
            name: key,
            value: this.chartData[key],
          })),
        ],
      });

      // render svg with translated group
      this.svg = d3
        .select(`#${this.chartId}`)
        .append('svg')
        .attr('width', this.getWidth())
        .attr('height', this.getHeight())
        .style('background', this.bgColor)
        .style('-webkit-tap-highlight-color', 'transparent')
        .append('g')
        .attr(
          'transform',
          `translate(${this.getWidth() / 2}, ${this.getHeight() / 2})`,
        )
        .on('click', (event) => this.zoom(event, root));

      this.colorScale = d3
        .scaleOrdinal()
        .domain(_.keys(this.chartData))
        .range(['#e15554', '#3bb273', '#f08700']);

      this.node = this.svg
        .append('g')
        .selectAll('circle')
        .data(root.descendants().slice(1))
        .join('circle')
        .attr('fill', (d) => this.colorScale(d.data.name))
        .style('cursor', 'pointer');

      this.node
        .on('mouseover', function () {
          d3.select(this).attr('stroke', '#fefefe').attr('stroke-width', 3);
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', null);
        })
        .on('click', (event, d) => {
          if (this.focus !== d) {
            this.zoom(event, d);
            event.stopPropagation();
          }
        });

      this.label = this.svg
        .append('g')
        .style('font', '10px sans-serif')
        .style('font-weight', 'bold')
        .attr('fill', '#fefefe')
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .selectAll('text')
        .data(root.descendants())
        .join('text')
        .style('fill-opacity', (d) => (d.parent === root ? 1 : 0))
        .style('display', (d) => (d.parent === root ? 'inline' : 'none'))
        .text((d) => `${_.startCase(d.data.name)} (${d.data.value})`);

      this.zoomTo([root.x, root.y, root.r * 2]);
    },

    zoomTo(v) {
      this.view = v;
      const k = this.getInnerWidth() / v[2];

      this.label.attr(
        'transform',
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      this.node.attr(
        'transform',
        (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
      );
      this.node.attr('r', (d) => d.r * k);
    },

    zoom(event, d) {
      this.focus = d;
      this.svg
        .transition()
        .duration(750)
        .tween('zoom', () => {
          const i = d3.interpolateZoom(this.view, [
            this.focus.x,
            this.focus.y,
            this.focus.r * 2,
          ]);
          return (t) => this.zoomTo(i(t));
        });
    },
  },
};
</script>

<style scoped lang="postcss"></style>
