<template>
  <div class="reports">
    <ReportFilters
      :inputs="report.inputs"
      @onFilter="runReport"
      @onCSV="runCsvReport"
    />
    <Loader
      v-if="loading"
      class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
    ></Loader>
    <div
      v-else
      v-for="[key, value] in Object.entries(transformedData)"
      :key="key"
      class="items-center justify-center my-10 ml-8"
    >
      <base-button
        :action="() => downloadWidgetCsv(key)"
        :text="$t('~~Download')"
      />
      <base-button
        :action="() => addWidgetToDashboard(key, currentFilters)"
        :text="$t('~~Add to dashboard')"
      />
      <ReportWidget
        :current-filters="currentFilters"
        :widget-key="key"
        :value="value"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from '@vue/composition-api';
import { useRouter, useState } from '@u3u/vue-hooks';
import useHttp from '@/use/useHttp';
import ReportPieChart from '@/components/reports/ReportPieChart.vue';
import ReportLineChart from '@/components/reports/ReportLineChart.vue';
import ReportStackedBarChart from '@/components/reports/ReportStackedBarChart.vue';
import ReportFilters from '@/components/reports/ReportFilters.vue';
import useToasted from '@/use/useToasted';
import { getErrorMessage } from '@/utils/errors';
import Loader from '@/components/Loader.vue';
import { forceFileDownload } from '@/utils/downloads';
import { transformGraphData } from '@/utils/reports';
import ReportWidget from '@/components/reports/ReportWidget.vue';

interface Input {
  field: string;
  filter: string;
  type: string;
  values?: string[];
}

interface Report {
  inputs: Input[];
}

export default defineComponent({
  name: 'Report',
  components: {
    ReportWidget,
    Loader,
    ReportFilters,
    ReportLineChart,
    ReportPieChart,
    ReportStackedBarChart,
  },
  setup() {
    const { $http } = useHttp();
    const { route } = useRouter();
    const { $toasted } = useToasted();
    const { currentIncidentId } = useState('incident', ['currentIncidentId']);
    const graphData = ref<Array<any> | null>(null);
    const report = ref<Report | null>(null);
    const currentFilters = ref<any>(null);
    const loading = ref<Boolean>(false);

    onMounted(async () => {
      const reportResponse = await $http.get(
        `${process.env.VUE_APP_API_BASE_URL}/reports/${route.value.params.id}`,
      );
      report.value = reportResponse.data;
    });

    const transformedData = computed(() => {
      return transformGraphData(graphData.value);
    });

    const runReport = async (filters = {}) => {
      loading.value = true;
      graphData.value = [];
      currentFilters.value = filters;
      try {
        const response = await $http.get(
          `${process.env.VUE_APP_API_BASE_URL}/reports/${route.value.params.id}/data`,
          {
            params: {
              incident_id: currentIncidentId.value,
              ...filters,
            },
          },
        );
        graphData.value = Object.entries(response.data);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    };

    const runCsvReport = async (filters = {}) => {
      loading.value = true;
      graphData.value = [];
      currentFilters.value = filters;
      try {
        const response = await $http.get(
          `${process.env.VUE_APP_API_BASE_URL}/reports/${route.value.params.id}/data`,
          {
            params: {
              incident_id: currentIncidentId.value,
              ...filters,
            },
            headers: { Accept: 'application/x-zip-compressed' },
            responseType: 'blob',
          },
        );
        graphData.value = Object.entries(response.data);
        forceFileDownload(response);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        loading.value = false;
      }
    };

    const downloadWidgetCsv = async (key) => {
      try {
        const response = await $http.get(
          `${process.env.VUE_APP_API_BASE_URL}/report_widgets/${key}/data`,
          {
            params: {
              incident_id: currentIncidentId.value,
              ...currentFilters.value,
            },
            headers: { Accept: 'text/csv' },
            responseType: 'blob',
          },
        );
        forceFileDownload(response);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    };

    const addWidgetToDashboard = async (key, filters) => {
      try {
        await $http.post(`${process.env.VUE_APP_API_BASE_URL}/user_widgets`, {
          widget: key,
          filters,
        });
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    };

    return {
      transformedData,
      report,
      runReport,
      runCsvReport,
      downloadWidgetCsv,
      addWidgetToDashboard,
      currentFilters,
      loading,
    };
  },
});
</script>
