<template>
  <PageTabBar
    v-if="
      isBugCountFinished &&
      bugReportsData &&
      isTicketCountFinished &&
      ticketCountData
    "
    :tabs="tabs"
  />
</template>

<script lang="ts">
import { reactive } from 'vue';
import PageTabBar from '../../layouts/page/PageTabBar.vue';

export default defineComponent({
  name: 'AdminPage',
  components: { PageTabBar },
  setup() {
    const ticketCount = ref(0);
    const bugReportCount = ref(0);
    const ccuApi = useApi();
    const { isFinished: isBugCountFinished, data: bugReportsData } = ccuApi(
      '/bug_reports',
      {
        method: 'GET',
      },
    );
    whenever(isBugCountFinished, () => {
      const bugsTab = tabs.find((tab) => tab.key === 'nav.bugs');
      bugsTab.title = `Bugs (${bugReportsData.value.count})`;
    });

    const { isFinished: isTicketCountFinished, data: ticketCountData } = ccuApi(
      'zendesk/search/count.json?query=type:ticket status<solved',
      {
        method: 'GET',
      },
    );
    whenever(isTicketCountFinished, () => {
      const ticketTab = tabs.find((tab) => tab.key === 'nav.admin_tickets');
      console.log(ticketCount.value);
      ticketTab.title = `Tickets (${ticketCountData.value.count})`;
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

    return {
      tabs,
      isBugCountFinished,
      bugReportsData,
      isTicketCountFinished,
      ticketCountData,
    };
  },
});
</script>

<style scoped></style>
