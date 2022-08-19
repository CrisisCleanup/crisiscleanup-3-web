<template>
  <div>
    <div v-if="value.type === 'pie'" class="grid grid-flow-col">
      <ReportPieChart
        v-for="[reportKey, reportValue] in Object.entries(value.data)"
        :key="reportKey"
        :title-key="reportKey"
        :data="reportValue"
        :id="`${reportKey}-${key}`"
        class="first:ml-auto last:mr-auto"
        :report-name="widgetKey"
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
        :report-name="widgetKey"
      />
    </div>
    <div
      v-if="value.type === 'barstack'"
      class="flex items-center justify-center"
    >
      <ReportStackedBarChart
        :data="value.data"
        :report-name="widgetKey"
        :key="JSON.stringify(currentFilters)"
      />
    </div>
  </div>
</template>
<script lang="ts">
import ReportLineChart from '@/components/reports/ReportLineChart.vue';
import ReportPieChart from '@/components/reports/ReportPieChart.vue';
import ReportStackedBarChart from '@/components/reports/ReportStackedBarChart.vue';

export default {
  name: 'ReportWidget',
  components: { ReportLineChart, ReportPieChart, ReportStackedBarChart },
  props: {
    currentFilters: {},
    widgetKey: {},
    value: {},
  },
};
</script>
