<template>
  <div class="relative overflow-hidden">
    <base-button ref="btn" v-bind="$attrs">
      <div class="loader__content">
        <slot />
      </div>
      <div :style="loadStyle" class="loader__overlay" :class="loadClass"></div>
    </base-button>
  </div>
</template>

<script>
import VueTypes from 'vue-types';
import { computed, watch, ref } from '@vue/composition-api';

export default {
  name: 'ProgressButton',
  props: {
    value: VueTypes.oneOfType([VueTypes.number, VueTypes.func]),
    total: VueTypes.number,
    reverse: VueTypes.bool.def(false),
  },
  setup(props, context) {
    const _complete = ref(false);
    const step = computed(() => {
      let base = typeof props.value === 'number' ? props.value : props.value();
      if (props.total && props.total !== 0) {
        base = (base / props.total) * 100;
      }
      return props.reverse === true ? 100 - base : base;
    });

    const loadStyle = computed(() => ({
      width: '100%',
      transform: `translateX(${-step.value}%)`,
    }));
    const loadClass = computed(() => ({
      loading: Math.abs(step.value) > 0 && Math.abs(step.value) < 100,
      reverse: props.reverse === true,
    }));
    watch(
      () => step.value,
      () => {
        if (Math.abs(step.value) >= 100 && _complete.value === false) {
          context.emit('update:done', true);
          _complete.value = true;
        } else if (Math.abs(step.value) < 100 && _complete.value !== false) {
          _complete.value = false;
        }
      },
    );
    return {
      step,
      loadStyle,
      loadClass,
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
