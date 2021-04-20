<template>
  <PageLayout :tabs="tabs" />
</template>

<script>
import PageLayout from '@/layouts/page/Page.vue';
import { reactive } from '@vue/composition-api';

export default {
  name: 'AdminPage',
  components: { PageLayout },
  setup() {
    const tabs = reactive([
      reactive({
        key: 'nav.admin_dashboard',
        title: '~~Home',
      }),
      reactive({
        key: 'nav.admin_events',
      }),
      reactive({
        key: 'nav.admin_event_stream',
      }),
    ]);
    return { tabs };
  },
};
</script>

<style scoped></style>
