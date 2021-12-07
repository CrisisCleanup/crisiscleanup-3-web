<template>
  <div>
    <div class="text-2xl my-1 font-bold" v-html="$t(title)"></div>
    <div class="text-lg" v-html="$t(content)"></div>
  </div>
</template>

<script>
export default {
  name: 'HtmlPreview',
  props: {
    title: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped></style>
