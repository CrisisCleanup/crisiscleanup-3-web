<template>
  <div>
    <div class="actions flex my-4">
      <base-button
        :action="() => $emit('downloadWidgetCsv', widgetKey)"
        :text="$t('~~Download')"
        class="mx-2"
      />
      <base-button
        :action="
          () => $emit('printWidget', getWidgetSvg(`d3Chart-${widgetKey}`))
        "
        :text="$t('~~Print')"
        class="mx-2"
      />
      <base-button
        :action="() => $emit('addWidgetToDashboard', widgetKey)"
        :text="$t('~~Add to dashboard')"
        class="mx-2"
      />
    </div>
    <div v-if="value.type === 'pie'" class="grid grid-flow-col">
      <ReportPieChart
        :key="JSON.stringify(currentFilters)"
        :data="
          Object.entries(value.data).map(([reportKey, reportValue]) => ({
            titleKey: reportKey,
            data: reportValue,
          }))
        "
        :id="`d3Chart-${widgetKey}`"
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
        :id="`d3Chart-${widgetKey}`"
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
        :id="`d3Chart-${widgetKey}`"
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
  setup(props) {
    function getWidgetSvg() {
      return document.querySelector(`#d3Chart-${props.widgetKey} > svg`)
        ?.outerHTML;
    }

    return { getWidgetSvg };
  },
};
</script>
