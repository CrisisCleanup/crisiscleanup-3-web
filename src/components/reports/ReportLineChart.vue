<template>
  <div :id="id" class="relative"></div>
</template>

<script lang="ts">
import { onMounted } from 'vue';
import * as d3 from 'd3';
import moment from 'moment';

export default defineComponent({
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
    displayOptions: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const { t } = useI18n();
    let formatter = new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    });
    if (props.displayOptions.number_format === 'currency') {
      formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      });
    }

    if (props.displayOptions.number_format === 'percentage') {
      formatter = new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      });
    }

    onMounted(() => {
      const { data } = props;
      //
      //  Multi-line Chart
      //
      function d3LineChart2(data1) {
        const margin = { top: 150, right: 100, bottom: 200, left: 100 };
        const width = 1200 - margin.left - margin.right;
        const height = 700 - margin.top - margin.bottom;

        const parseDate = d3.timeParse('%Y-%m-%d');

        const x = d3.scaleTime().range([0, width]);

        const y = d3.scaleLinear().range([height, 0]);

        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat('%B %d, %Y'));

        const yAxis = d3.axisLeft(y);

        const bisect = d3.bisector(function (d) {
          return d.date;
        }).left;

        const line = d3
          .line()
          .curve(d3.curveBasis)
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

          for (const d of chartData) {
            d[props.groupBy] = parseDate(d[props.groupBy]);
          }

          chartData.sort(function (a, b) {
            return a[props.groupBy] - b[props.groupBy];
          });

          const metricsData = color.domain().map(function (name) {
            return {
              name,
              values: chartData.map(function (d) {
                return {
                  date: d[props.groupBy],
                  amount: Number(d[name]),
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
            .attr('transform', 'rotate(45)')
            .style('text-anchor', 'start');

          svg.append('g').attr('class', 'y axis').call(yAxis);

          svg
            .append('text')
            .attr('class', 'x label')
            .attr('text-anchor', 'start')
            .attr('x', width / 2)
            .attr('y', height + margin.bottom / 2)
            .text(t(props.displayOptions.axes.x.name));

          svg
            .append('text')
            .attr('class', 'y label')
            .attr('text-anchor', 'start')
            .attr('y', -margin.left / 2 - 30)
            .attr('x', -height / 2 - 80)
            .attr('dy', '.75em')
            .attr('transform', 'rotate(-90)')
            .text(t(props.displayOptions.axes.y.name));

          svg
            .append('text')
            .attr('x', width / 2)
            .attr('y', 0 - margin.top / 2)
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

          //* * Hover line & invisible rect
          const hoverLineGroup = svg.append('g').attr('class', 'hover-line');

          //* * Add the line to the group
          const hoverLine = hoverLineGroup
            .append('line')
            .attr('id', 'hover-line')
            .attr('x1', 0)
            .attr('x2', 0)
            .attr('y1', 0)
            .attr('y2', height)
            .style('stroke-opacity', 0)
            .style('stroke', 'black');

          const toolTip = d3
            .select(`#${props.id}`)
            .append('div')
            .style('visibility', 'hidden')
            .attr('class', 'chart-tooltip');

          function mousemove(e) {
            const mouse = d3.pointer(e);
            const mouseX = mouse[0];
            const mouseY = mouse[1];
            const timeStamp = x.invert(mouseX);

            const i = bisect(metricsData[0].values, timeStamp);

            let displaytext = '';
            for (const metric of metricsData) {
              displaytext += `${t(
                `reports.${props.reportName}.${metric.name}`,
              )}: ${formatter.format(metric.values[i].amount)}\n`;
            }

            hoverLine
              .attr('x1', mouseX)
              .attr('x2', mouseX)
              .style('stroke-opacity', 1);

            toolTip
              .style('visibility', 'visible')
              .style('left', `${mouseX + 60}px`)
              .style('top', `${mouseY}px`)
              .text(
                `${t(`reports.${props.reportName}.${props.groupBy}`)} ${moment(
                  timeStamp,
                ).format('ddd MMMM Do YYYY')}\n${displaytext}`,
              );
          }

          function mouseout() {
            hoverLine.style('stroke-opacity', 0);
            toolTip.style('visibility', 'hidden');
          }

          svg
            .append('rect')
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .style('cursor', 'pointer')
            .attr('width', width)
            .attr('height', height)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);

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
            .attr('stroke-width', 1.5)
            .style('fill', 'none')
            .style('stroke', function (d) {
              return props
                .displayOptions.colors[`reports.${props.reportName}.${d.name}`];
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
              return t(`reports.${props.reportName}.${d.name}`);
            });
        }

        render(data1);
      }

      d3LineChart2(data);
    });
  },
});
</script>

<style>
.chart-tooltip {
  @apply border bg-white p-2 max-w-lg absolute z-50 pointer-events-none shadow whitespace-pre-wrap;
}
</style>
