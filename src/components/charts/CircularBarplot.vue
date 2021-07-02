<template>
  <div class="chart">
    <div class="chart__circular-barplot" id="circular-barplot"></div>
  </div>
</template>

<script>
// @flow
import * as d3 from 'd3';
import VueTypes from 'vue-types';

// add proper Date type validator to VueTypes
VueTypes.extend({
  name: 'date',
  getter: true,
  type: Date,
  validator(value) {
    return (
      Object.prototype.toString.call(value) === '[object Date]' &&
      Number.isFinite(value)
    );
  },
});

export type ChartDataT = {|
  name: string,
  timestamp: Date,
  open: number,
  closed: number,
|};

export default {
  name: 'CircularBarplot',
  props: {
    chartData: VueTypes.arrayOf<ChartDataT[]>(
      VueTypes.shape<ChartDataT>({
        name: VueTypes.string.isRequired,
        timestamp: VueTypes.date.isRequired,
        open: VueTypes.number,
        closed: VueTypes.number,
      }),
    ).def(() =>
      Array.from({ length: 24 * 4 }, (v, i) => ({
        name: `id-${i}`,
        timestamp: new Date(
          +new Date() - Math.floor(Math.random() * 100000000),
        ).getTime(),
        closed: Math.floor(Math.random() * 200 + 25),
        open: Math.floor(Math.random() * 200 + 25),
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

  mounted() {
    if (this.chartData) {
      this.renderChart(this.chartData);
    } else {
      console.log('No data found');
    }
  },

  watch: {
    chartData: {
      handler(data) {
        if (data) {
          this.destroyChart();
          this.renderChart(data);
        } else {
          console.log('No data found');
        }
      },
    },
  },

  methods: {
    renderChart(data) {
      // set the dimensions and margins of the graph
      const margin = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 20,
      };
      const width = 600 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;
      const innerRadius = Math.min(width, height) / 6;
      const outerRadius = Math.min(width, height) / 2; // the outerRadius goes from the middle of the SVG area to the border
      const textLabelFontSize = 14;

      // append the svg object
      const svg = d3
        .select('#circular-barplot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .style(
          'background',
          'linear-gradient(rgb(44, 55, 65, 0.85) 0%, rgba(44, 55, 65, 0.95) 100%)',
        )
        .append('g')
        .attr(
          'transform',
          `translate(${width / 2 + margin.left}, ${height / 2 + margin.top})`,
        );

      // Add inner circle
      svg
        .append('g')
        .append('circle')
        .attr('r', innerRadius)
        .attr('fill', '#13141Eaa');

      const textbox = svg
        .append('g')
        .attr('class', 'text-label')
        .attr('transform', `translate(0, ${innerRadius * 0.1})`)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', `${textLabelFontSize}px`)
        .attr('fill', '#fefefe');

      function showBarInfo(info) {
        // remove existing tspan
        textbox.selectAll('tspan').remove();

        const textContainer = textbox
          .selectAll('tspan')
          .data([info], (d) => d.name)
          .enter();

        textContainer
          .append('tspan')
          .text('Cases')
          .attr('font-size', `${textLabelFontSize + 8}px`)
          .attr('x', 0)
          .attr('y', '-2.5rem');

        textContainer
          .append('tspan')
          .text('Open')
          .attr('x', 0)
          .attr('y', '-1rem');

        textContainer
          .append('tspan')
          .text((d) => d.open)
          .attr('x', 0)
          .attr('font-size', `${textLabelFontSize + 4}px`)
          .attr('y', '0rem');

        textContainer
          .append('tspan')
          .text('Closed')
          .attr('x', 0)
          .attr('y', '1.5rem');

        textContainer
          .append('tspan')
          .text((d) => d.closed)
          .attr('font-size', `${textLabelFontSize + 4}px`)
          .attr('x', 0)
          .attr('y', '2.5rem');
      }

      function handleMouseOver(event, d) {
        d3.select(this)
          .style('filter', 'brightness(70%)')
          .style('transform', 'scale(1.015)')
          .style('opacity', '1')
          .style('transition', 'all 200ms');

        showBarInfo(d);
      }

      function handleMouseOut() {
        d3.select(this)
          .style('filter', 'brightness(100%)')
          .style('transform', 'scale(1)')
          .style('transition', 'all 200ms');

        showBarInfo({
          name: 'Overall Info',
          timestamp: new Date(),
          closed: d3.sum(data.map((d) => d.closed)),
          open: d3.sum(data.map((d) => d.open)),
        });
      }

      const x = d3
        .scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing
        .domain(data.map((d) => d.name)); // The domain of the X axis is the list of states.

      const y = d3
        .scaleRadial()
        .range([innerRadius, outerRadius]) // Domain will be define later.
        .domain([
          0,
          this.isStacked
            ? d3.max(data, (d) => d.open) + d3.max(data, (d) => d.closed)
            : Math.max(
                d3.max(data, (d) => d.closed),
                d3.max(data, (d) => d.open),
              ),
        ]); // set domain based on chart type (stacked | unstacked)

      const xTimeLabels = Array.from({ length: 24 }, (v, i) => i + 1);

      const timeScale = d3
        .scaleBand()
        .range([0, 2 * Math.PI])
        .align(0)
        .domain(Array.from(xTimeLabels.map((d) => d)));

      const xAxis = (g) =>
        g.attr('text-anchor', 'middle').call((g1) =>
          g1
            .selectAll('g')
            .data(xTimeLabels, (d) => d)
            .join('g')
            .attr(
              'transform',
              (d) => `
          rotate(${
            ((timeScale(d) + timeScale.bandwidth() / 2) * 180) / Math.PI - 90
          })
          translate(${innerRadius},0)
        `,
            )
            .call((g2) =>
              g2.append('line').attr('x2', -5).attr('stroke', '#fff'),
            )
            .call((g3) =>
              g3
                .append('text')
                .attr('font-size', '12px')
                .attr('fill', '#fefefe')
                .attr('transform', (d) =>
                  (timeScale(d) + timeScale.bandwidth() / 2 + Math.PI / 2) %
                    (2 * Math.PI) <
                  Math.PI
                    ? 'rotate(90) translate(0, 16)'
                    : 'rotate(-90) translate(0, -9)',
                )
                .text((d) => d),
            ),
        );

      const yAxis = (g) =>
        g
          .attr('text-anchor', 'middle')
          .call((g1) =>
            g1
              .append('text')
              .attr('font-size', '12px')
              .attr('fill', '#fff')
              .attr('y', -y(y.ticks(3).pop()))
              .attr('dy', '-1em')
              .text('Call Volumes'),
          )
          .call((g2) =>
            g2
              .selectAll('g')
              .data(y.ticks(4).slice(1))
              .join('g')
              .attr('fill', 'none')
              .call((g3) =>
                g3
                  .append('circle')
                  .attr('stroke', '#5d717f')
                  .style('stroke-dasharray', '6, 6')
                  .attr('stroke-width', 3)
                  .attr('stroke-opacity', 0.8)
                  .attr('r', y),
              )
              .call((g4) =>
                g4
                  .append('text')
                  .attr('y', (d) => -y(d))
                  .attr('dy', '0.35em')
                  .attr('stroke', '#fff')
                  .attr('stroke-width', 2)
                  .text(y.tickFormat(4, 's'))
                  .attr('font-size', '12px')
                  .clone(true)
                  .attr('fill', '#000')
                  .attr('stroke', 'none'),
              ),
          );

      // Add bars for new cases
      svg
        .append('g')
        .selectAll('path')
        .data(data, (d) => d.name)
        .join('path')
        .attr('fill', '#728091')
        .attr('class', 'open-case-path')
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(y(0))
            .outerRadius(y(0))
            .startAngle((d) => x(d.name))
            .endAngle(x(0) + x.bandwidth()),
        )
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius((d) => y(d.closed))
            .outerRadius((d) => y(d.closed + d.open))
            .startAngle((d) => x(d.name))
            .endAngle((d) => x(d.name) + x.bandwidth())
            .padAngle(0.015)
            .padRadius((d) => y(d.closed)),
        );

      // Add bars for closed cases
      svg
        .append('g')
        .selectAll('path')
        .data(data, (d) => d.name)
        .join('path')
        .attr('fill', '#61D5F8')
        .attr('class', 'closed-case-path')
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(y(0))
            .outerRadius(y(0))
            .startAngle((d) => x(d.name))
            .endAngle(x(0) + x.bandwidth()),
        )
        .on('mouseover', handleMouseOver)
        .on('mouseout', handleMouseOut)
        .transition()
        .delay((d, i) => i * 15)
        .duration(500)
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(innerRadius)
            .outerRadius((d) => y(d.closed))
            .startAngle((d) => x(d.name))
            .endAngle((d) => x(d.name) + x.bandwidth())
            .padAngle(0.03)
            .padRadius(innerRadius),
        );

      showBarInfo({
        name: 'Overall Info',
        timestamp: new Date(),
        closed: d3.sum(data.map((d) => d.closed)),
        open: d3.sum(data.map((d) => d.open)),
      });

      svg.append('g').call(xAxis);
      svg.append('g').call(yAxis);
    },

    renderOpenCaseLabels(svg, data, x, y) {
      // Add the labels
      svg
        .append('g')
        .selectAll('g')
        .data(data)
        .join('g')
        .attr('text-anchor', function (d) {
          return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
            Math.PI
            ? 'end'
            : 'start';
        })
        .attr('transform', function (d) {
          return `rotate(${
            ((x(d.name) + x.bandwidth() / 2) * 180) / Math.PI - 90
          })translate(${y(d.closed) - 50},0)`;
        })
        .append('text')
        .text(function (d) {
          return d.closed;
        })
        .attr('transform', function (d) {
          return (x(d.name) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) <
            Math.PI
            ? 'rotate(180)'
            : 'rotate(0)';
        })
        .style('font-size', '11px')
        .style('fill', 'white')
        .attr('alignment-baseline', 'middle');
    },

    destroyChart() {
      d3.select('#circular-barplot svg').remove();
    },
  },
};
</script>

<style scoped lang="postcss">
.chart {
  @apply flex justify-center items-center;
  &__circular-barplot {
  }
}
</style>
