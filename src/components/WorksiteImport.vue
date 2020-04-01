<template>
  <div class="p-3">
    <base-text variant="h2">{{ $t('Worksite Imports') }}</base-text>
    <div class="flex items-center justify-start">
      <DragDrop
        class="cursor-pointer w-32 py-2 mr-2"
        container-class="items-center justify-start cursor-pointer"
        :disabled="uploading"
        :multiple="false"
        @files="
          (files) => {
            handleFileUpload(files, 'fileTypes.logo');
          }
        "
      >
        <base-button
          class="cursor-pointer px-3 py-1"
          variant="solid"
          :show-spinner="uploading"
          :disabled="uploading"
          :text="$t('Upload CSV')"
        />
      </DragDrop>
      <base-checkbox v-model="ignoreDuplicates"
        >{{ $t('Ignore duplicates') }}
      </base-checkbox>
    </div>
    <Table :columns="columns" :data="imports" :body-style="{ height: '300px' }">
      <template #actions="slotProps">
        <div class="flex mr-2 justify-end w-full items-center">
          <base-button
            :text="$t('Download Successful')"
            variant="solid"
            size="small"
            class="mx-2"
            :action="
              () => {
                downloadSuccessful(slotProps.item.id);
              }
            "
          />
          <base-button
            :text="$t('Download Failed')"
            variant="outline"
            size="small"
            class="mx-2"
            :action="
              () => {
                downloadFailed(slotProps.item.id);
              }
            "
          />
        </div>
      </template>
    </Table>
  </div>
</template>

<script>
import Table from './Table';
import { hash } from '../utils/promise';
import { forceFileDownload } from '../utils/downloads';
import DragDrop from './DragDrop';
export default {
  name: 'WorksiteImport',
  components: { DragDrop, Table },
  data() {
    return {
      uploading: false,
      imports: [],
      columns: [
        {
          title: this.$t('ID'),
          dataIndex: 'id',
          key: 'id',
          width: '1fr',
        },
        {
          title: this.$t('Created At'),
          dataIndex: 'created_at',
          key: 'created_at',
          width: '1fr',
        },
        {
          title: this.$t('Total Items'),
          dataIndex: 'total_items',
          key: 'total_items',
          width: '1fr',
        },
        {
          title: this.$t('Processed Items'),
          dataIndex: 'items_processed',
          key: 'items_processed',
          width: '1fr',
        },
        {
          title: '',
          dataIndex: 'actions',
          key: 'actions',
          width: '2fr',
        },
      ],
      ignoreDuplicates: false,
    };
  },
  async mounted() {
    this.loadPageData();
  },
  methods: {
    async handleFileUpload(fileList) {
      this.fileList = fileList;

      if (this.fileList.length === 0) {
        return;
      }
      this.file = this.fileList[0].originFileObj;
      const formData = new FormData();
      formData.append('file', this.fileList[0]);
      if (this.ignoreDuplicates) {
        formData.append('skip_duplicate_check', true);
      }
      this.uploading = true;
      await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/worksites_import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );
      this.uploading = false;
      this.loadPageData();
    },
    async downloadSuccessful(reportId) {
      try {
        const response = await this.$http.request({
          url: `${process.env.VUE_APP_API_BASE_URL}/worksites_import/${reportId}/get_successes`,
          method: 'GET',
          responseType: 'blob',
          headers: { Accept: 'text/csv' },
        });
        forceFileDownload(response);
      } catch (e) {
        // console.error(e)
      }
    },
    async downloadFailed(reportId) {
      try {
        const response = await this.$http.request({
          url: `${process.env.VUE_APP_API_BASE_URL}/worksites_import/${reportId}/get_failures`,
          method: 'GET',
          responseType: 'blob',
          headers: { Accept: 'text/csv' },
        });
        forceFileDownload(response);
      } catch (e) {
        // console.error(e)
      }
    },
    async loadPageData() {
      const pageData = await hash({
        imports: this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/worksites_import`,
        ),
      });
      this.imports = pageData.imports.data.results;
    },
  },
};
</script>

<style scoped></style>
