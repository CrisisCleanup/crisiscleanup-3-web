<template>
  <div :id="id" class="relative"></div>
</template>

<script>
import { onMounted } from '@vue/composition-api';
import * as d3 from 'd3';
import usei18n from '@/use/usei18n';

export default {
  name: 'ReportBarChart',
  props: {
    data: {
      type: Object,
      default: () => [],
    },
    id: {
      type: String,
      default: '',
    },
    reportName: {
      type: String,
      default: '',
    },
    groupBy: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { $t } = usei18n();

    onMounted(() => {
      // const data = [
      //   { category: new Date('2021-08-15'), A: 10, B: 20, C: 30, D: 40, E: 50 },
      //   { category: new Date('2021-08-16'), A: 50, B: 40, C: 30, D: 20, E: 10 },
      // ];
      const { data } = props;
      const keys = Object.keys(data[0]).filter((key) => key !== props.groupBy);

      const margin = { top: 40, right: 200, bottom: 50, left: 80 };
      const width = 1000 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      let svg = d3
        .select(`#${props.id}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top * 2)
        .style('background', '#fff');

      svg = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top - 30})`);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(props.data, function (m) {
            let value = 0;
            keys.forEach((k) => {
              value += m[k];
            });

            return value;
          }),
        ])
        .range([height, 0]);

      x.domain(data.map((d) => d[props.groupBy]));

      svg
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%B %d, %Y')))
        .selectAll('text')
        .attr('y', 0)
        .attr('x', 9)
        .attr('dy', '.35em')
        .attr('transform', 'rotate(45)')
        .style('text-anchor', 'start');

      svg
        .append('g')
        .attr('class', 'axis')
        .call(
          d3
            .axisLeft(y)
            .ticks(null, 's')
            .tickFormat((d) => d),
        );

      const toolTip = d3
        .select(`#${props.id}`)
        .append('div')
        .attr('class', 'chart-tooltip');

      const dataStackLayout = d3.stack().keys(keys)(data);
      const layer = svg
        .selectAll('.stack')
        .data(dataStackLayout)
        .enter()
        .append('g')
        .attr('class', 'stack')
        .style('fill', (d) => {
          return color($t(`reports.${props.reportName}.${d.key}`));
        });

      layer
        .selectAll('rect')
        .data((d) => d)
        .enter()
        .append('rect')
        .attr('x', (d) => {
          return x(d.data[props.groupBy]);
        })
        .attr('y', (d) => y(d[1]))
        .attr('height', (d) => y(d[0]) - y(d[1]))
        .attr('width', 25)
        .style('cursor', 'pointer')
        .on('mouseover', function (e, d) {
          // Get this bar's x/y values, then augment for the tooltip
          const mouse = d3.pointer(e);
          const mouseX = mouse[0];
          const mouseY = mouse[1];

          let displaytext = '';
          Object.keys(d.data).forEach((key) => {
            displaytext += `${$t(`reports.${props.reportName}.${key}`)}: ${
              d.data[key]
            }\n`;
          });

          // update the tooltip position and value
          toolTip
            .style('visibility', 'visible')
            .style('left', `${mouseX}px`)
            .style('top', `${mouseY}px`)
            .text(`${displaytext}\n`);
        })
        // hide tooltip
        .on('mouseout', function () {
          toolTip.style('visibility', 'hidden');
        });
    });
  },
};
</script>

<style scoped></style>
