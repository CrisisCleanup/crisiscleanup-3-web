<template>
  <div class="relative">
    <div
      v-if="loading"
      data-cy="worksitemap-loader"
      class="absolute bottom-0 left-0 right-0 top-0 bg-crisiscleanup-light-grey opacity-75 flex items-center justify-center"
    >
      <slot name="element">
        <spinner />
      </slot>
    </div>
    <slot v-if="!loading" name="content" />
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export default {
  name: 'Loader',
  props: {
    loading: VueTypes.bool.def(true),
  },
};
</script>
