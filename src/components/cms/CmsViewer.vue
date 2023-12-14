<template>
  <div class="flex">
    <img v-if="image" :src="image" class="w-32 h-32 mr-2" />
    <div>
      <div class="text-2xl my-1 font-bold" v-html="$t(title)"></div>
      <div class="cms-viewer cms-viewer__content" v-html="$t(content)"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CmsViewer',
  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
  },
});
</script>

<style lang="postcss">
.cms-viewer {
  &__content {
    @apply text-lg;
    a {
      text-decoration: underline !important;
    }
  }
}
</style>
