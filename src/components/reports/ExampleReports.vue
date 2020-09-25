<template>
  <div class="flex items-center">
    <span>{{ $t('reportsVue.examples') }}</span>
    <div class="flex">
      <div v-for="format in formats" :key="format">
        <a
          :href="file.url"
          v-for="file in getFilesForFormat(format)"
          :key="file"
          download
        >
          <font-awesome-icon
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
      </div>
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
