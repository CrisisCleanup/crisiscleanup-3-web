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
import { ref, reactive, watch, defineComponent, onMounted } from 'vue';
import PageTabBar from '../../layouts/page/PageTabBar.vue';

export default defineComponent({
  name: 'AdminPage',
  components: { PageTabBar },
  setup() {
    const ccuApi = useApi();
    const isBugCountFinished = ref(false);
    const bugReportsData = ref(null);
    const isTicketCountFinished = ref(false);
    const ticketCountData = ref(null);

    const tabs = reactive([
      { key: 'nav.admin_dashboard' },
      { key: 'nav.admin_event_stream' },
      { key: 'nav.admin_tickets' },
      { key: 'nav.bugs' },
      { key: 'nav.cms' },
      { key: 'nav.incident_wizard' },
      { key: 'nav.localizations' },
    ]);

    onMounted(async () => {
      const bugReportsApiResponse = await ccuApi(
        '/bug_reports',
        { method: 'GET' },
      );
      isBugCountFinished.value = bugReportsApiResponse.isFinished;
      bugReportsData.value = bugReportsApiResponse.data;

      const ticketsApiResponse = await ccuApi(
        'zendesk/search/count.json?query=type:ticket status<solved',
        { method: 'GET' },
      );
      isTicketCountFinished.value = ticketsApiResponse.isFinished;
      ticketCountData.value = ticketsApiResponse.data;
    });

    watch([isBugCountFinished, bugReportsData], ([finished, data]) => {
      if(finished) {
        const bugsTab = tabs.find((tab) => tab.key === 'nav.bugs');
        if (bugsTab) {
          bugsTab.title = `Bugs (${data?.value?.count})`;
        }
      }
    });

    watch([isTicketCountFinished, ticketCountData], ([finished, data]) => {
      if(finished) {
        const ticketTab = tabs.find((tab) => tab.key === 'nav.admin_tickets');
        if (ticketTab) {
          ticketTab.title = `Tickets (${data?.value?.count})`;
        }
      }
    });

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
