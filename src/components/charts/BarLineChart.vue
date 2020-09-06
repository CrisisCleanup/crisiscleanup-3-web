<script>
// eslint-disable-next-line no-unused-vars
import Chart from 'chart.js';
import { Line, Bar, mixins } from 'vue-chartjs';
import '@/assets/vendor/js/Chart.roundedBarCharts.min';
const { reactiveProp } = mixins;
export default {
  mixins: [Line, Bar, reactiveProp],
  props: ['chartdata', 'options'],
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
