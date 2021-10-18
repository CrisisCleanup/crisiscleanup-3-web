<template>
  <Loader
    :loading="loading"
    class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
  >
    <template #content>
      <form-select
        v-model="style"
        :options="['stacked', 'split']"
        select-classes="bg-white border w-64 m-2"
        class="mb-2"
        :placeholder="$t('~~Chart Style')"
      />

      <template v-if="style === 'split'">
        <div v-for="chart in chartData" :key="chart.name">
          <div>{{ chart.name }}</div>
          <BarChart
            v-if="chart.options"
            :chart-data="chart.data"
            :options="chart.options"
            class="h-84"
          />
        </div>
      </template>

      <BarChart
        v-if="chartDataStacked.options && style === 'stacked'"
        :chart-data="chartDataStacked.data"
        :options="chartDataStacked.options"
        class="h-144"
      />
    </template>
  </Loader>
</template>

<script>
import Loader from '@/components/Loader';
import BarChart from '@/components/charts/BarChart';
import { stringToColor } from '@/utils/colors';
export default {
  name: 'AdminCosts',
  components: { BarChart, Loader },
  data() {
    return {
      costs: {},
      loading: false,
      style: 'stacked',
    };
  },
  async mounted() {
    this.loading = true;
    await this.reloadCosts();
    this.loading = false;
  },
  methods: {
    async reloadCosts() {
      const { data } = await this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/admins/costs`,
      );
      this.costs = data;
    },
    getChartDataData(name, results) {
      const resultsPer = results.ResultsByTime;
      const options = {
        tooltips: {
          displayColors: true,
          callbacks: {
            mode: 'x',
          },
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              offset: true,
              distribution: 'series',
              bounds: 'data',
              time: {
                unit: 'day',
                stepSize: 1,
                tooltipFormat: 'YYYY-MM-DD',
                displayFormats: {
                  day: 'D',
                },
              },
              ticks: {
                source: 'data',
              },
              stacked: true,
              gridLines: {
                display: false,
              },
              categoryPercentage: 1.0,
              barPercentage: 1.0,
            },
          ],
          yAxes: [
            {
              stacked: true,
              bounds: 'data',
              min: 0,
              max: 5000,
              ticks: {
                beginAtZero: true,
              },
              type: 'linear',
            },
          ],
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom' },
      };
      const amounts = resultsPer.map((r) =>
        Number(r.Total.AmortizedCost.Amount).toFixed(2),
      );
      const data = {
        labels: resultsPer.map((r) => r.TimePeriod.End),
        datasets: [
          {
            data: amounts,
            backgroundColor: stringToColor(name),
            borderColor: '#dadada',
            borderWidth: 0.25,
            barPercentage: 0.3,
          },
        ],
      };
      return { name, options, data };
    },
    getChartDataDataStacked() {
      const options = {
        tooltips: {
          displayColors: true,
          callbacks: {
            mode: 'label',
            footer(items, data) {
              const { datasets } = data;
              const total = datasets.reduce(
                (a, b) => a + Number(b.data[items[0].index]),
                0,
              );
              return `Total: ${total.toFixed(2)}`;
            },
          },
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              offset: true,
              distribution: 'series',
              bounds: 'data',
              time: {
                unit: 'day',
                stepSize: 1,
                tooltipFormat: 'YYYY-MM-DD',
                displayFormats: {
                  day: 'D',
                },
              },
              ticks: {
                source: 'data',
              },
              stacked: true,
              gridLines: {
                display: false,
              },
              categoryPercentage: 1.0,
              barPercentage: 1.0,
            },
          ],
          yAxes: [
            {
              stacked: true,
              bounds: 'data',
              min: 0,
              max: 5000,
              ticks: {
                beginAtZero: true,
              },
              type: 'linear',
            },
          ],
        },
        responsive: true,
        maintainAspectRatio: false,
        legend: { position: 'bottom' },
      };
      const data = {
        labels: this.costs.developer.ResultsByTime.map((r) => r.TimePeriod.End),
        datasets: Object.entries(this.costs).map(([key, value]) => {
          return {
            data: value.ResultsByTime.map((r) =>
              Number(r.Total.AmortizedCost.Amount).toFixed(2),
            ),
            backgroundColor: stringToColor(key),
            borderColor: '#dadada',
            borderWidth: 0.25,
            barPercentage: 0.3,
            label: key,
          };
        }),
      };
      return { options, data };
    },
  },
  computed: {
    chartData() {
      return Object.keys(this.costs).map((key) =>
        this.getChartDataData(key, this.costs[key]),
      );
    },
    chartDataStacked() {
      return this.getChartDataDataStacked();
    },
  },
};
</script>

<style scoped></style>
