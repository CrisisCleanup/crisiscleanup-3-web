<template>
  <div class="relative">
    <base-button ref="btn" v-bind="$attrs">
      <div class="loader__content">
        <slot />
      </div>
      <div :style="loadStyle" class="loader__overlay"></div>
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
      width: `${step.value}%`,
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
    left: 0;
    top: 0;
    z-index: 1;
    @apply bg-primary-dark;
    opacity: 0.75;
  }
  &__content {
    z-index: 2;
  }
}
</style>
