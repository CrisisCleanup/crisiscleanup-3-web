<template>
  <Card>
    <template #header>
      <div class="left">
        <slot name="left">
          <base-text variant="body" weight="700">
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
import VueTypes from 'vue-types';
import Card from './Card.vue';

export default {
  name: 'TitledCard',
  components: {
    Card,
  },
  props: {
    title: VueTypes.string,
  },
};
</script>

<style lang="scss" scoped>
.right,
.left {
  p {
    @apply text-crisiscleanup-dark-400;
  }
}
</style>
