<template>
  <div class="p-3">
    <base-text variant="h2">{{
      $t('worksiteImport.worksite_imports')
    }}</base-text>
    <div class="flex items-center justify-start">
      <DragDrop
        v-if="imports"
        :key="imports.length"
        class="cursor-pointer w-32 py-2 mr-2"
        container-class="items-center justify-start cursor-pointer"
        :disabled="uploading"
        :multiple="false"
        @files="
          (files) => {
            handleFileUpload(files);
          }
        "
      >
        <base-button
          class="cursor-pointer px-3 py-1"
          variant="solid"
          data-testid="testUploadCsvFile"
          :show-spinner="uploading"
          :disabled="uploading"
          :text="$t('actions.upload_csv')"
          :alt="$t('actions.upload_csv')"
        />
      </DragDrop>
      <base-checkbox
        v-model="ignoreDuplicates"
        data-testid="testIgnoreDuplicatesCheckbox"
        >{{ $t('worksiteImport.ignore_duplicates') }}
      </base-checkbox>
      <base-select
        v-model="uploadType"
        data-testid="testUploadTypeSelect"
        :options="['worksite', 'pda']"
        select-classes="bg-white border w-64 mx-2"
        :placeholder="$t('worksiteImport.upload_type')"
      />
    </div>
    <Table :columns="columns" :data="imports" :body-style="{ height: '300px' }">
      <template #actions="slotProps">
        <div class="flex mr-2 justify-end w-full items-center">
          <base-button
            :text="`${$t('worksiteImport.successful_imports')} (${
              slotProps.item.success_count
            })`"
            :alt="`${$t('worksiteImport.successful_imports')} (${
              slotProps.item.success_count
            })`"
            data-testid="testSuccessfulImportsButton"
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
            :text="`${$t('worksiteImport.failed_imports')} (${
              slotProps.item.failed_count
            })`"
            :alt="`${$t('worksiteImport.failed_imports')} (${
              slotProps.item.failed_count
            })`"
            data-testid="testFailedImportsButton"
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

<script lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import Table from '../Table.vue';
import { hash } from '../../utils/promise';
import { forceFileDownload } from '../../utils/downloads';
import DragDrop from '../DragDrop.vue';

export default defineComponent({
  name: 'WorksiteImport',
  components: { DragDrop, Table },
  setup() {
    const { t } = useI18n();
    const uploading = ref(false);
    const ignoreDuplicates = ref(false);
    const uploadType = ref('worksite');
    const imports = ref([]);

    async function loadPageData() {
      const pageData = await hash({
        imports: axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_import`,
        ),
      });
      imports.value = pageData.imports.data.results;
    }

    async function handleFileUpload(fileList: File[]) {
      if (fileList.length === 0) {
        return;
      }

      const formData = new FormData();
      formData.append('file', fileList[0]);
      formData.append('type', uploadType.value);
      if (ignoreDuplicates.value) {
        formData.append('skip_duplicate_check', JSON.stringify(true));
      }

      uploading.value = true;
      await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );
      uploading.value = false;
      await loadPageData();
    }

    async function downloadSuccessful(reportId: string) {
      try {
        const response = await axios.request({
          url: `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/worksites_import/${reportId}/get_successes`,
          method: 'GET',
          responseType: 'blob',
          headers: { Accept: 'text/csv' },
        });
        forceFileDownload(response);
      } catch {
        // console.error(e)
      }
    }

    async function downloadFailed(reportId: string) {
      try {
        const response = await axios.request({
          url: `${
            import.meta.env.VITE_APP_API_BASE_URL
          }/worksites_import/${reportId}/get_failures`,
          method: 'GET',
          responseType: 'blob',
          headers: { Accept: 'text/csv' },
        });
        forceFileDownload(response);
      } catch {
        // console.error(e)
      }
    }

    onMounted(async () => {
      await loadPageData();
    });

    return {
      uploading,
      ignoreDuplicates,
      uploadType,
      imports,
      loadPageData,
      handleFileUpload,
      downloadSuccessful,
      downloadFailed,
      columns: [
        {
          title: t('worksiteImport.id'),
          dataIndex: 'id',
          key: 'id',
          width: '1fr',
        },
        {
          title: t('worksiteImport.created_at'),
          dataIndex: 'created_at',
          key: 'created_at',
          width: '1fr',
        },
        {
          title: t('worksiteImport.total_items'),
          dataIndex: 'total_items',
          key: 'total_items',
          width: '1fr',
        },
        {
          title: t('worksiteImport.processed_items'),
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
    };
  },
});
</script>

<style scoped></style>
