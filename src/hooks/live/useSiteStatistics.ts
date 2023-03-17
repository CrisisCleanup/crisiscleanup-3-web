import axios from 'axios';
import moment from 'moment';
import type { Ref } from 'vue';
import { getQueryString } from '@/utils/urls';
import { i18n } from '@/main';
import type { SiteStatistic } from '@/hooks/live/types';
import type Organization from '@/models/Organization';

export default function useSiteStatistics(
  queryFilter: Record<string, any>,
  organizations: Ref<Organization[]>,
) {
  const statsInterval = ref<ReturnType<typeof setInterval> | null>(null);
  const currentSiteStats = ref<SiteStatistic[]>([]);
  const currentEngagement = ref(0);
  const circularBarplotData = ref([]);
  const barChartData = ref([]);
  const totalCasesChartData = ref<Record<string, any>[]>([]);
  const mapStatistics = ref<Record<string, any>[]>([]);

  function formatStatValue(value: string | number) {
    return Number(value).toFixed(0);
  }

  function countUpStats() {
    for (const stat of currentSiteStats.value) {
      stat.value += stat.change_per_second;
    }
  }

  async function fetchEngagementData() {
    const { start_date, end_date, incident } = queryFilter.value;
    const params = {
      start_date: start_date.format('YYYY-MM-DD'),
      end_date: end_date.format('YYYY-MM-DD'),
    };
    if (incident) {
      params.incident = incident;
    }
    const queryString = getQueryString(params);

    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_API_BASE_URL
      }/reports_data/pp_engagement?${queryString}`,
    );
    if (response.data.length > 0) {
      currentEngagement.value =
        (response.data[0].three_day_velocity || 0) * 100;
    }
  }
  async function fetchSiteStatistics() {
    if (statsInterval.value) {
      clearInterval(statsInterval.value);
    }
    statsInterval.value = null;

    const { incident } = queryFilter.value;
    const params = {};
    if (incident) {
      params.incident = incident;
    }
    const queryString = getQueryString(params);

    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_API_BASE_URL
      }/reports_data/pp_site_stats?${queryString}`,
    );
    if (response.data.length > 0) {
      currentSiteStats.value = response.data;
      statsInterval.value = setInterval(countUpStats, 1000);
    }
  }

  async function fetchCircularBarplotData(date = moment(), interval = 60) {
    const { incident } = queryFilter.value;
    circularBarplotData.value = [];
    circularBarplotData.value = [...circularBarplotData.value];
    const d = date.format('YYYY-MM-DD');

    const params = {
      date: d,
      interval,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    if (incident) {
      params.incident = incident;
    }
    const queryString = getQueryString(params);
    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_API_BASE_URL
      }/reports_data/daily_calls?${queryString}`,
    );
    circularBarplotData.value = response.data;
    circularBarplotData.value = [...circularBarplotData.value];
  }

  async function getCompletionRateData() {
    const { start_date, end_date, incident } = queryFilter.value;
    const params = {
      start_date: start_date.format('YYYY-MM-DD'),
      end_date: end_date.format('YYYY-MM-DD'),
    };
    if (incident) {
      params.incident = incident;
    }
    const queryString = getQueryString(params);

    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_API_BASE_URL
      }/reports_data/completion_rate?${queryString}`,
    );
    const chart = response.data;

    // const options = {
    //   tooltips: {
    //     displayColors: true,
    //     callbacks: {
    //       mode: 'x',
    //     },
    //   },
    //   scales: {
    //     xAxes: [
    //       {
    //         type: 'time',
    //         offset: true,
    //         distribution: 'series',
    //         bounds: 'data',
    //         time: {
    //           unit: 'day',
    //           stepSize: 1,
    //           tooltipFormat: 'YYYY-MM-DD',
    //           displayFormats: {
    //             day: 'D',
    //           },
    //         },
    //         ticks: {
    //           source: 'data',
    //         },
    //         stacked: true,
    //         gridLines: {
    //           display: false,
    //         },
    //         categoryPercentage: 1,
    //         barPercentage: 1,
    //       },
    //     ],
    //     yAxes: [
    //       {
    //         stacked: true,
    //         ticks: {
    //           beginAtZero: true,
    //         },
    //         type: 'linear',
    //       },
    //     ],
    //   },
    //   responsive: true,
    //   maintainAspectRatio: false,
    //   legend: { position: 'bottom' },
    // };
    // const data = {
    //   labels: chart.labels,
    //   datasets: [
    //     {
    //       ...chart.datasets[0],
    //       backgroundColor: 'green',
    //       borderColor: '#dadada',
    //       borderWidth: 0.25,
    //       barPercentage: 0.3,
    //     },
    //     {
    //       ...chart.datasets[1],
    //       backgroundColor: 'red',
    //       borderWidth: 0.25,
    //       borderColor: '#dadada',
    //       barPercentage: 0.3,
    //     },
    //   ],
    // };
    // return { options, data };
    // this.charts.completion.options = options;
    // this.charts.completion.data = data;

    barChartData.value = chart.labels.map((item: any, index: number) => {
      return {
        group: item,
        newCases: chart.datasets[0].data[index],
        closedCases: chart.datasets[1].data[index],
      };
    });
  }

  async function getIncidentStats() {
    const { start_date, incident } = queryFilter.value;
    const params = {
      start_date: start_date.format('YYYY-MM-DD'),
      end_date: moment().format('YYYY-MM-DD'),
    };
    if (incident) {
      params.incident = incident;
    }
    const queryString = getQueryString(params);

    const response = await axios.get(
      `${
        import.meta.env.VITE_APP_API_BASE_URL
      }/reports_data/worksite_statistics?${queryString}`,
    );
    const incidentStats = response.data;
    const mapStatisticsColors = [
      '#ffffff',
      '#d0021b',
      '#fab92e',
      '#f0f032',
      '#0054bb',
      '#0fa355',
      '#d3d3d3',
    ];
    mapStatistics.value = [
      {
        name: 'All Cases',
        color: mapStatisticsColors[0],
        count: incidentStats.all.total,
        style: `border-color: ${mapStatisticsColors[0]}`,
        title: i18n.global.t('pewPew.all_cases'),
      },
      {
        name: 'Unclaimed',
        color: mapStatisticsColors[1],
        count: incidentStats.unclaimed.total,
        style: `border-color: ${mapStatisticsColors[1]}`,
        title: i18n.global.t('pewPew.unclaimed'),
      },
      {
        name: 'Claimed',
        color: mapStatisticsColors[2],
        count: incidentStats.claimed.total,
        style: `border-color: ${mapStatisticsColors[2]}`,
        title: i18n.global.t('pewPew.claimed'),
      },
      {
        name: 'In Progress',
        color: mapStatisticsColors[3],
        count: incidentStats.assigned.total,
        style: `border-color: ${mapStatisticsColors[3]}`,
        title: i18n.global.t('pewPew.in_progress'),
      },
      {
        name: 'Partly Done',
        color: mapStatisticsColors[4],
        count: incidentStats.partial.total,
        style: `border-color: ${mapStatisticsColors[4]}`,
        title: i18n.global.t('pewPew.partly_done'),
      },
      {
        name: 'Closed',
        color: mapStatisticsColors[5],
        count: incidentStats.closed.total,
        style: `border-color: ${mapStatisticsColors[5]}`,
        title: i18n.global.t('pewPew.closed'),
      },
      {
        name: 'Overdue',
        color: mapStatisticsColors[6],
        count: incidentStats.overdue.total,
        style: `border: none`,
        title: i18n.global.t('pewPew.overdue'),
      },
      {
        name: 'Total Orgs',
        color: mapStatisticsColors[6],
        count: organizations.value.length,
        style: `border: none`,
        title: i18n.global.t('pewPew.total_orgs'),
      },
      {
        name: 'Counties Parishes',
        color: mapStatisticsColors[6],
        count: 0,
        style: `border: none`,
        title: i18n.global.t('pewPew.counties_parishes'),
      },
      {
        name: 'Volunteers',
        color: mapStatisticsColors[6],
        count: 0,
        style: `border: none`,
        title: i18n.global.t('pewPew.volunteers'),
      },
      {
        name: 'Households',
        color: mapStatisticsColors[6],
        count: 0,
        style: `border: none`,
        title: i18n.global.t('pewPew.households'),
      },
    ];

    totalCasesChartData.value = mapStatistics.value.filter(
      (stat) => stat.name !== 'All Cases',
    );
  }

  function loadData() {
    fetchSiteStatistics().then(null);
    fetchEngagementData().then(null);
    fetchCircularBarplotData().then(null);
    getCompletionRateData().then(null);
    getIncidentStats().then(null);
  }

  loadData();

  watch(
    () => queryFilter.value,
    (value) => {
      loadData();
    },
  );

  return {
    currentSiteStats,
    currentEngagement,
    circularBarplotData,
    barChartData,
    totalCasesChartData,
    mapStatistics,
    formatStatValue,
  };
}
