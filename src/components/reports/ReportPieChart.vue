<template>
  <div :id="id"></div>
</template>

<script>
import { onMounted } from '@vue/composition-api';
import * as d3 from 'd3';
import usei18n from '@/use/usei18n';

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
  },
  setup(props) {
    const { $t } = usei18n();

    function renderPie(data, svg, index) {
      const width = 80;
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
      const color = d3.scaleOrdinal(d3.schemeCategory10);

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
        .attr('fill', (d, i) => color(i))
        .style('opacity', opacity)
        .style('stroke', 'white')
        .attr('transform', `translate(${width / 2},${0})`);

      g.append('g')
        .attr('transform', `translate(${-width},${height})`)
        .append('text')
        .text($t(`reports.${props.reportName}.${data.titleKey}`))
        .attr('class', 'title');

      const legend = g
        .append('g')
        .attr('transform', `translate(${-width * 2.8},${-height / 1.5})`)
        .selectAll('.legend')
        .data(
          data.data.map(function (d) {
            return `${$t(
              `reports.${props.reportName}.${d.name}`,
            )} (${d.value})`;
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
          return d;
        });

      legend
        .append('rect')
        .attr('x', width - 18)
        .attr('width', 18)
        .attr('height', 18)
        .style('fill', function (d, i) {
          return color(i);
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
      const { data } = props;
      const width = 80 * 6 * 3;
      const height = 250 * Math.ceil(data.length / 3);
      const svg = d3
        .select(`#${props.id}`)
        .append('svg')
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .style('font-size', '20px')
        .text($t(`reports.${props.reportName}`));

      data.forEach((pieData, index) => renderPie(pieData, svg, index));
      renderPie(data);
    });
  },
};
</script>

<style scoped></style>
