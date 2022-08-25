<template>
  <div class="reports">
    <div class="text-center text-base py-5 px-2">
      {{ report.paid_for_statement }}
    </div>
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
      class="flex flex-col justify-center my-10 ml-8"
    >
      <ReportWidget
        :current-filters="currentFilters"
        :widget-key="key"
        :value="value"
        @printWidget="printWidget"
        @downloadWidgetCsv="downloadWidgetCsv"
        @addWidgetToDashboard="addWidgetToDashboard"
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
import usei18n from '@/use/usei18n';
import Accordion from '@/components/accordion/Accordion.vue';

interface Input {
  field: string;
  filter: string;
  type: string;
  values?: string[];
}

interface Report {
  inputs: Input[];
  name_t: string;
  paid_for_statement: string;
}

export default defineComponent({
  name: 'Report',
  components: {
    Accordion,
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
    const { $t } = usei18n();
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
      document.title = $t(report.value?.name_t || document.title);
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

    const printWidget = async (svg) => {
      try {
        const response = await $http.post(
          `${process.env.VUE_APP_API_BASE_URL}/reports_print`,
          {
            svg,
          },
          {
            responseType: 'blob',
          },
        );
        forceFileDownload(response);
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    };

    const addWidgetToDashboard = async (key) => {
      try {
        await $http.post(`${process.env.VUE_APP_API_BASE_URL}/user_widgets`, {
          widget: key,
          filters: currentFilters,
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
      printWidget,
      addWidgetToDashboard,
      currentFilters,
      loading,
    };
  },
});
</script>
