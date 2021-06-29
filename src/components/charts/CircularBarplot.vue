<template>
  <div class="chart">
    <div class="chart__circular-barplot" id="circular-barplot"></div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  props: {
    chartData: {
      type: Object,
      required: false,
      default: () => ({}),
    },
  },

  mounted() {
    console.log(d3);

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 460 - margin.left - margin.right;
    const height = 460 - margin.top - margin.bottom;
    const innerRadius = 80;
    const outerRadius = Math.min(width, height) / 2; // the outerRadius goes from the middle of the SVG area to the border

    // append the svg object to the body of the page
    const svg = d3
      .select('#circular-barplot')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2 + 100})`); // Add 100 on Y translation, cause upper bars are longer

    d3.csv(
      'https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/7_OneCatOneNum.csv',
    ).then(function (data) {
      // X scale
      const x = d3
        .scaleBand()
        .range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0) // This does nothing ?
        .domain(data.map((d) => d.Country)); // The domain of the X axis is the list of states.

      // Y scale
      const y = d3
        .scaleRadial()
        .range([innerRadius, outerRadius]) // Domain will be define later.
        .domain([0, 10000]); // Domain of Y is from 0 to the max seen in the data

      // Add bars
      svg
        .append('g')
        .selectAll('path')
        .data(data)
        .join('path')
        .attr('fill', '#69b3a2')
        .on('mouseover', function () {
          d3.select(this)
            .style('filter', 'brightness(70%)')
            .style('transform', 'scale(1.05)')
            .style('transition', 'all 300ms');
        })
        .on('mouseout', function () {
          d3.select(this)
            .style('filter', 'brightness(100%)')
            .style('transform', 'scale(1)')
            .style('transition', 'all 300ms');
        })
        .attr(
          'd',
          d3
            .arc() // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius((d) => y(d.Value))
            .startAngle((d) => x(d.Country))
            .endAngle((d) => x(d.Country) + x.bandwidth())
            .padAngle(0.01)
            .padRadius(innerRadius),
        );
    });
  },
};
</script>

<style scoped lang="postcss">
.chart {
  @apply flex justify-center items-center;
  &__circular-barplot {
  }
}
</style>
