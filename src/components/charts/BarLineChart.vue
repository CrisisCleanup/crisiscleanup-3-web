<script>
import { Line, Bar, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;
export default {
  mixins: [Line, Bar, reactiveProp],
  props: ['chartdata', 'options'],
  mounted() {
    this.renderChart(this.chartdata, this.options);
  },
};
</script>
