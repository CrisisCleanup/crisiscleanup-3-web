<template>
  <div class="flex justify-end p-2 gap-2 items-center">
    <a
      class="p-2 bg-primary-light border-primary-light"
      :href="pdf.full_url"
      :download="pdf.filename_original"
      >{{ $t('actions.download') }}</a
    >
  </div>
  <div class="h-144 overflow-y-auto border">
    <vue-pdf-embed :source="pdf.full_url" />
  </div>
</template>

<script>
import VuePdfEmbed from 'vue-pdf-embed';

export default {
  name: 'PdfViewer',
  components: { VuePdfEmbed },
  props: {
    pdf: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped></style>
