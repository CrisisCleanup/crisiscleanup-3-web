<template>
  <PageTabBar :tabs="tabs" />
</template>

<script lang="ts">
import { reactive } from 'vue';
import PageTabBar from '../../layouts/page/PageTabBar.vue';

export default defineComponent({
  name: 'AdminPage',
  components: { PageTabBar },
  setup() {
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
        key: 'nav.admin_ticket_dashboard',
      }),
      reactive({
        key: 'nav.costs',
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
      reactive({
        key: 'nav.bugs',
      }),
    ]);
    return { tabs };
  },
});
</script>

<style scoped></style>
