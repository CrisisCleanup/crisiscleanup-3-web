<template>
  <p :class="[styles, 'subpixel-antialiased']" :style="weights">
    <slot>BaseText</slot>
  </p>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent, computed } from 'vue';
import type { TEXT_VARIANTS as VARIANTS } from '../constants';

type Variant = (typeof VARIANTS)[number];
type Font = 'sans' | 'display';

export default defineComponent({
  name: 'BaseText',
  props: {
    variant: {
      type: String as PropType<Variant>,
      default: 'body',
    },
    font: {
      type: String as PropType<Font>,
      default: 'sans',
    },
    bold: {
      type: Boolean,
      default: false,
    },
    regular: {
      type: Boolean,
      default: false,
    },
    semiBold: {
      type: Boolean,
      default: false,
    },
    weight: {
      type: [String, Number],
      default: null,
    },
  },
  setup(props) {
    const styles = computed(() => ({
      'text-h1 font-h1 text-crisiscleanup-dark-400': props.variant === 'h1',
      'text-h2 font-h2 text-crisiscleanup-dark-500': props.variant === 'h2',
      'text-h3 font-h3 text-crisiscleanup-dark-500': props.variant === 'h3',
      'text-h4 font-h4 text-crisiscleanup-dark-400': props.variant === 'h4',
      'text-body font-body text-crisiscleanup-dark-500':
        props.variant === 'body',
      'text-bodysm font-bodysm': props.variant === 'bodysm',
      'text-bodyxsm font-bodyxsm': props.variant === 'bodyxsm',
      'font-sans': props.font === 'sans',
      'font-display': props.font === 'display',
    }));

    const weights = computed(() => {
      if (props.weight) {
        // weight prop takes priority.
        return { fontWeight: props.weight };
      }

      if (props.bold) {
        return { fontWeight: 700 };
      }

      if (props.semiBold) {
        return { fontWeight: 600 };
      }

      if (props.regular) {
        return { fontWeight: 400 };
      }

      return {};
    });

    return {
      weights,
      styles,
    };
  },
});
</script>
