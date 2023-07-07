<template>
  <PageTabBar v-if="isFinished && bugReportCount" :tabs="tabs" />
</template>

<script lang="ts">
import { reactive } from 'vue';
import PageTabBar from '../../layouts/page/PageTabBar.vue';

export default defineComponent({
  name: 'AdminPage',
  components: { PageTabBar },
  setup() {
    const bugReportCount = ref(0);
    const ccuApi = useApi();
    const { isFinished, data: bugReportsData } = ccuApi('/bug_reports', {
      method: 'GET',
    });
    whenever(isFinished, () => {
      bugReportCount.value = bugReportsData.value.count;
      const bugsTab = tabs.find((tab) => tab.key === 'nav.bugs');

      bugsTab.title = `Bugs (${bugReportCount.value})`;
    });
    const tabs = reactive([
      reactive({
        key: 'nav.admin_dashboard',
      }),
      // reactive({
      //   key: 'nav.admin_events',
      // }),
      reactive({
        key: 'nav.admin_event_stream',
      }),
      reactive({
        key: 'nav.admin_tickets',
      }),
      reactive({
        key: 'nav.bugs',
      }),
      reactive({
        key: 'nav.cms',
      }),
      reactive({
        key: 'nav.incident_wizard',
      }),
      reactive({
        key: 'nav.localizations',
      }),
    ]);

    return { tabs, isFinished, bugReportCount };
  },
});
</script>

<style scoped></style>
