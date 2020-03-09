<template>
  <p :class="[styles]" :style="weight && { fontWeight: weight }">
    <slot>BaseText</slot>
  </p>
</template>

<script>
import VueTypes from 'vue-types';

export const VARIANTS = ['h1', 'h2', 'h3', 'h4', 'body', 'bodysm'];

export default {
  name: 'BaseText',
  props: {
    variant: VueTypes.oneOf(VARIANTS).def('body'),
    font: VueTypes.oneOf(['sans', 'display']).def('sans'),
    weight: VueTypes.oneOf([300, 400, 500, 600, 700]),
  },
  computed: {
    styles() {
      return {
        'text-h1 font-h1': this.variant === 'h1',
        'text-h2 font-h2': this.variant === 'h2',
        'text-h3 font-h3': this.variant === 'h3',
        'text-h4 font-h4': this.variant === 'h4',
        'text-body font-body': this.variant === 'body',
        'text-bodysm font-bodysm': this.variant === 'bodysm',
        'font-sans': this.font === 'sans',
        'font-display': this.font === 'display',
      };
    },
  },
};
</script>
