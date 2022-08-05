<template>
  <div :id="id"></div>
</template>

<script>
import { onMounted } from '@vue/composition-api';
import * as d3 from 'd3';

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
    titleKey: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    onMounted(() => {
      const { data } = props;

      const width = 80;
      const height = 80;
      const padding = 5;
      const opacity = 0.8;

      const radius = Math.min(width - padding, height - padding) / 2;
      const color = d3.scaleOrdinal(d3.schemeCategory10);

      const svg = d3
        .select(`#${props.id}`)
        .append('svg')
        .attr('class', 'pie')
        .attr('width', width)
        .attr('height', height);

      const g = svg
        .append('g')
        .attr('transform', `translate(${width / 2},${height / 2})`);

      const arc = d3.arc().innerRadius(0).outerRadius(radius);

      const pie = d3
        .pie()
        .value(function (d) {
          return d.value;
        })
        .sort(null);

      g.selectAll('path')
        .data(pie(data))
        .enter()
        .append('g')
        .append('path')
        .attr('d', arc)
        .attr('fill', (d, i) => color(i))
        .style('opacity', opacity)
        .style('stroke', 'white');

      const title = d3
        .select(`#${props.id}`)
        .append('div')
        .attr('class', 'title');

      title.append('div').attr('class', 'name').text(props.titleKey);

      const legend = d3
        .select(`#${props.id}`)
        .append('div')
        .attr('class', 'legend')
        .style('margin-top', '30px');

      const keys = legend
        .selectAll('.key')
        .data(data)
        .enter()
        .append('div')
        .attr('class', 'key')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('margin-right', '20px');

      keys
        .append('div')
        .attr('class', 'symbol')
        .style('height', '10px')
        .style('width', '10px')
        .style('margin', '5px 5px')
        .style('background-color', (d, i) => color(i));

      keys
        .append('div')
        .attr('class', 'name')
        .text((d) => `${d.name} (${d.value})`);

      keys.exit().remove();
    });
  },
};
</script>

<style scoped></style>
