<template>
  <div v-if="hasData" class="p-3">
    <div class="actions flex my-4 justify-end items-center">
      <base-button
        class="text-base font-thin mx-1"
        data-testid="testDownloadWidgetCsvButton"
        ccu-icon="download"
        icon-size="small"
        variant="outline"
        size="small"
        :alt="$t('actions.download')"
        :text="$t('actions.download')"
        :action="() => $emit('downloadWidgetCsv', widgetKey)"
      />
      <base-button
        class="text-base font-thin mx-1"
        data-testid="testPrintWidgetButton"
        ccu-icon="print"
        icon-size="small"
        variant="outline"
        size="small"
        :alt="$t('actions.print')"
        :text="$t('actions.print')"
        :action="
          () => $emit('printWidget', getWidgetSvg(`d3Chart-${widgetKey}`))
        "
      />
      <base-checkbox
        v-if="allowAdd"
        data-testid="testAddToDashboardCheckbox"
        class="text-sm mx-1"
        :model-value="availableWidgets.includes(widgetKey)"
        @update:modelValue="
          (v) => {
            if (v) {
              $emit('addWidgetToDashboard', widgetKey);
            } else {
              $emit('removeWidgetFromDashboard', widgetKey);
            }
            reloadUserWidgets();
          }
        "
        >{{ $t('reports.add_to_dashboard') }}</base-checkbox
      >
    </div>
    <div v-if="value.type === 'pie'" class="grid grid-flow-col">
      <ReportPieChart
        :id="`d3Chart-${widgetKey}`"
        :data-testid="`testReportPieChart${widgetKey}Chart`"
        :key="JSON.stringify(currentFilters)"
        :data="
          Object.entries(value.data).map(([reportKey, reportValue]) => ({
            titleKey: reportKey,
            data: reportValue,
          }))
        "
        :display-options="value.display_options"
        class="first:ml-auto last:mr-auto"
        :report-name="widgetKey"
      />
    </div>
    <div
      v-if="value.type === 'multiline'"
      class="flex items-center justify-center"
    >
      <ReportLineChart
        :id="`d3Chart-${widgetKey}`"
        :data-testid="`testReportLineChart${widgetKey}Chart`"
        :key="JSON.stringify(currentFilters)"
        :data="value.data"
        :display-options="value.display_options"
        :group-by="value.group_by"
        :report-name="widgetKey"
      />
    </div>
    <div
      v-if="value.type === 'barstack'"
      class="flex items-center justify-center"
    >
      <ReportBarChart
        :id="`d3Chart-${widgetKey}`"
        :data-testid="`testReportBarChart${widgetKey}Chart`"
        :key="JSON.stringify(currentFilters)"
        :data="value.data"
        :report-name="widgetKey"
        :group-by="value.group_by"
        :display-options="value.display_options"
      />
    </div>
    <div
      class="underline text-primary-dark cursor-pointer mb-2"
      @click="showDescription = !showDescription"
    >
      {{
        showDescription
          ? $t('actions.hide_description')
          : $t('actions.show_description')
      }}
    </div>
    <div
      v-if="showDescription"
      v-html="$t(`reports.${widgetKey}_description`)"
    ></div>
  </div>
</template>
<script lang="ts">
import { onMounted, ref } from 'vue';
import axios from 'axios';
import ReportLineChart from '@/components/reports/ReportLineChart.vue';
import ReportPieChart from '@/components/reports/ReportPieChart.vue';
import ReportBarChart from '@/components/reports/ReportBarChart.vue';

export default defineComponent({
  name: 'ReportWidget',
  components: { ReportLineChart, ReportPieChart, ReportBarChart },
  props: {
    currentFilters: {
      type: Object,
      default: () => ({}),
    },
    widgetKey: {
      type: String,
      default: '',
    },
    value: {
      type: Object,
      default: () => ({}),
    },
    allowAdd: {
      type: Boolean,
    },
  },
  setup(props) {
    const $http = axios;
    const availableWidgets = ref<any[]>([]);
    const showDescription = ref<boolean>(false);

    const hasData = computed(() => {
      if (!props.value.data) {
        return false;
      }

      return (
        props.value.data.length > 0 || Object.keys(props.value.data).length > 0
      );
    });

    function getWidgetSvg() {
      return document.querySelector(`#d3Chart-${props.widgetKey} > svg`)
        ?.outerHTML;
    }

    async function reloadUserWidgets() {
      const response = await $http.get(
        `${import.meta.env.VITE_APP_API_BASE_URL}/user_widgets`,
      );
      availableWidgets.value = response.data.results.map((w) => w.widget);
    }

    onMounted(async () => {
      if (props.allowAdd) {
        await reloadUserWidgets();
      }
    });

    return {
      getWidgetSvg,
      availableWidgets,
      reloadUserWidgets,
      showDescription,
      hasData,
    };
  },
});
</script>
