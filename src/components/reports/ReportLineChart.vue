<template>
  <div :id="id"></div>
</template>

<script>
import { onMounted } from '@vue/composition-api';
import * as d3 from 'd3';
import usei18n from '@/use/usei18n';

export default {
  name: 'ReportLineChart',
  props: {
    data: {
      type: Object,
      default: () => [],
    },
    groupBy: {
      type: String,
      default: '',
    },
    reportName: {
      type: String,
      default: '',
    },
    id: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { $t } = usei18n();

    onMounted(() => {
      const { data } = props;
      //
      //  Multi-line Chart
      //
      function d3LineChart2(data1) {
        const margin = { top: 40, right: 200, bottom: 100, left: 80 };
        const width = 1000 - margin.left - margin.right;
        const height = 600 - margin.top - margin.bottom;

        const parseDate = d3.timeParse('%Y-%m-%d');

        const x = d3.scaleTime().range([0, width]);

        const y = d3.scaleLinear().range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat('%B %d, %Y'));

        const yAxis = d3.axisLeft(y);

        const line = d3
          .line()
          // .interpolate('cardinal')
          .x(function (d) {
            return x(d.date);
          })
          .y(function (d) {
            return y(d.amount);
          });

        const svg = d3
          .select(`#${props.id}`)
          .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
          .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

        function render(chartData) {
          color.domain(
            Object.keys(chartData[0]).filter((key) => key !== props.groupBy),
          );

          chartData.forEach(function (d) {
            d[props.groupBy] = parseDate(d[props.groupBy]);
          });

          chartData.sort(function (a, b) {
            return a[props.groupBy] - b[props.groupBy];
          });

          const metricsData = color.domain().map(function (name) {
            return {
              name,
              values: chartData.map(function (d) {
                return {
                  date: d[props.groupBy],
                  amount: +d[name],
                };
              }),
            };
          });

          x.domain(
            d3.extent(chartData, function (d) {
              return d[props.groupBy];
            }),
          );

          y.domain([
            d3.min(metricsData, function (m) {
              return d3.min(m.values, function (v) {
                return v.amount;
              });
            }),
            d3.max(metricsData, function (m) {
              return d3.max(m.values, function (v) {
                return v.amount;
              });
            }),
          ]);

          svg
            .append('g')
            .attr('class', 'x axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('y', 0)
            .attr('x', 9)
            .attr('dy', '.35em')
            .attr('transform', 'rotate(90)')
            .style('text-anchor', 'start');

          svg
            .append('g')
            .attr('class', 'y axis')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Amount ($)');

          svg
            .append('text')
            .attr('x', width / 2)
            .attr('y', 0 - margin.top / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '20px')
            .text($t(`reports.${props.reportName}`));

          const metrics = svg
            .selectAll('.metrics')
            .data(metricsData)
            .enter()
            .append('g')
            .attr('class', 'metrics');

          metrics
            .append('path')
            .attr('class', 'line')
            .attr('d', function (d) {
              return line(d.values);
            })
            .style('fill', 'none')
            .style('stroke', function (d) {
              return color($t(`reports.${props.reportName}.${d.name}`));
            });

          metrics
            .append('text')
            .datum(function (d) {
              return {
                name: d.name,
                value: d.values[d.values.length - 1],
              };
            })
            .attr('transform', function (d) {
              return `translate(${x(d.value.date)},${y(d.value.amount)})`;
            })
            .attr('x', 3)
            .attr('dy', '.35em')
            .text(function (d) {
              return $t(`reports.${props.reportName}.${d.name}`);
            });
        }

        render(data1);
      }

      d3LineChart2(data);
    });
  },
};
</script>

<style scoped></style>
