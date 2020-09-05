<template>
  <Card :loading="loading" v-bind="$attrs">
    <template #header>
      <div class="left py-4 px-6">
        <slot name="left">
          <base-text variant="h3" weight="600">
            {{ $t(title) }}
          </base-text>
        </slot>
      </div>
      <div class="right">
        <slot name="right"> </slot>
      </div>
    </template>
    <slot />
  </Card>
</template>

<script>
// @flow
import VueTypes from 'vue-types';
import Card from './Card.vue';

export default {
  name: 'TitledCard',
  components: {
    Card,
  },
  props: ({
    title: VueTypes.string,
    loading: VueTypes.bool.def(false),
  }: {
    title: string,
    loading: boolean,
  }),
};
</script>

<style lang="scss" scoped>
.right,
.left {
  display: flex;
  p {
    @apply text-crisiscleanup-dark-400;
  }
}
</style>
