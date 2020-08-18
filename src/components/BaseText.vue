<template>
  <p :class="[styles, 'subpixel-antialiased']" :style="weights">
    <slot>BaseText</slot>
  </p>
</template>

<script>
import VueTypes from 'vue-types';
import { TEXT_VARIANTS as VARIANTS } from '@/constants';

export default {
  name: 'BaseText',
  props: {
    variant: VueTypes.oneOf(VARIANTS).def('body'),
    font: VueTypes.oneOf(['sans', 'display']).def('sans'),
    bold: VueTypes.bool.def(false),
    regular: VueTypes.bool.def(false),
    semiBold: VueTypes.bool.def(false),
    weight: VueTypes.oneOf([
      100,
      200,
      300,
      400,
      500,
      600,
      700,
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
    ]),
  },
  computed: {
    styles() {
      return {
        'text-h1 font-h1 text-crisiscleanup-dark-400': this.variant === 'h1',
        'text-h2 font-h2 text-crisiscleanup-dark-500': this.variant === 'h2',
        'text-h3 font-h3 text-crisiscleanup-dark-500': this.variant === 'h3',
        'text-h4 font-h4 text-crisiscleanup-dark-400': this.variant === 'h4',
        'text-body font-body text-crisiscleanup-dark-500':
          this.variant === 'body',
        'text-bodysm font-bodysm': this.variant === 'bodysm',
        'text-bodyxsm font-bodyxsm': this.variant === 'bodyxsm',
        'font-sans': this.font === 'sans',
        'font-display': this.font === 'display',
      };
    },
    weights() {
      if (this.weight) {
        // weight prop takes priority.
        return { fontWeight: this.weight };
      }
      if (this.bold) {
        return { fontWeight: 700 };
      }
      if (this.semiBold) {
        return { fontWeight: 600 };
      }
      if (this.regular) {
        return { fontWeight: 400 };
      }
      return {};
    },
  },
};
</script>
