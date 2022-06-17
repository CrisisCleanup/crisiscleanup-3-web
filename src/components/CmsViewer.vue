<template>
  <div class="flex">
    <img v-if="image" :src="image" class="w-32 h-32 mr-2" />
    <div>
      <div class="text-2xl my-1 font-bold" v-html="$t(title)"></div>
      <div class="text-lg" v-html="$t(content)"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';

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

<style scoped></style>
