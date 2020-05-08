<template>
  <div class="flex items-center">
    <span>{{ $t('~~Examples:') }}</span>
    <div class="flex">
      <template v-for="format in formats">
        <font-awesome-icon
          :key="file"
          v-for="file in getFilesForFormat(format)"
          @click.stop="
            () => {
              $emit('download', format);
            }
          "
          :title="file.filename_original"
          class="p-1 cursor-pointer"
          size="3x"
          :icon="`file-${format}`"
        />
      </template>
    </div>
  </div>
</template>
<script>
const FORMAT_TO_MIME_TYPE = {
  csv: 'text/csv',
  pdf: 'application/pdf',
};

export default {
  name: 'ExampleReports',
  data() {
    return {
      FORMAT_TO_MIME_TYPE,
    };
  },
  methods: {
    getFilesForFormat(format) {
      return this.files.filter(
        (file) => file.mime_content_type === FORMAT_TO_MIME_TYPE[format],
      );
    },
  },
  props: {
    formats: {
      type: Array,
      default: () => {
        return [];
      },
    },
    files: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
};
</script>
