<template>
  <div :id="chartId" v-bind="$attrs"></div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';
import { D3BaseChartMixin } from '@/mixins';

export type WeeksToCompletionDataT = {|
  date: Date,
  velocity: number,
|};

export default {
  name: 'WeeksToCompletion',
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
      line: null,
    };
  },

  methods: {
    callout(g, value) {
      if (!value) return g.style('display', 'none');

      g.style('display', null)
        .style('pointer-events', 'none')
        .style('font', '10px sans-serif');

      const path = g
        .selectAll('path')
        .data([null])
        .join('path')
        .attr('fill', 'white')
        .attr('stroke', 'black');

      const text = g
        .selectAll('text')
        .data([null])
        .join('text')
        .call((t) =>
          t
            .selectAll('tspan')
            .data(`${value} `.split(/\n/))
            .join('tspan')
            .attr('x', 0)
            .attr('y', (d, i) => `${i * 1.1}em`)
            .style('font-weight', (d, i) => (i ? null : 'bold'))
            .text((d) => d),
        );

      const { x, y, width: w, height: h } = text.node().getBBox();

      text.attr('transform', `translate(${-w / 2},${15 - y})`);
      path.attr(
        'd',
        `M${-w / 2 - 10},5H-5l5,-5l5,5H${w / 2 + 10}v${h + 20}h-${w + 20}z`,
      );
      return null;
    },

    renderChart() {
      // render svg with translated group
      this.svg = d3
        .select(`#${this.chartId}`)
        .append('svg')
        .attr('width', this.getWidth())
        .attr('height', this.getHeight())
        .style('background', this.bgColor)
        .style('-webkit-tap-highlight-color', 'transparent')
        .style('overflow', 'visible')
        .append('g')
        .attr(
          'transform',
          `translate(${this.margin.left}, ${this.margin.top})`,
        );

      this.x = d3
        .scaleTime()
        .domain(d3.extent(this.chartData, (d) => d.date))
        .range([0, this.getInnerWidth()])
        .nice();

      this.svg
        .append('g')
        .attr('transform', `translate(0, ${this.getInnerHeight()})`)
        .call(d3.axisBottom(this.x).ticks(5).tickSizeOuter(0));

      const maxY = d3.max(this.chartData.map((d) => d.velocity));

      this.y = d3
        .scaleLinear()
        .domain([0, maxY])
        .range([this.getInnerHeight(), 0]);

      this.svg.append('g').call(d3.axisLeft(this.y));

      this.line = d3
        .line()
        .curve(d3.curveNatural)
        .defined((d) => !Number.isNaN(d.velocity))
        .x((d) => this.x(d.date))
        .y((d) => this.y(d.velocity));

      // Set the gradient
      this.svg
        .append('linearGradient')
        .attr('id', 'line-gradient')
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', this.y(0))
        .attr('x2', 0)
        .attr('y2', this.y(maxY))
        .selectAll('stop')
        .data([
          { offset: '0%', color: 'green' },
          { offset: '50%', color: 'yellow' },
          { offset: '100%', color: 'red' },
        ])
        .enter()
        .append('stop')
        .attr('offset', (d) => d.offset)
        .attr('stop-color', (d) => d.color);

      // Add the line
      this.svg
        .append('path')
        .datum(this.chartData)
        .attr('fill', 'none')
        .transition()
        .duration(1000)
        .attr('stroke', 'url(#line-gradient)')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('d', this.line);

      const rectOverlay = this.svg
        .append('rect')
        .style('pointer-events', 'all')
        .style('fill', 'none')
        .attr('width', this.getInnerWidth())
        .attr('height', this.getInnerHeight());

      const ctx = this;

      const bisectDate = d3.bisector((d) => d.date).left;
      const dateFormatter = d3.timeFormat('%B %d, %Y');

      const tooltip = this.svg.append('g');

      rectOverlay.on('touchmove mousemove', function (event) {
        const x0 = ctx.x.invert(d3.pointer(event, this)[0]);
        const i = bisectDate(ctx.chartData, x0, 1);
        const d0 = ctx.chartData[i - 1];
        const d1 = ctx.chartData[i];
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        const { date, velocity } = d;

        tooltip
          .attr(
            'transform',
            `translate(${ctx.x(date || 0)},${ctx.y(velocity || 0)})`,
          )
          .call(
            ctx.callout,
            `Velocity: ${velocity}
            ${dateFormatter(date)}`,
          );
      });

      rectOverlay.on('touchend mouseleave', () =>
        tooltip.call(this.callout, null),
      );
    },
  },
};
</script>

<style scoped lang="postcss"></style>
