<template>
  <div class="flex items-center">
    <span>{{ $t('~~Examples:') }}</span>
    <div class="flex">
      <template v-for="format in formats">
        <a :href="file.url" v-for="file in getFilesForFormat(format)" download>
          <font-awesome-icon
            :key="file"
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
        </a>
      </template>
    </div>
  </div>
</template>
<script>
const FORMAT_TO_MIME_TYPE = {
  csv: ['text/csv', 'application/vnd.ms-excel'],
  pdf: ['application/pdf'],
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
      const mimeTypes = FORMAT_TO_MIME_TYPE[format] || [];
      return this.files.filter((file) =>
        mimeTypes.includes(file.mime_content_type),
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
