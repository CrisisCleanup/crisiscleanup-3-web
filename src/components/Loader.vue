<template>
  <div class="relative">
    <transition name="fade">
      <div
        v-if="loading"
        data-cy="overlay.loader"
        class="
          absolute
          bottom-0
          left-0
          right-0
          top-0
          bg-crisiscleanup-light-grey
          opacity-75
          flex
          items-center
          justify-center
          h-full
          w-full
        "
      >
        <slot name="element">
          <spinner />
        </slot>
      </div>
    </transition>
    <template v-if="!overlay">
      <slot v-if="!loading" name="content" />
    </template>
    <template v-else>
      <slot v-bind="{ isLoading: loading }" name="content"></slot>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  name: 'Loader',
  props: {
    loading: {
      type: Boolean,
      default: true,
    },
    overlay: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="postcss">
.fade {
  &-leave-active,
  &-enter-active {
    transition: opacity 0.5s easeInOutCubic;
  }
  &-leave-to,
  &-enter {
    opacity: 0;
  }
}
</style>
