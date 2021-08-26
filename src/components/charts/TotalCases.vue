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
  [key: string]: number,
|};

export default {
  name: 'TotalCases',
  mixins: [D3BaseChartMixin],
  props: {
    chartData: VueTypes.arrayOf(VueTypes.object),
  },

  watch: {
    chartData: {
      handler(newData, oldData) {
        if (!_.isEqual(newData, oldData)) {
          this.destroyChart();
          this.renderChart();
        }
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
        .padding(8)(
        d3
          .hierarchy(data)
          .sum((d) => d.value)
          .sort((a, b) => b.value - a.value),
      );
    },
    loadTooltip() {
      d3.selectAll('#total-cases-chart-tooltip').remove();
      d3.selectAll('#bar-chart-tooltip').remove();
      d3.select('body')
        .append('div')
        .attr('id', 'total-cases-chart-tooltip')
        .attr('class', 'text-xs px-2 py bg-white rounded-md font-bold')
        .attr('style', 'position: absolute; opacity: 0;')
        .on('mouseover', function () {
          // remove ghosted tooltip on mouseover
          d3.select(this).style('opacity', 0);
        });
    },
    renderChart() {
      const { $t } = this;
      // normalize incoming data
      const root = this.pack({
        name: 'Total',
        value: _.sumBy(this.chartData, (d) => d.count),
        color: '#ffffff22',
        children: _.map(this.chartData, (d) => ({
          name: d.name,
          value: d.count,
          color: d.color,
        })),
      });

      console.log(root);

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

      this.loadTooltip();

      this.colorScale = d3
        .scaleOrdinal()
        .domain([..._.map(this.chartData, (d) => d.name), 'Total'])
        .range([..._.map(this.chartData, (d) => d.color), '#ffffff22']);

      this.node = this.svg
        .append('g')
        .selectAll('circle')
        .data(root.descendants())
        .join('circle')
        .attr('fill', (d) => this.colorScale(d.data.name))
        .style('cursor', 'pointer');

      this.node
        .on('mouseover mousemove', function (event, d) {
          d3.select(this).attr('stroke', '#fefefe').attr('stroke-width', 3);
          d3.select('#total-cases-chart-tooltip')
            .transition()
            .duration(20)
            .style('opacity', 1)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY + 10}px`)
            .text($t(`~~${_.startCase(d.data.name)}: ${d.data.value}`));
        })
        .on('mouseout', function () {
          d3.select(this).attr('stroke', null);
          d3.select('#bar-chart-tooltip').style('opacity', 0);
        })
        .on('click', (event, d) => {
          if (this.focus !== d) {
            console.log(d);
            this.zoom(event, d);
            event.stopPropagation();
          }
        });

      this.label = this.svg
        .append('g')
        .style('font', '10px sans-serif')
        .style('font-weight', 'bold')
        .attr('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .selectAll('text')
        .data(root.descendants())
        .join('text')
        .attr('fill', '#fefefe')
        .style('stroke', 5)
        .style('mix-blend-mode', 'difference')
        .style('fill-opacity', (d) => (d.parent === root ? 1 : 0))
        .style('font-size', (d) => d.r / 5)
        .style('display', (d) => (d.parent === root ? 'inline' : 'none'))
        .text((d) => `${_.startCase(d.data.name)} (${d.data.value})`);

      this.zoomTo([root.x, root.y, root.r * 2.0]);
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
            this.focus.r * 2.0,
          ]);
          return (t) => this.zoomTo(i(t));
        });
    },
  },
};
</script>

<style scoped lang="postcss"></style>
