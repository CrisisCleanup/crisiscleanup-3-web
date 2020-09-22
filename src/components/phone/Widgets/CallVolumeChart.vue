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
import { theme } from '@/../tailwind.config';

export default {
  name: 'CallVolumeChart',
  components: { TitledCard, LineChart },
  props: ['callsDataset', 'missedDataset', 'casesDataset', 'loading'],
  computed: {
    chartData() {
      return {
        datasets: [
          {
            label: 'New Cases',
            data: this.casesDataset,
            type: 'line',
            fill: false,
            borderColor: '#dadada',
            backgroundColor: '#dadada',
            borderWidth: 2,
            borderCapStyle: 'square',
            lineTension: 0,
            borderJoinStyle: 'miter',
            pointRadius: 0,
            hitRadius: 4,
          },
          {
            label: 'Missed Calls',
            backgroundColor: '#F35154',
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
    return {
      options: {
        cornerRadius: 20,
        responsive: true,
        maintainAspectRatio: false,
        ticks: {
          beginAtZero: false,
        },
        legend: {
          align: 'end',
          fontFamily: theme.extend.fontFamily.sans.join(','),
          fontColor: theme.extend.colors['crisiscleanup-dark']['300'],
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
                tooltipFormat: 'dddd, MMMM Do',
              },
              ticks: {
                source: 'data',
              },
              stacked: true,
              gridLines: {
                display: false,
              },
              scaleLabel: {
                fontFamily: theme.extend.fontFamily.sans.join(','),
                fontColor: theme.extend.colors['crisiscleanup-dark']['300'],
              },
            },
          ],
          yAxes: [
            {
              stacked: false,
              scaleLabel: {
                fontFamily: theme.extend.fontFamily.sans.join(','),
                fontColor: theme.extend.colors['crisiscleanup-dark']['300'],
              },
            },
          ],
        },
      },
    };
  },
};
</script>

<style scoped></style>
