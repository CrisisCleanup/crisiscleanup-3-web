<template>
  <div :class="classes">
    <div
      class="
        rounded-full
        w-full
        h-full
        overflow-hidden
        text-center
        bg-purple
        flex
        cursor-pointer
      "
      :class="innerClasses"
    >
      <span
        class="hidden group-hover:table-cell text-white font-bold align-middle"
        >{{ initials }}</span
      >
      <img
        :src="url"
        :alt="initials"
        class="
          object-cover object-center
          w-full
          h-full
          visible
          group-hover:hidden
        "
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
    size: VueTypes.oneOf(['xsmall', 'small', 'medium', 'large', 'xl']).def(
      'small',
    ),
    innerClasses: VueTypes.string.def('shadow-inner'),
  },
  computed: {
    classes() {
      return {
        [this.size]: true,
      };
    },
  },
};
</script>

<style scoped>
.xsmall {
  width: 50px;
  height: 50px;
}
.small {
  width: 60px;
  height: 60px;
}
.medium {
  width: 150px;
  height: 150px;
}
.large {
  width: 200px;
  height: 200px;
}
.xl {
  width: 300px;
  height: 300px;
}
</style>
