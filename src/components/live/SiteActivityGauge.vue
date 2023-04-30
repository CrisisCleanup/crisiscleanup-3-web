<template>
  <div :id="chartId" ref="chart"></div>
</template>

<script lang="ts">
import * as d3 from 'd3';
import { useI18n } from 'vue-i18n';
import _ from 'lodash';
import useLiveChart from '@/hooks/live/useLiveChart';

export default defineComponent({
  name: 'SiteActivityGauge',
  props: {
    /**
     * Data for gauge
     */
    chartData: {
      type: Number,
      default: 60,
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
      const getInnerRadius = () => {
        return Math.min(getInnerWidth(), getInnerHeight()) / 2;
      };

      const getFontSize = () => {
        return Math.min(getInnerWidth(), getInnerHeight()) * 0.065;
      };

      function addDefs(svg) {
        // defs container
        const defs = svg.append('defs');

        // radical gradient for the active (filled up) spikes
        const activeRadialGrad = defs
          .append('radialGradient')
          .attr('id', 'active-spike-grad');
        activeRadialGrad
          .append('stop')
          .attr('offset', '10%')
          .attr('stop-color', '#61D5F8');
        activeRadialGrad
          .append('stop')
          .attr('offset', '95%')
          .attr('stop-color', '#61D5F8AA');

        // radical gradient for the inactive spikes
        const inactiveRadialGrad = defs
          .append('radialGradient')
          .attr('id', 'inactive-spike-grad');
        inactiveRadialGrad
          .append('stop')
          .attr('offset', '10%')
          .attr('stop-color', '#728090');
        inactiveRadialGrad
          .append('stop')
          .attr('offset', '95%')
          .attr('stop-color', '#728090AA');

        // glow filters
        const shadowFilter = defs
          .append('filter')
          .attr('id', 'shadow-glow')
          .attr('x', '-500%')
          .attr('y', '-500%')
          .attr('width', '1000%')
          .attr('height', '1000%');
        const glowFilter = defs.append('filter').attr('id', 'spike-glow');
        const noGlowFilter = defs.append('filter').attr('id', 'spike-noglow');

        shadowFilter
          .append('feFlood')
          .attr('result', 'flood')
          .attr('flood-color', '#000')
          .attr('flood-opacity', '1');
        shadowFilter
          .append('feComposite')
          .attr('in', 'flood')
          .attr('result', 'mask')
          .attr('in2', 'SourceGraphic')
          .attr('operator', 'in');
        shadowFilter
          .append('feMorphology')
          .attr('in', 'mask')
          .attr('result', 'dilated')
          .attr('operator', 'dilate')
          .attr('radius', 2);
        shadowFilter
          .append('feGaussianBlur')
          .attr('stdDeviation', '15')
          .attr('in', 'dilated')
          .attr('result', 'blurred');

        glowFilter
          .append('feGaussianBlur')
          .attr('stdDeviation', '4')
          .attr('result', 'coloredBlur');

        noGlowFilter
          .append('feGaussianBlur')
          .attr('stdDeviation', '0')
          .attr('result', 'coloredBlur');

        const shadowFeMerge = shadowFilter.append('feMerge');
        shadowFeMerge.append('feMergeNode').attr('in', 'blurred');
        shadowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        const glowFeMerge = glowFilter.append('feMerge');
        glowFeMerge.append('feMergeNode').attr('in', 'coloredBlur');
        glowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        const noGlowFeMerge = glowFilter.append('feMerge');
        noGlowFeMerge.append('feMergeNode').attr('in', 'coloredBlur');
        noGlowFeMerge.append('feMergeNode').attr('in', 'SourceGraphic');
      }

      function renderChart() {
        destroyChart();

        const width = getWidth();
        const height = getHeight();
        const fontSize = getFontSize();
        const bgColor = '';

        const scale = d3
          .scaleLinear()
          .domain([0, 101])
          .range([-Math.PI / 2, Math.PI / 2])
          .clamp(true); // prevent values from going out of domain

        const radius = getInnerRadius();
        const spikesData = Array.from({ length: 21 }, (v, i) => i * 5);
        const arc = d3
          .arc()
          .innerRadius(radius * 0.7)
          .outerRadius(radius * 1.1);

        // render svg with translated group
        const svg = d3
          .select(chart.value)
          .append('svg')
          .attr('width', width)
          .attr('height', height)
          .style('background', bgColor)
          .append('g')
          .attr('transform', `translate(${width / 2}, ${height / 1.5})`);

        addDefs(svg);

        const spikes = svg.selectAll('path').data(spikesData).join('path');
        spikes.append('title').text((d) => `${d}%`);

        // spike transitions
        spikes
          .attr('d', (d) =>
            arc({
              startAngle: scale(d),
              endAngle: scale(d + 1),
            }),
          )
          .attr('fill', 'transparent')
          .transition()
          .duration(400)
          .delay((d, i) => i * 20)
          .attr('d', (d) =>
            arc({
              startAngle: scale(d),
              endAngle: scale(d + 1),
            }),
          )
          .attr('fill', (d) =>
            scale(d) < scale(props.chartData)
              ? 'url(#active-spike-grad)'
              : 'url(#inactive-spike-grad)',
          )
          .transition()
          .delay(function (d, i) {
            return i * 50;
          })
          .on('start', function repeat() {
            d3.select(this)
              .attr('filter', 'url(#spike-noglow)')
              .transition()
              .duration(500)
              .delay(50)
              .attr('filter', 'url(#spike-glow)')
              .transition()
              .duration(500)
              .delay(50)
              .attr('filter', 'url(#spike-noglow)')
              .transition()
              .delay(5000)
              .on('start', repeat);
          });

        // inner semicircle for shadow glow effect
        svg
          .append('path')
          .classed('shadow-semicircle', true)
          .attr(
            'd',
            d3
              .arc()
              .innerRadius(0)
              .outerRadius(radius * 0.71)
              .startAngle(scale(0))
              .endAngle(scale(101)),
          )
          .attr('fill', '#13141E')
          .attr('filter', 'url(#shadow-glow)');

        // inner arc to display filled gray semicircle
        svg
          .append('path')
          .classed('filled-semicircle', true)
          .attr(
            'd',
            d3
              .arc()
              .innerRadius(0)
              .outerRadius(radius * 0.68)
              .startAngle(scale(0))
              .endAngle(scale(props.chartData)),
          )
          .attr('fill', '#242C36');

        // circle for attaching arrow
        svg
          .append('circle')
          .attr('r', radius * 0.1)
          .attr('fill', '#fefefe');

        // set initial arrow arc at 0
        const arrowArc = d3
          .arc()
          .innerRadius(0)
          .outerRadius(radius * 1.1)
          .startAngle(scale(0))
          .endAngle(scale(1));

        // gauge arrow
        const arrow = svg
          .selectAll('path.arrow')
          .data([props.chartData])
          .join('path')
          .attr('class', 'arrow')
          .attr('fill', '#fff');

        arrow.append('title').text(`${props.chartData}%`);

        // transition arrow to endAngle
        arrow
          .transition()
          .duration(2000)
          .attrTween('d', (d) => {
            const interpolateStart = d3.interpolate(scale(0), scale(d));
            const interpolateEnd = d3.interpolate(scale(1), scale(d + 1));
            return (t) => {
              arrowArc.startAngle(interpolateStart(t));
              arrowArc.endAngle(interpolateEnd(t));
              return arrowArc();
            };
          });

        // label group
        const labelGroup = svg.append('g').attr('fill', '#fefefe');
        const labelHeightOffset = height * 0.1;

        // left label
        labelGroup
          .append('text')
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          .attr('font-size', fontSize)
          .attr('font-weight', 'bold')
          .attr(
            'transform',
            `translate(${
              -(radius * 1.1 + radius * 0.7) / 2
            }, ${labelHeightOffset})`,
          )
          .text(t('reports.pp_engagement_slow'));

        // right label
        labelGroup
          .append('text')
          .attr('dominant-baseline', 'middle')
          .attr('text-anchor', 'middle')
          .attr('font-size', fontSize)
          .attr('font-weight', 'bold')
          .attr(
            'transform',
            `translate(${
              (radius * 1.1 + radius * 0.7) / 2
            }, ${labelHeightOffset})`,
          )
          .text(t('reports.pp_engagement_strong'));
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
