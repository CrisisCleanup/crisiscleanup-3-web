<template>
  <div class="relative overflow-hidden">
    <base-button ref="btn" v-bind="$attrs">
      <div class="loader__content" :class="value && 'loading'">
        <slot />
      </div>
      <div
        :style="loadStyle"
        class="loader__overlay"
        :class="reverse && 'reverse'"
      ></div>
    </base-button>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { computed } from '@vue/composition-api';

export default {
  name: 'ProgressButton',
  props: {
    value: VueTypes.number.def(100),
    total: VueTypes.number,
    reverse: VueTypes.bool.def(false),
  },
  setup(props) {
    const step = computed(() => {
      let base = props.value;
      if (props.total && props.total !== 0) {
        base = (props.value / props.total) * 100;
      }
      return props.reverse === true ? 100 - base : base;
    });

    const loadStyle = computed(() => ({
      width: '100%',
      transform: `translateX(${-step.value}%)`,
    }));
    return {
      loadStyle,
    };
  },
};
</script>

<style scoped lang="postcss">
.loader {
  &__overlay {
    position: absolute;
    height: 100%;
    right: 0;
    top: 0;
    z-index: 1;
    opacity: 0;
    &.loading {
      @apply bg-primary-dark;
      opacity: 1;
      animation: pulse 1s infinite;
    }
  }
  &__content {
    z-index: 2;
  }
}
</style>
