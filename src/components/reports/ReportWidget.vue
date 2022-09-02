<template>
  <div class="p-3">
    <div class="actions flex my-4 justify-end items-center">
      <base-button
        class="text-base font-thin mx-1"
        ccu-icon="download"
        icon-size="small"
        variant="solid"
        size="small"
        :alt="$t('actions.download')"
        :text="$t('actions.download')"
        :action="() => $emit('downloadWidgetCsv', widgetKey)"
      />
      <base-button
        class="text-base font-thin mx-1"
        ccu-icon="print"
        icon-size="small"
        variant="solid"
        size="small"
        :alt="$t('actions.print')"
        :text="$t('actions.print')"
        :action="
          () => $emit('printWidget', getWidgetSvg(`d3Chart-${widgetKey}`))
        "
      />
      <base-checkbox
        class="text-sm mx-1"
        v-if="allowAdd"
        :value="availableWidgets.includes(widgetKey)"
        @input="
          (v) => {
            if (v) {
              $emit('addWidgetToDashboard', widgetKey);
            } else {
              $emit('removeWidgetFromDashboard', widgetKey);
            }
            reloadUserWidgets();
          }
        "
        >{{ $t('~~Add to dashboard') }}</base-checkbox
      >
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
        :display-options="value.display_options"
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
        :display-options="value.display_options"
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
      <ReportBarChart
        :data="value.data"
        :report-name="widgetKey"
        :group-by="value.group_by"
        :display-options="value.display_options"
        :key="JSON.stringify(currentFilters)"
        :id="`d3Chart-${widgetKey}`"
      />
    </div>
  </div>
</template>
<script lang="ts">
import { onMounted, ref } from '@vue/composition-api';
import ReportLineChart from '@/components/reports/ReportLineChart.vue';
import ReportPieChart from '@/components/reports/ReportPieChart.vue';
import ReportBarChart from '@/components/reports/ReportBarChart.vue';
import useHttp from '@/use/useHttp';

export default {
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
    const { $http } = useHttp();
    const availableWidgets = ref<any[]>([]);

    function getWidgetSvg() {
      return document.querySelector(`#d3Chart-${props.widgetKey} > svg`)
        ?.outerHTML;
    }

    async function reloadUserWidgets() {
      const response = await $http.get(
        `${process.env.VUE_APP_API_BASE_URL}/user_widgets`,
      );
      availableWidgets.value = response.data.results.map((w) => w.widget);
    }

    onMounted(async () => {
      if (props.allowAdd) {
        await reloadUserWidgets();
      }
    });

    return { getWidgetSvg, availableWidgets, reloadUserWidgets };
  },
};
</script>
