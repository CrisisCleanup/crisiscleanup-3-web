<template>
  <div>
    <modal
      v-if="showingUploadModal"
      closeable
      modal-classes="bg-white max-w-md shadow"
      :title="$t('fileUpload.upload_file')"
      @close="showingUploadModal = false"
    >
      <div class="flex flex-col items-center p-3">
        <base-select
          :model-value="selectedModel"
          :options="Object.keys(fileAwareModels)"
          class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
          :placeholder="$t('fileUpload.select_entity')"
          @update:modelValue="(value) => (selectedModel = value)"
        />

        <base-select
          :model-value="uploadType"
          :options="fileTypes"
          class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
          item-key="value"
          label="name_t"
          :placeholder="$t('fileUpload.select_file_type')"
          @update:modelValue="(value) => (uploadType = value)"
        />

        <OrganizationSearchInput
          v-if="selectedModel === 'Organization'"
          size="large"
          class="bg-white h-12 mb-3 w-full"
          @selectedOrganization="entityId = $event.id"
        />

        <base-select
          v-if="selectedModel === 'Report'"
          :model-value="entityId"
          :options="reports"
          item-key="id"
          label="name_t"
          class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
          :placeholder="$t('fileUpload.select_report')"
          @update:modelValue="(value) => (entityId = value)"
        />

        <DragDrop
          :key="entityId"
          class="border w-72 bg-white"
          :choose-title="$t('dragDrop.choose_files')"
          :drag-title="$t('fileUpload.select_file_upload')"
          @files="handleFileUpload"
        >
          <template v-if="uploading">
            <spinner />
          </template>
        </DragDrop>
      </div>
      <template #footer></template>
    </modal>
    <base-button
      :text="$t('fileUpload.file_uploader')"
      :alt="$t('fileUpload.file_uploader')"
      variant="solid"
      size="medium"
      :action="
        () => {
          showingUploadModal = true;
        }
      "
    />
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import axios from 'axios';
import { getErrorMessage } from '../utils/errors';
import Report from '../models/Report';
import Organization from '../models/Organization';
import DragDrop from './DragDrop.vue';
import OrganizationSearchInput from './OrganizationSearchInput.vue';
import BaseSelect from './BaseSelect.vue';

const FILE_TYPES = [
  'fileTypes.logo',
  'fileTypes.user_profile_picture',
  'fileTypes.worksite_photo',
  'fileTypes.liability_waiver',
  'fileTypes.application',
  'fileTypes.instructions',
  'fileTypes.mapping_data',
  'fileTypes.supporting_document',
  'fileTypes.laws_ordinances',
  'fileTypes.audio_message',
  'fileTypes.roster',
  'fileTypes.other_file',
  'fileTypes.specifications',
  'fileTypes.signature',
  'fileTypes.terms_of_service',
  'fileTypes.report_sample',
];

export default defineComponent({
  name: 'FileUpload',
  components: { BaseSelect, OrganizationSearchInput, DragDrop },
  setup() {
    const { t } = useI18n();
    const $toasted = useToast();

    const uploading = ref(false);
    const showingUploadModal = ref(false);
    const selectedModel = ref('');
    const entityId = ref<Report | Organization | null>(null);
    const uploadType = ref('');
    const fileAwareModels = ref({ Report, Organization });
    const fileTypes = FILE_TYPES.map((key) => {
      return {
        value: key,
        name_t: t(key),
      };
    });

    const reports = computed(() => Report.all());

    onMounted(async () => {
      await Report.api().get('/reports', {
        dataKey: 'results',
      });
    });

    async function handleFileUpload(fileList) {
      if (fileList.length === 0) {
        uploading.value = false;
        return;
      }

      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', uploadType.value);
      uploading.value = true;
      try {
        const result = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/files`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        const file = result.data.id;
        await fileAwareModels.value[selectedModel.value]
          .api()
          .addFile(entityId.value?.id, file);
        await $toasted.success(t('info.upload_file_successful'));
        entityId.value = null;
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        uploading.value = false;
      }
    }

    return {
      uploading,
      showingUploadModal,
      selectedModel,
      entityId,
      uploadType,
      fileAwareModels,
      fileTypes,
      reports,
      handleFileUpload,
    };
  },
});
</script>

<style scoped></style>
