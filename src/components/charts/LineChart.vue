<template>
  <div class="chart-container">
    <canvas ref="chart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  props: {
    chartData: {
      type: null,
      default: null,
    },
    options: {
      type: null,
      default: null,
    },
  },
  mounted() {
    const ctx = this.$refs.chart;
    return new Chart(ctx, {
      type: 'line',
      data: this.chartData,
      options: this.options,
    });
  },
};
</script>

<style>
.chart-container {
  width: 900px;
  margin: auto;
}
</style>
