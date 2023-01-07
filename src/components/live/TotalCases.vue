<template>
  <div :id="chartId" ref="chart"></div>
</template>

<script>
import * as d3 from 'd3';
import { useI18n } from 'vue-i18n';
import _ from 'lodash';
import useLiveChart from '@/hooks/live/useLiveChart';

export default defineComponent({
  name: 'TotalCases',
  props: {
    /**
     * Data for total cases
     */
    chartData: {
      type: Array,
      default: () => [],
    },
    chartId: {
      type: String,
      default: `d3-chart-${_.uniqueId()}`,
      required: false,
    },
  },

  setup(props) {
    const chart = ref(null);
    const { t } = useI18n();
    const colorRange = ['#00C4FF', '#728090'];
    let focus = null;
    let view = null;

    onMounted(() => {
      const margin = {
        left: 10,
        right: 10,
        top: 10,
        bottom: 10,
      };
      const {
        getWidth,
        getHeight,
        getInnerWidth,
        getInnerHeight,
        destroyChart,
      } = useLiveChart(props.chartId, margin, () => renderChart(), true);

      function pack(data) {
        return d3.pack().size([getInnerWidth(), getInnerHeight()]).padding(8)(
          d3
            .hierarchy(data)
            .sum((d) => d.value)
            .sort((a, b) => b.value - a.value),
        );
      }

      function loadTooltip() {
        d3.selectAll(`#${props.chartId}-tooltip`).remove();
        d3.select('body')
          .append('div')
          .attr('id', `${props.chartId}-tooltip`)
          .attr('class', 'text-xs px-2 py bg-white rounded-md font-bold')
          .style('position', 'absolute')
          .style('opacity', 0)
          .on('mouseover', function () {
            // remove ghosted tooltip on mouseover
            d3.select(this).style('opacity', 0);
          });
      }

      function zoomTo(v, label, node) {
        view = v;
        const k = getInnerWidth() / v[2];

        label.attr(
          'transform',
          (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
        );
        node.attr(
          'transform',
          (d) => `translate(${(d.x - v[0]) * k},${(d.y - v[1]) * k})`,
        );
        node.attr('r', (d) => d.r * k);
      }

      function zoom(event, d, svg, label, node) {
        focus = d;
        svg
          .transition()
          .duration(750)
          .tween('zoom', () => {
            const i = d3.interpolateZoom(view, [
              focus.x,
              focus.y,
              focus.r * 2.5,
            ]);
            return (t) => zoomTo(i(t), label, node);
          });
      }

      function renderChart() {
        destroyChart();
        const root = pack({
          name: 'Total',
          value: _.sumBy(props.chartData, (d) => d.count),
          color: '#ffffff22',
          children: _.map(props.chartData, (d) => ({
            name: d.name,
            value: d.count,
            color: d.color,
          })),
        });

        // render svg with translated group
        const svg = d3
          .select(chart.value)
          .append('svg')
          .attr('width', getWidth())
          .attr('height', getHeight())
          .style('background', '')
          .style('-webkit-tap-highlight-color', 'transparent')
          .append('g')
          .attr(
            'transform',
            `translate(${getWidth() / 2}, ${getHeight() / 2})`,
          );

        loadTooltip();

        const colorScale = d3
          .scaleOrdinal()
          .domain([..._.map(props.chartData, (d) => d.name), 'Total'])
          .range([..._.map(props.chartData, (d) => d.color), '#ffffff22']);

        const node = svg
          .append('g')
          .selectAll('circle')
          .data(root.descendants())
          .join('circle')
          .attr('fill', (d) => colorScale(d.data.name))
          .style('cursor', 'pointer');

        node.style('opacity', 0).transition().duration(850).style('opacity', 1);

        node
          .on('mouseover mousemove', function (event, d) {
            d3.select(this).attr('stroke', '#fefefe').attr('stroke-width', 3);
            d3.select(`#${props.chartId}-tooltip`)
              .transition()
              .duration(20)
              .style('opacity', 1)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY + 10}px`)
              .text(t(`${_.startCase(d.data.name)}: ${d.data.value}`));
          })
          .on('mouseout', function () {
            d3.select(this).attr('stroke', null);
            d3.select(`#${props.chartId}-tooltip`).style('opacity', '0');
          })
          .on('click', (event, d) => {
            if (focus !== d) {
              zoom(event, d, svg, label, node);
              event.stopPropagation();
            }
          });

        const label = svg
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

        zoomTo([root.x, root.y, root.r * 2.5], label, node);

        svg.on('click', (event) => zoom(event, root, svg, label, node));

        const simulation = d3
          .forceSimulation()
          .force(
            'forceX',
            d3
              .forceX()
              .strength(0.05)
              .x(getInnerWidth() * 0.5),
          )
          .force(
            'forceY',
            d3
              .forceY()
              .strength(0.05)
              .y(getInnerHeight() * 0.5),
          )
          .force(
            'center',
            d3
              .forceCenter()
              .x(getInnerWidth() * 0.5)
              .y(getInnerHeight() * 0.5),
          )
          .force('charge', d3.forceManyBody().strength(0.1))
          .force(
            'collide',
            d3
              .forceCollide()
              .strength(0.05)
              .radius((d) => d.r + 3)
              .iterations(1),
          );

        // Apply these forces to the nodes and update their positions.
        simulation.nodes(root.descendants().slice(1)).on('tick', () => {
          const k = getInnerWidth() / (root.r * 2);
          label.attr(
            'transform',
            (d) => `translate(${(d.x - root.x) * k},${(d.y - root.y) * k})`,
          );
          node.attr(
            'transform',
            (d) => `translate(${(d.x - root.x) * k},${(d.y - root.y) * k})`,
          );
        });
      }

      renderChart();
    });

    return {
      scale: null,
      xScale: null,
      yScale: null,
      colorScale: null,
      chart,
    };
  },
});
</script>

<style scoped lang="postcss">
::v-deep .stroke--active {
  stroke: #ffffff;
  stroke-width: 2px;
  transition: all 10ms;
}

::v-deep .stroke--inactive {
  stroke: transparent;
  stroke-width: 0;
  transition: all 500ms;
}
</style>
