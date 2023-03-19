<template>
  <div :id="chartId" ref="chart"></div>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import * as d3 from 'd3';
import _ from 'lodash';

export default defineComponent({
  name: 'CaseDonutChart',
  props: {
    chartData: {
      type: Object,
      default: () => ({
        reportedCases: 10,
        claimedCases: 50,
        completedCases: 30,
      }),
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
      // set the dimensions and margins of the graph
      const width = 35;
      const height = width;
      const margin = width / 10;

      // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
      const radius = Math.min(width, height) / 2 - margin;

      // append the svg object to the div called 'my_dataviz'
      const svg = d3
        .select(chart.value)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      // set the color scale
      const color = d3
        .scaleOrdinal()
        .domain(['reportedCases', 'completedCases', 'claimedCases'])
        .range(['#ffffff', '#61F8B0', '#F79820']);

      // Compute the position of each group on the pie:
      const pie = d3.pie().value((d: string[]) => d[1]);

      const data_ready = pie(Object.entries(props.chartData));

      // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
      svg
        .selectAll('whatever')
        .data(data_ready)
        .join('path')
        .attr(
          'd',
          d3
            .arc()
            .innerRadius(height / 5) // This is the size of the donut hole
            .outerRadius(radius),
        )
        .attr('fill', (d: { data: any[] }) => color(d.data[0]))
        .attr('stroke', 'black')
        .style('stroke-width', '1px')
        .style('opacity', 0.7)
        .on('mouseover', function () {
          d3.select(this).transition().duration(200).style('opacity', 1);
          d3.select(this)
            .append('title')
            .text(
              // d.data[0] represents labels i.e. Reported Cases, Closed Cases, etc
              // d.data[1] represents total number of Reported/Closed cases
              (d) => `${t(_.startCase(d.data[0]))}: ${t(d.data[1])}`,
            );
        })
        .on('mouseout', function () {
          d3.select(this).transition().duration(200).style('opacity', 0.7);
        });
    });

    return {
      chart,
    };
  },
});
</script>
