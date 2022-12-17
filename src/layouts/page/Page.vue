<template>
  <template v-if="!isLoading">
    <template v-if="tabs">
      <PageTabBar :tabs="tabs" />
    </template>
    <slot></slot>
  </template>
  <div v-else class="flex h-screen items-center justify-center">
    <font-awesome-icon size="xl" icon="spinner" spin />
  </div>
</template>

<script>
import PageTabBar from './PageTabBar.vue';

export default {
  name: 'PageLayout',
  components: { PageTabBar },
  props: {
    isLoading: {
      type: Boolean,
    },
    tabs: {
      type: PageTabBar.props.tabs,
    },
  },
};
</script>

<style scoped></style>
