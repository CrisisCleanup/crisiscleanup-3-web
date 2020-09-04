<template>
  <TitledCard :loading="loading" title="~~Daily Phone Calls and New Cases">
    <LineChart :chartdata="chartData" :options="options" />
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
          },
          {
            label: 'Missed Calls',
            backgroundColor: '#dadada',
            barPercentage: 0.1,
            stack: 'one',
            data: this.missedDataset,
          },
          {
            label: 'Phone Calls',
            backgroundColor: '#009bff',
            barPercentage: 0.1,
            borderWidth: 2,
            stack: 'one',
            data: this.callsDataset,
          },
        ],
      };
    },
  },
  data() {
    const now = new Date();
    const minBound = now.setMonth(now.getMonth() - 3);
    return {
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ticks: {
          min: minBound,
          max: now,
        },
        scales: {
          xAxes: [
            {
              type: 'time',
              distribution: 'series',
              bounds: 'data',
              time: {
                unit: 'day',
                stepSize: 2,
              },
              stacked: true,
              gridLines: {
                display: false,
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
