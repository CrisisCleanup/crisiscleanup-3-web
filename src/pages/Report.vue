<template>
  <div class="reports">
    <ReportFilters :inputs="report.inputs" @onFilter="runReport" />
    <Loader
      v-if="loading"
      class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
    ></Loader>
    <div
      v-else
      v-for="[key, value] in Object.entries(transformedData)"
      :key="key"
      class="items-center justify-center flex my-10 ml-8"
    >
      <div v-if="value.type === 'pie'" class="grid grid-flow-col">
        <ReportPieChart
          v-for="[reportKey, reportValue] in Object.entries(value.data)"
          :key="reportKey"
          :titleKey="reportKey"
          :data="reportValue"
          :id="`${reportKey}-${key}`"
          class="first:ml-auto last:mr-auto"
        />
      </div>
      <div
        v-if="value.type === 'multiline'"
        class="flex items-center justify-center"
      >
        <ReportLineChart
          :data="value.data"
          :group-by="value.group_by"
          :key="JSON.stringify(currentFilters)"
        />
      </div>
      <div
        v-if="value.type === 'barstack'"
        class="flex items-center justify-center"
      >
        <ReportStackedBarChart
          :data="value.data"
          :key="JSON.stringify(currentFilters)"
        />
      </div>
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
import moment from 'moment';
import useHttp from '@/use/useHttp';
import ReportPieChart from '@/components/reports/ReportPieChart.vue';
import ReportLineChart from '@/components/reports/ReportLineChart.vue';
import ReportStackedBarChart from '@/components/reports/ReportStackedBarChart.vue';
import ReportFilters from '@/components/reports/ReportFilters.vue';
import useToasted from '@/use/useToasted';
import { getErrorMessage } from '@/utils/errors';
import Loader from '@/components/Loader.vue';

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
      const transformedGraphData = {};
      if (graphData.value) {
        graphData.value.forEach(([graphKey, graphValue]) => {
          if (graphValue.definition.type === 'pie') {
            const result = {};
            graphValue.data.forEach((graph) => {
              result[graph[graphValue.definition.group_by[0]]] = [];

              Object.keys(graph).forEach((key) => {
                if (key !== graphValue.definition.group_by[0]) {
                  result[graph[graphValue.definition.group_by[0]]].push({
                    name: key,
                    value: graph[key],
                  });
                }
              });
            });
            transformedGraphData[graphKey] = {
              data: result,
              group_by: graphValue.definition.group_by[0],
              type: graphValue.definition.type,
            };
          }
          if (graphValue.definition.type === 'multiline') {
            transformedGraphData[graphKey] = {
              data: graphValue.data,
              group_by: graphValue.definition.group_by[0],
              type: graphValue.definition.type,
            };
          }
          if (graphValue.definition.type === 'barstack') {
            transformedGraphData[graphKey] = {
              data: graphValue.data.map((entry) => {
                return {
                  key: moment(
                    entry[graphValue.definition.group_by[0]],
                  ).toDate(),
                  values: Object.keys(entry)
                    .filter((key) => key !== graphValue.definition.group_by[0])
                    .map((key) => {
                      return {
                        grpName: key,
                        grpValue: entry[key],
                      };
                    }),
                };
              }),
              group_by: graphValue.definition.group_by[0],
              type: graphValue.definition.type,
            };
          }
        });
      }
      return transformedGraphData;
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

    return {
      transformedData,
      report,
      runReport,
      currentFilters,
      loading,
    };
  },
});
</script>

<style scoped></style>
