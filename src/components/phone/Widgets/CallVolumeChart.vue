<template>
  <TitledCard
    :loading="loading"
    title="~~Daily Phone Calls and New Cases"
    class="h-full"
  >
    <div class="h-full">
      <LineChart :chartdata="chartData" :options="options" />
    </div>
  </TitledCard>
</template>

<script>
import TitledCard from '@/components/cards/TitledCard.vue';
import LineChart from '@/components/charts/BarLineChart.vue';

export default {
  name: 'CallVolumeChart',
  components: { TitledCard, LineChart },
  props: ['callsDataset', 'missedDataset', 'casesDataset', 'loading'],
  computed: {
    chartData() {
      return {
        labels: ['July', 'Aug', 'Sept'],
        datasets: [
          {
            label: 'New Cases',
            data: this.casesDataset,
            type: 'line',
            fill: false,
            backgroundColor: '#F35154',
            borderColor: '#F35154',
            borderWidth: 2,
            borderCapStyle: 'square',
            lineTension: 0,
            borderJoinStyle: 'miter',
            pointRadius: 0,
            hitRadius: 4,
          },
          {
            label: 'Missed Calls',
            backgroundColor: '#dadada',
            barPercentage: 0.4,
            stack: 'one',
            data: this.missedDataset,
            borderWidth: 0,
          },
          {
            label: 'Phone Calls',
            backgroundColor: '#009BFF',
            barPercentage: 0.4,
            borderWidth: 0,
            stack: 'one',
            data: this.callsDataset,
          },
        ],
      };
    },
  },
  data() {
    const now = new Date();
    const maxBound = now.setDate(now.getDate() - 1);
    return {
      options: {
        cornerRadius: 20,
        responsive: true,
        maintainAspectRatio: false,
        ticks: {
          max: maxBound,
          beginAtZero: true,
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              distribution: 'series',
              bounds: 'data',
              time: {
                unit: 'day',
              },
              stacked: true,
              gridLines: {
                display: false,
              },
              ticks: {
                beginAtZero: true,
              },
            },
          ],
          yAxes: [
            {
              stacked: false,
            },
          ],
        },
      },
    };
  },
};
</script>

<style scoped></style>
