<template>
  <div :id="id"></div>
</template>

<script>
import { onMounted } from 'vue';
import * as d3 from 'd3';

export default {
  name: 'ReportStackedBarChart',
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
  },
  setup(props) {
    const { t } = useI18n();

    onMounted(() => {
      const groupData = props.data;

      const margin = { top: 40, right: 20, bottom: 100, left: 40 };
      const width = 1000 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      const x0 = d3.scaleBand().rangeRound([0, width], 0.5);
      const x1 = d3.scaleBand();
      const y = d3.scaleLinear().rangeRound([height, 0]);

      const xAxis = d3
        .axisBottom()
        .scale(x0)
        .tickFormat(d3.timeFormat('%B %d, %Y'))
        .tickValues(groupData.map((d) => d.key));

      const yAxis = d3.axisLeft().scale(y);

      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const svg = d3
        .select(`#${props.id}`)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const categoriesNames = groupData.map(function (d) {
        return d.key;
      });
      const rateNames = groupData[0].values.map(function (d) {
        return d.grpName;
      });

      x0.domain(categoriesNames);
      x1.domain(rateNames).rangeRound([0, x0.bandwidth()]);
      y.domain([
        0,
        d3.max(groupData, function (key) {
          return d3.max(key.values, function (d) {
            return d.grpValue;
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
        .style('opacity', '0')
        .call(yAxis)
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style('font-weight', 'bold')
        .text('Value');

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 0 - margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text(t(`reports.${props.reportName}`));

      svg
        .select('.y')
        .transition()
        .duration(500)
        .delay(1300)
        .style('opacity', '1');

      const slice = svg
        .selectAll('.slice')
        .data(groupData)
        .enter()
        .append('g')
        .attr('class', 'g')
        .attr('transform', function (d) {
          return `translate(${x0(d.key)},0)`;
        });

      slice
        .selectAll('rect')
        .data(function (d) {
          return d.values;
        })
        .enter()
        .append('rect')
        .attr('width', x1.bandwidth())
        .attr('x', function (d) {
          return x1(d.grpName);
        })
        .style('fill', function (d) {
          return color(t(`reports.${props.reportName}.${d.grpName}`));
        })
        .attr('y', function () {
          return y(0);
        })
        .attr('height', function () {
          return height - y(0);
        });

      slice
        .selectAll('rect')
        .transition()
        .delay(function () {
          return Math.random() * 1000;
        })
        .duration(1000)
        .attr('y', function (d) {
          return y(d.grpValue);
        })
        .attr('height', function (d) {
          return height - y(d.grpValue);
        });

      // Legend
      const legend = svg
        .selectAll('.legend')
        .data(
          groupData[0].values
            .map(function (d) {
              return t(`reports.${props.reportName}.${d.grpName}`);
            })
            .reverse(),
        )
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
          return `translate(0,${i * 20})`;
        })
        .style('opacity', '0');

      legend
        .append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', function (d) {
          return color(d);
        });

      legend
        .append('text')
        .attr('x', width - 24)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function (d) {
          return d;
        });

      legend
        .transition()
        .duration(500)
        .delay(function (d, i) {
          return 1300 + 100 * i;
        })
        .style('opacity', '1');
    });
  },
};
</script>

<style scoped></style>
