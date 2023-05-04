<template>
  <div class="reports">
    <div
      class="text-center text-base py-5 px-2"
      v-html="$t('reports.paid_for_statement')"
    ></div>
    <ReportFilters
      v-if="report"
      :key="currentIncidentId"
      :inputs="report.inputs"
      @onFilter="runReport"
      @onCSV="runCsvReport"
      @onPrint="printReport"
    />
    <font-awesome-icon v-if="loading" size="xl" icon="spinner" spin />
    <div
      v-for="[key, value] in Object.entries(transformedData)"
      v-else
      :key="key"
      class="flex flex-col justify-center my-10 ml-8"
    >
      <ReportWidget
        v-if="
          (value.data.length > 0 || Object.keys(value.data).length > 0) &&
          value.type !== 'pie'
        "
        :current-filters="currentFilters"
        :widget-key="key"
        :value="value"
        allow-add
        @printWidget="printWidget"
        @downloadWidgetCsv="downloadWidgetCsv"
        @addWidgetToDashboard="addWidgetToDashboard"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { useStore } from 'vuex';
import ReportFilters from '@/components/reports/ReportFilters.vue';
import { getErrorMessage } from '@/utils/errors';
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
  name_t: string;
  paid_for_statement: string;
}

export default defineComponent({
  name: 'Report',
  components: {
    ReportWidget,
    ReportFilters,
  },
  setup() {
    const $http = axios;
    const route = useRoute();
    const $toasted = useToast();
    const { t } = useI18n();
    const store = useStore();

    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    const graphData = ref<Array<any> | null>(null);
    const report = ref<Report | null>(null);
    const currentFilters = ref<any>(null);
    const loading = ref<boolean>(false);

    onMounted(async () => {
      const reportResponse = await $http.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/reports/${route.params.id}`,
      );
      report.value = reportResponse.data;
      document.title = t(report.value?.name_t || document.title);
    });

    const transformedData = computed<Record<any, any>>(() => {
      return transformGraphData(graphData.value);
    });

    const runReport = async (filters = {}) => {
      loading.value = true;
      graphData.value = [];
      currentFilters.value = filters;
      try {
        const response = await $http.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/reports/${
            route.params.id
          }/data`,
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
          `${import.meta.env.VITE_APP_API_BASE_URL}/reports/${
            route.params.id
          }/data`,
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
          `${import.meta.env.VITE_APP_API_BASE_URL}/report_widgets/${key}/data`,
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
          `${import.meta.env.VITE_APP_API_BASE_URL}/reports_print`,
          {
            svg: [svg],
            incident: currentIncidentId.value,
            filters: currentFilters.value,
            report: report.value?.name_t,
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

    const printAllWidgets = async (svgs) => {
      try {
        const response = await $http.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/reports_print`,
          {
            svg: svgs,
            incident: currentIncidentId.value,
            filters: currentFilters.value,
            report: report.value?.name_t,
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
        await $http.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/user_widgets`,
          {
            widget: key,
            filters: currentFilters,
          },
        );
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    };

    async function printReport() {
      const svgs = [] as any;
      for (const [key, value] of Object.entries(transformedData.value)) {
        if (value.data.length > 0 || Object.keys(value.data).length > 0) {
          svgs.push(document.querySelector(`#d3Chart-${key} > svg`)?.outerHTML);
        }
      }

      await printAllWidgets(svgs);
    }

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
      printReport,
      currentIncidentId,
    };
  },
});
</script>
