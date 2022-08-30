<template>
  <div :id="id" class="relative"></div>
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

        const bisect = d3.bisector(function (d) {
          return d.date;
        }).left;

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
            .attr('transform', 'rotate(45)')
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
            .attr('class', 'chart-tooltip');

          // What happens when the mouse move -> show the annotations at the right positions.
          function mouseover() {
            // focus.style('opacity', 1);
            // focusText.style('opacity', 1);
          }

          function mousemove(e) {
            const mouse = d3.pointer(e);
            const mouseX = mouse[0];
            const mouseY = mouse[1];
            const timeStamp = x.invert(mouseX);

            const i = bisect(metricsData[0].values, timeStamp);

            let displaytext = '';
            metricsData.forEach((metric) => {
              displaytext += `${$t(
                `reports.${props.reportName}.${metric.name}`,
              )}: ${metric.values[i].amount}\n`;
            });

            hoverLine
              .attr('x1', mouseX)
              .attr('x2', mouseX)
              .style('stroke-opacity', 1);

            toolTip
              .style('visibility', 'visible')
              .style('left', `${mouseX + 60}px`)
              .style('top', `${mouseY}px`)
              .text(`${timeStamp}\n${displaytext}`);

            // focus.attr('cx', x(selectedData.x)).attr('cy', y(selectedData.y));
            // focusText
            //   .html(`x:${selectedData.x}  -  ` + `y:${selectedData.y}`)
            //   .attr('x', x(selectedData.x) + 15)
            //   .attr('y', y(selectedData.y));
          }
          function mouseout() {
            hoverLine.style('stroke-opacity', 0);
            toolTip.style('visibility', 'hidden');

            // focus.style('opacity', 0);
            // focusText.style('opacity', 0);
          }

          svg
            .append('rect')
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .style('cursor', 'pointer')
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', mouseover)
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

<style>
.chart-tooltip {
  line-height: 1.5;
  visibility: hidden;
  padding: 10px;
  position: absolute;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  font-size: 13px;
  text-align: left;
  pointer-events: none;
  z-index: 1060;
  -moz-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
}

.chart-tooltip > h4 {
  font-size: 16px;
}

.chart-tooltip > p {
  padding: 10px 0;
  font-weight: 400;
}

.chart-tooltip > p > span {
  float: right;
}

.chart-tooltip > p > span > em {
  font-size: 85%;
}

.chart-tooltip > p:last-child {
  padding-bottom: 0;
}
</style>
