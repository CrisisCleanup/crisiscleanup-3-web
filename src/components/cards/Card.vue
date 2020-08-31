<template>
  <Loader overlay :loading="loading">
    <template #content>
      <div class="bg-white shadow-crisiscleanup-card card h-full">
        <div class="header" slot="header">
          <div class="header--inner">
            <slot name="header"></slot>
          </div>
        </div>
        <div class="body">
          <div v-if="!loading" class="body--inner h-full">
            <slot></slot>
          </div>
        </div>
      </div>
    </template>
  </Loader>
</template>

<script>
import VueTypes from 'vue-types';
import Loader from '@/components/Loader.vue';
export default {
  name: 'Card',
  components: { Loader },
  props: {
    loading: VueTypes.bool.def(false),
  },
};
</script>

<style lang="scss" scoped>
.card {
  .header {
    position: relative;
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      opacity: 0.2;
      background-color: #979797;
    }
    &--inner {
      display: flex;
      justify-content: space-between;
    }
  }
  .body {
    @apply bg-white;
  }
}
</style>
