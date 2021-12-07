<template>
  <PageLayout :tabs="tabs" />
</template>

<script>
import { reactive } from '@vue/composition-api';
import PageLayout from '@/layouts/page/Page.vue';

export default {
  name: 'AdminPage',
  components: { PageLayout },
  setup() {
    const tabs = reactive([
      reactive({
        key: 'nav.admin_dashboard',
      }),
      reactive({
        key: 'nav.admin_events',
      }),
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
    ]);
    return { tabs };
  },
};
</script>

<style scoped></style>
