<template>
  <div class="bg-white shadow-crisiscleanup-card card">
    <div class="header" slot="header">
      <div class="header--inner">
        <slot name="header"></slot>
      </div>
    </div>
    <Loader overlay :loading="loading">
      <template #content>
        <div class="body">
          <div class="body--inner h-full">
            <slot></slot>
          </div>
        </div>
      </template>
    </Loader>
  </div>
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
  flex-grow: 1;
  .header {
    @apply py-5 px-6;
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
    display: flex;
    &--inner {
      display: flex;
      flex-grow: 1;
    }
  }
}
</style>
