<template>
  <div :class="classes">
    <div
      class="group w-full h-full rounded-full overflow-hidden shadow-inner text-center bg-purple table cursor-pointer"
    >
      <span
        class="hidden group-hover:table-cell text-white font-bold align-middle"
        >{{ initials }}</span
      >
      <img
        :src="url"
        :alt="initials"
        class="object-cover object-center w-full h-full visible group-hover:hidden"
      />
    </div>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'Avatar',
  props: {
    initials: {
      type: String,
      default: '',
    },
    url: {
      type: String,
      default: '',
    },
    size: VueTypes.oneOf(['small', 'medium', 'large', 'xl']).def('small'),
  },
  computed: {
    classes() {
      return {
        'w-6 h-6': this.size === 'small',
        'w-12 h-12': this.size === 'medium',
        'w-16 h-16': this.size === 'large',
        'w-24 h-24': this.size === 'xl',
        'w-32 h-32': this.size === '2xl',
        'w-40 h-40': this.size === '3xl',
        'relative mb-4': true,
      };
    },
  },
};
</script>

<style scoped></style>
