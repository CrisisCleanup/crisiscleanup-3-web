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
      {
        key: 'nav.admin_dashboard',
        title: 'Home',
      },
      {
        key: 'nav.admin_tools',
        title: 'Events',
      },
    ]);
    return { tabs };
  },
};
</script>

<style scoped></style>
