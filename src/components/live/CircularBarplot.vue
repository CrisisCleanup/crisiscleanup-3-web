<template>
  <div :id="chartId" ref="chart"></div>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { useI18n } from 'vue-i18n';
import _ from 'lodash';
import useLiveChart from '@/hooks/live/useLiveChart';

export default defineComponent({
  name: 'CircularBarplot',
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
    isStacked: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  setup(props) {
    const chart = ref(null);
    const { t } = useI18n();

    onMounted(() => {
      const {
        getWidth,
        getHeight,
        getInnerWidth,
        getInnerHeight,
        destroyChart,
      } = useLiveChart(
        props.chartId,
        {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
        () => renderChart(),
        true,
      );
      function getInnerRadius() {
        return Math.min(getInnerWidth(), getInnerHeight()) / 5;
      }

      function getOuterRadius() {
        return Math.min(getInnerWidth(), getInnerHeight()) / 2;
      }

      function getFontSize() {
        return Math.min(getInnerWidth(), getInnerHeight()) * 0.026;
      }

      function renderInnerCircle(svg) {
        svg
          .append('g')
          .append('circle')
          .attr('r', getInnerRadius())
          .attr('fill', '#13141Eaa');
      }

      function renderOverallInfo(
        mappedTotalCalls,
        mappedMissedCalls,
        colorScale,
        svg,
      ) {
        renderCaseInfo(
          {
            name: 'Overall Info',
            timestamp: new Date(),
            calls: d3.sum(props.chartData.map(mappedTotalCalls)),
            missed: d3.sum(props.chartData.map(mappedMissedCalls)),
          },
          colorScale,
          svg,
        );
      }

      function renderTotalCalls(svg, colorScale, x, y) {
        const totalCallsGroup = svg
          .append('g')
          .selectAll('path')
          .data(props.chartData, (d) => d.name)
          .join('path')
          .attr('fill', colorScale('calls'))
          .attr('class', 'total-call-path');

        // initial transition
        totalCallsGroup
          .attr('transform', 'scale(1.4)')
          .style('opacity', '0')
          .transition()
          .delay((d, i) => i * 15)
          .duration(500)
          .attr(
            'd',
            d3
              .arc()
              .innerRadius(getInnerRadius())
              .outerRadius((d) => y(d.calls))
              .startAngle((d) => x(d.name))
              .endAngle((d) => x(d.name) + x.bandwidth())
              .padAngle(0.025),
          )
          .style('opacity', '1')
          .attr('transform', 'scale(1)');

        totalCallsGroup
          .on('mouseover', function (event, d) {
            d3.select(this)
              .style('stroke', '#fff')
              .style('stroke-width', 2)
              .style('transform', 'scale(1.015)')
              .style('opacity', '1')
              .style('transition', 'all 200ms');
            renderCaseInfo(d);
          })
          .on('mouseout', function (event, d) {
            d3.select(this)
              .style('stroke', 'none')
              .style('transform', 'scale(1)')
              .style('transition', 'all 200ms');

            renderOverallInfo(d);
          });
      }

      function renderMissedCalls(svg, colorScale, x, y) {
        const missedCallsGroup = svg
          .append('g')
          .selectAll('path')
          .data(props.chartData, (d) => d.name)
          .join('path')
          .attr('fill', colorScale('missed'))
          .attr('class', 'missed-call-path');

        missedCallsGroup
          .attr('transform', 'scale(1.2)')
          .style('opacity', '0')
          .transition()
          .delay((d, i) => i * 15)
          .duration(500)
          .attr(
            'd',
            d3
              .arc()
              .innerRadius(getInnerRadius())
              .outerRadius((d) => y(d.missed))
              .startAngle((d) => x(d.name))
              .endAngle((d) => x(d.name) + x.bandwidth())
              .padAngle(0.03),
          )
          .style('opacity', '1')
          .attr('transform', 'scale(1)');

        missedCallsGroup
          .on('mouseover', function (event, d) {
            d3.select(this)
              .style('stroke', '#fff')
              .style('stroke-width', 2)
              .style('transform', 'scale(1.015)')
              .style('transition', 'all 200ms');

            renderCaseInfo(d);
          })
          .on('mouseout', function () {
            d3.select(this)
              .style('stroke', 'none')
              .style('transform', 'scale(1)')
              .style('transition', 'all 200ms');

            renderOverallInfo();
          });
      }

      function renderAxesAndLabels(svg, xTimeLabels, timeScale, x, y) {
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
            ((timeScale(d) + timeScale.bandwidth() / 2) * 180) / Math.PI - 81
          })
          translate(${getInnerRadius()}, 0)
        `,
              )
              .call((g2) =>
                g2.append('line').attr('x2', -5).attr('stroke', '#fff'),
              )
              .call((g3) =>
                g3
                  .append('text')
                  .attr('font-size', `${getFontSize()}px`)
                  .attr('fill', '#fefefe')
                  .attr('transform', (d) =>
                    (timeScale(d) + timeScale.bandwidth() / 2 + Math.PI / 2) %
                      (2 * Math.PI) <
                    Math.PI
                      ? 'rotate(90) translate(0, 16)'
                      : 'rotate(-90) translate(0, -9)',
                  )
                  .text((d) => t(`${d}`)),
              ),
          );

        const yAxis = (g) =>
          g.attr('text-anchor', 'middle').call((g2) =>
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
                  .attr('stroke-width', 4)
                  .text(y.tickFormat(4, 's'))
                  .attr('font-size', `${0.67}em`)
                  .clone(true)
                  .attr('fill', '#000')
                  .attr('stroke', 'none'),
              ),
          );

        svg.append('g').call(xAxis);
        svg.append('g').call(yAxis);
      }

      function renderCaseInfo(info, colorScale, svg) {
        const textContainer = svg
          .append('g')
          .attr('class', 'text-label')
          .attr('transform', `translate(0, ${-getInnerRadius() / 3})`)
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('x', 0)
          .attr('y', 0);

        const innerTextContainer = textContainer
          .selectAll('tspan')
          .data([info], (d) => d.name);

        innerTextContainer
          .join('tspan')
          .attr('font-size', getInnerRadius() * 0.2)
          .attr('font-weight', 'bold')
          .attr('fill', '#ffffff')
          .attr('x', 0)
          .attr('dy', `${0}em`)
          .text(t('pewPew.calls'));

        innerTextContainer
          .join('tspan')
          .attr('font-size', getInnerRadius() * 0.23)
          .attr('font-weight', 'bold')
          .attr('fill', colorScale('calls'))
          .attr('x', 0)
          .attr('dy', `${1.1}em`)
          .transition()
          .duration(400)
          .textTween((d) => d3.interpolateRound(0, t(`${d.calls}`)));

        innerTextContainer
          .join('tspan')
          .attr('font-size', getInnerRadius() * 0.2)
          .attr('font-weight', 'bold')
          .attr('fill', '#ffffff')
          .attr('x', 0)
          .attr('dy', `${1.5}em`)
          .text(t('pewPew.callbacks'));

        innerTextContainer
          .join('tspan')
          .attr('font-size', getInnerRadius() * 0.23)
          .attr('font-weight', 'bold')
          .attr('fill', colorScale('missed'))
          .attr('x', 0)
          .attr('dy', `${1.1}em`)
          .transition()
          .duration(400)
          .textTween((d) => d3.interpolateRound(0, t(`${d.missed}`)));
      }

      function renderChart() {
        destroyChart();

        const width = getWidth();
        const height = getHeight();
        const fontSize = getFontSize();
        const bgColor = '';

        const mappedNames = (d) => d.name;
        const mappedTimestamps = (d) => d.timestamp;
        const mappedTotalCalls = (d) => d.calls;
        const mappedMissedCalls = (d) => d.missed;

        // append the svg object
        const svg = d3
          .select(chart.value)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('background', bgColor)
          .append('g')
          .attr(
            'transform',
            `translate(${getWidth() / 2}, ${getHeight() / 2})`,
          );

        // Add inner circle
        renderInnerCircle(svg);

        // add x and y scales
        const x = d3
          .scaleBand()
          .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
          .align(0) // This does nothing
          .domain(props.chartData.map(mappedNames)); // The domain of the X axis is the list of states.

        const y = d3
          .scaleRadial()
          .range([getInnerRadius(), getOuterRadius()])
          .domain([0, d3.max(props.chartData, mappedTotalCalls)]);

        const colorScale = d3
          .scaleOrdinal()
          .domain(['missed', 'calls'])
          .range(['#728091', '#61D5F8']);

        const xTimeLabels = Array.from({ length: 24 }, (v, i) => i + 1);

        const timeScale = d3
          .scaleBand()
          .range([0, 2 * Math.PI])
          .align(0)
          .domain(xTimeLabels);

        renderOverallInfo(mappedTotalCalls, mappedMissedCalls, colorScale, svg);
        renderTotalCalls(svg, colorScale, x, y);
        renderMissedCalls(svg, colorScale, x, y);
        renderAxesAndLabels(svg, xTimeLabels, timeScale, x, y);
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

<style scoped lang="postcss"></style>
