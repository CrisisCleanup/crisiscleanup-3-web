<template>
  <Loader
    :loading="isLoading"
    class="p-6 bg-crisiscleanup-light-grey h-full overflow-auto"
  >
    <template #content>
      <template v-if="tabs">
        <PageTabBar :tabs="tabs" />
      </template>
      <slot v-else></slot>
    </template>
  </Loader>
</template>

<script>
import Loader from '@/components/Loader.vue';
import VueTypes from 'vue-types';
import PageTabBar from './PageTabBar.vue';

export default {
  name: 'PageLayout',
  components: { Loader, PageTabBar },
  props: {
    isLoading: VueTypes.bool.def(false),
    tabs: PageTabBar.props.tabs.def(null),
  },
};
</script>

<style scoped></style>
