<template>
  <div :id="id" class="relative"></div>
</template>

<script>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import moment from 'moment';

export default {
  name: 'ReportBarChart',
  props: {
    data: {
      type: Array,
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
    displayOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const { t } = useI18n();

    onMounted(() => {
      const { data } = props;
      const keys = Object.keys(data[0]).filter((key) => key !== props.groupBy);

      const margin = { top: 150, right: 200, bottom: 150, left: 80 };
      const width = 1200 - margin.left - margin.right;
      const height = 700 - margin.top - margin.bottom;

      let svg = d3
        .select(`#${props.id}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top * 2)
        .style('background', '#fff');

      svg = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top - 30})`);

      const x = d3.scaleBand().rangeRound([0, width]).padding(0.1);

      const y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(props.data, function (m) {
            let value = 0;
            for (const k of keys) {
              value += m[k];
            }

            return value;
          }),
        ])
        .range([height, 0]);

      x.domain(data.map((d) => d[props.groupBy]));

      const xAxis = d3
        .axisBottom()
        .scale(x)
        .tickFormat(d3.timeFormat('%B %d, %Y'))
        .ticks(20)
        .tickValues(props.data.map((d) => d[props.groupBy]));

      svg
        .append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
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

      svg
        .append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'start')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom / 2 + 50)
        .text(t(props.displayOptions.axes.x.name));

      svg
        .append('text')
        .attr('class', 'y label')
        .attr('text-anchor', 'start')
        .attr('y', -margin.left / 2 - 20)
        .attr('x', -height / 2 - 80)
        .attr('dy', '.75em')
        .attr('transform', 'rotate(-90)')
        .text(t(props.displayOptions.axes.y.name));

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text(t(`reports.${props.reportName}`));

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '15px')
        .html(t(`reports.paid_for_statement`));

      const toolTip = d3
        .select(`#${props.id}`)
        .append('div')
        .style('visibility', 'hidden')
        .attr('class', 'chart-tooltip');

      const dataStackLayout = d3.stack().keys(keys)(data);
      const layer = svg
        .selectAll('.stack')
        .data(dataStackLayout)
        .enter()
        .append('g')
        .attr('class', 'stack')
        .style('fill', (d) => {
          return props.displayOptions.colors[
            `reports.${props.reportName}.${d.key}`
          ];
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
        .attr('width', x.bandwidth())
        .style('cursor', 'pointer')
        .on('mouseover', function (e, d) {
          // Get this bar's x/y values, then augment for the tooltip
          const mouse = d3.pointer(e);
          const mouseX = mouse[0];
          const mouseY = mouse[1];

          let displaytext = '';
          for (const key of Object.keys(d.data)) {
            if (d.data[key] instanceof Date) {
              displaytext += `${t(
                `reports.${props.reportName}.${key}`,
              )}: ${moment(d.data[key]).format('ddd MMMM Do YYYY')}\n`;
            } else {
              displaytext += `${t(`reports.${props.reportName}.${key}`)}: ${
                d.data[key]
              }\n`;
            }
          }

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
