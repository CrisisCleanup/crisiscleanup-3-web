<template>
  <div :id="chartId" ref="chart"></div>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { useI18n } from 'vue-i18n';
import _ from 'lodash';
import useLiveChart from '@/hooks/live/useLiveChart';

export default defineComponent({
  name: 'D3BarChart',
  props: {
    /**
     * Data for gauge
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

      const getFontSize = () => {
        return (getWidth() + getHeight()) * 0.012;
      };

      function loadSvg() {
        // render svg with translated group
        const svg = d3
          .select(chart.value)
          .append('svg')
          .attr('width', getWidth())
          .attr('height', getHeight())
          .style('background', '')
          .append('g')
          .attr('transform', `translate(${margin.left}, ${margin.top})`);

        return svg;
      }

      function loadAxes(svg, x, y) {
        svg
          .append('g')
          .attr('class', 'x-axis')
          .attr('transform', `translate(0, ${getInnerHeight()})`)
          .call(
            d3
              .axisBottom(x)
              .tickValues(x.domain().filter((d, i) => !(i % 5))) // render ticks with 5 day gaps
              .tickFormat((d) =>
                d3.timeFormat('%b %d')(new Date(d) || new Date()),
              )
              .tickSizeOuter(0),
          )
          .selectAll('text')
          .style('font-size', '8px')
          .style('text-anchor', 'end')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-35)')
          .append('title')
          .text((d) => t(`${d}`));

        svg
          .append('g')
          .attr('class', 'y-axis')
          .attr('transform', `translate(${margin.left}, ${0})`)
          .call(d3.axisLeft(y));
      }

      function loadTooltip() {
        d3.selectAll('#bar-chart-tooltip').remove();
        d3.select('body')
          .append('div')
          .attr('id', 'bar-chart-tooltip')
          .attr('class', 'text-xs px-2 py bg-white rounded-md font-bold')
          .attr('style', 'position: absolute; opacity: 0;')
          .on('mouseover', function () {
            // remove ghosted tooltip on mouseover
            d3.select(this).style('opacity', 0);
          });
      }

      function renderUnstackedChart() {
        const newCases = props.chartData.map((d) => d.newCases);
        const closedCases = props.chartData.map((d) => d.closedCases);
        const groups = props.chartData.map((d) => d.group);
        const subgroups = _.filter(
          props.chartData.columns,
          (c) => c !== 'group',
        );

        // set x scale
        const x = d3
          .scaleBand()
          .domain(groups)
          .range([margin.left, getInnerWidth()])
          .padding(0.2);

        // set y scale
        const y = d3
          .scaleLinear()
          .domain([0, d3.max([d3.max(newCases), d3.max(closedCases)])])
          .range([getInnerHeight(), margin.top])
          .nice();

        // set color scale for groups
        const colorScale = d3
          .scaleOrdinal()
          .domain(subgroups)
          .range(colorRange);

        const svg = loadSvg();
        loadAxes(svg, x, y);
        loadTooltip();

        const closedCaseBars = svg
          .append('g')
          .attr('class', 'closed-case-bars')
          .selectAll('g')
          .data(props.chartData)
          .join('rect')
          .attr('x', (d) => x(d.group))
          .attr('y', getInnerHeight())
          .attr('width', x.bandwidth())
          .transition()
          .duration(1000)
          .delay((d, i) => i * 50)
          .ease(d3.easeCubicInOut)
          .attr('x', (d) => x(d.group))
          .attr('y', (d) => y(d.closedCases))
          .attr('width', x.bandwidth())
          .attr('height', (d) => getInnerHeight() - y(d.closedCases))
          .attr('fill', colorScale('closedCases'))
          .on('end', function (d) {
            addHoverEffects(this, d.closedCases);
          });

        const newCaseBars = svg
          .append('g')
          .attr('class', 'new-case-bars')
          .selectAll('g')
          .data(props.chartData)
          .join('rect')
          .attr('x', (d) => x(d.group))
          .attr('y', getInnerHeight())
          .attr('width', x.bandwidth())
          .transition()
          .duration(1000)
          .delay((d, i) => i * 50)
          .ease(d3.easeCubicInOut)
          .attr('x', (d) => x(d.group))
          .attr('y', (d) => y(d.newCases))
          .attr('width', x.bandwidth())
          .attr('height', (d) => getInnerHeight() - y(d.newCases))
          .attr('fill', colorScale('newCases'))
          .on('end', function (d) {
            addHoverEffects(this, d.newCases);
          });

        renderLegend(svg, colorScale);
        animateBars(closedCaseBars);
        animateBars(newCaseBars);
      }

      function renderStackedChart() {
        const groups = props.chartData.map((d) => d.group);
        const subgroups = _.filter(
          props.chartData.columns,
          (c) => c !== 'group',
        );

        // normalize data to filter out falsy values
        const normalizedData = props.chartData.map((item) => ({
          group: new Date(item.group) ? item.group : '',
          newCases: item.newCases ?? 0,
          closedCases: item.closedCases ?? 0,
        }));

        // stack per subgroup
        const stackedData = d3.stack().keys(subgroups)(normalizedData);

        // set x scale
        const x = d3
          .scaleBand()
          .domain(groups)
          .range([margin.left, getInnerWidth()])
          .padding(0.2);

        // set y scale
        const y = d3
          .scaleLinear()
          .domain([
            0,
            d3.max(props.chartData.map((c) => c.newCases + c.closedCases)),
          ])
          .range([getInnerHeight(), margin.top])
          .nice();

        // set color scale for groups
        const colorScale = d3
          .scaleOrdinal()
          .domain(subgroups)
          .range(colorRange);

        const svg = loadSvg();
        loadAxes(svg, x, y);
        loadTooltip();

        // render bars
        const bars = svg
          .append('g')
          .selectAll('g')
          // Enter in the stack data = loop key per key = group per group
          .data(stackedData)
          .join('g')
          .attr('fill', (d) => colorScale(d.key))
          .selectAll('rect')
          // enter a second time = loop subgroup per subgroup to add all rectangles
          .data((d) => d)
          .join('rect')
          .attr('x', (d) => x(d.data.group))
          .attr('y', getInnerHeight())
          .attr('width', x.bandwidth())
          .transition()
          .duration(1000)
          .delay((d, i) => i * 50)
          .ease(d3.easeCubicInOut)
          .attr('x', (d) => x(d.data.group))
          .attr('y', (d) => y(d[1]))
          .attr('height', (d) => y(d[0]) - y(d[1]))
          .attr('width', x.bandwidth())
          .on('end', function (d) {
            addHoverEffects(this, d[1] - d[0]);
          });

        renderLegend(svg, colorScale);
        animateBars(bars);
      }

      function renderLegend(svg, colorScale) {
        const legend = svg
          .append('g')
          .attr('class', 'legend-container')
          .attr('transform', `translate(${getInnerWidth() * 0.1}, ${0})`);

        legend
          .append('g')
          .selectAll('g')
          .data(colorScale.range())
          .join('rect')
          .attr('width', '10px')
          .attr('height', '10px')
          .attr('transform', (d, i) => `translate(${i * 70}, ${0})`)
          .attr('fill', (d) => d);

        legend
          .append('g')
          .selectAll('g')
          .data(colorScale.domain())
          .join('text')
          .text((d) => t(`${_.startCase(d)}`))
          .attr('transform', (d, i) => `translate(${i * 70 + 15}, ${5})`)
          .attr('dominant-baseline', 'middle')
          .style('font-size', '8px')
          .attr('fill', 'white');
      }

      function addHoverEffects(ctx, tooltipText) {
        d3.select(ctx)
          .on('mouseover', function (event) {
            d3.select(this).attr('class', 'stroke--active');
            d3.select('#bar-chart-tooltip')
              .transition()
              .duration(20)
              .style('opacity', 1)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY + 10}px`)
              .text(t(`${tooltipText}`));
          })
          .on('mouseout', function () {
            d3.select('#bar-chart-tooltip').style('opacity', 0);
            d3.select(this).attr('class', null);
          })
          .on('mousemove', function (event) {
            d3.select('#bar-chart-tooltip')
              .transition()
              .duration(50)
              .style('opacity', 1)
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY + 10}px`)
              .text(t(`${tooltipText}`));
          });
      }

      function animateBars(bars) {
        bars
          .transition()
          .delay(function (d, i) {
            return i * 50;
          })
          .on('start', function repeat() {
            d3.active(this)
              .attr('stroke', 'white')
              .attr('stroke-width', 2)
              .transition()
              .duration(500)
              .delay(50)
              .attr('stroke', 'transparent')
              .attr('stroke-width', 0)
              .transition()
              .duration(500)
              .delay(10_000)
              .on('start', repeat);
          });
      }

      function renderChart() {
        destroyChart();

        // override default bottom margin to make space for x-axis
        margin.bottom = 40;
        // add header columns to chartData array for d3 stacking
        props.chartData.columns = _.isEmpty(props.chartData)
          ? []
          : _.keys(props.chartData[0]);
        if (props.isStacked) {
          renderStackedChart();
        } else {
          renderUnstackedChart();
        }
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
