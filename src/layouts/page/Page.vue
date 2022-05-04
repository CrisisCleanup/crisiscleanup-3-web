<template>
  <Loader
    :loading="isLoading"
    class="pt-6 bg-crisiscleanup-light-grey h-full overflow-auto"
  >
    <template #content>
      <template v-if="tabs">
        <PageTabBar :tabs="tabs" />
      </template>
      <slot></slot>
    </template>
  </Loader>
</template>

<script>
import VueTypes from 'vue-types';
import Loader from '@/components/Loader.vue';
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
