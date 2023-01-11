<template>
  <div :id="id" ref="chart"></div>
</template>

<script>
import { onMounted } from 'vue';
import * as d3 from 'd3';
import { sumBy } from 'lodash';

export default {
  name: 'ReportPieChart',
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    id: {
      type: String,
      default: '',
    },
    reportName: {
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
    let formatter = new Intl.NumberFormat('en-US');
    const chart = ref(null);
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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    function renderPie(data, svg, index, toolTip) {
      const width = 100;
      const height = 80;
      const padding = 5;
      const opacity = 0.8;

      const g = svg
        .append('g')
        .attr(
          'transform',
          `translate(${(index % 3) * width * 5.5 + width},${
            height * Math.ceil((index + 1) / 3) +
            Math.floor(index / 3) * (height * 2)
          })`,
        )
        .style('margin-left', `${index * width}px`);

      const radius = Math.min(width - padding, height - padding) / 2;

      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      const pie = d3
        .pie()
        .value(function (d) {
          return d.value;
        })
        .sort(null);

      g.selectAll('path')
        .data(pie(data.data))
        .enter()
        .append('g')
        .append('path')
        .attr('d', arc)
        .attr('fill', (d) => {
          return props.displayOptions.colors[
            `reports.${props.reportName}.${d.data.name}`
          ];
        })
        .style('opacity', opacity)
        .style('stroke', 'white')
        .style('cursor', 'pointer')
        .attr('transform', `translate(${width / 2},${0})`)
        .on('mouseover', function (e, d) {
          // Get this bar's x/y values, then augment for the tooltip
          let displaytext = '';
          displaytext += `${t(
            `reports.${props.reportName}.${d.data.name}`,
          )}: ${formatter.format(d.data.value)}\n`;

          toolTip
            .style('visibility', 'visible')
            .style('left', `${e.pageX}px`)
            .style('top', `${e.pageY}px`)
            .text(`${displaytext}\n`);
        })
        // hide tooltip
        .on('mouseout', function () {
          toolTip.style('visibility', 'hidden');
        });

      g.append('g')
        .attr('transform', `translate(${-width},${height})`)
        .append('text')
        .text(t(`reports.${props.reportName}.${data.titleKey}`))
        .attr('class', 'title');

      const legend = g
        .append('g')
        .attr('transform', `translate(${-width * 2.8},${-height / 1.5})`)
        .selectAll('.legend')
        .data(
          data.data.map(function (d) {
            return d;
          }),
        )
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) {
          return `translate(${width},${height * 2 + i * 20})`;
        })
        .style('opacity', '0');

      legend
        .append('text')
        .attr('x', width + 5)
        .attr('y', 9)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .text(function (d) {
          return `${t(
            `reports.${props.reportName}.${d.name}`,
          )} (${formatter.format(d.value)})`;
        });

      legend
        .append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', function (d) {
          return props
            .displayOptions.colors[`reports.${props.reportName}.${d.name}`];
        });

      legend
        .transition()
        .duration(500)
        .delay(function (d, i) {
          return 1300 + 100 * i;
        })
        .style('opacity', '1');
    }

    onMounted(() => {
      const data = props.data.filter((entry) => {
        const totalChartData = sumBy(entry.data, (d) => d.value);
        return totalChartData > 0;
      });
      const width = 80 * 6 * 3;
      const height = 260 * Math.ceil(data.length / 3);
      const svg = d3
        .select(chart.value)
        ?.append('svg')
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text(t(`reports.${props.reportName}`));

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '15px')
        .html(t(`reports.paid_for_statement`));

      const toolTip = d3
        .select(chart.value)
        ?.append('div')
        .attr('class', 'chart-tooltip');

      for (const [index, pieData] of data.entries()) {
        renderPie(pieData, svg, index, toolTip);
      }
      renderPie(data);
    });

    return {
      chart,
    };
  },
};
</script>

<style scoped></style>
