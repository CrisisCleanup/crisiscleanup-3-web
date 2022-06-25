<template>
  <div>
    <modal
      closeable
      @close="showingUploadModal = false"
      v-if="showingUploadModal"
      modal-classes="bg-white max-w-md shadow"
      :title="$t('fileUpload.upload_file')"
    >
      <div class="flex flex-col items-center p-3">
        <form-select
          :value="selectedModel"
          :options="Object.keys(fileAwareModels)"
          class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
          @input="(value) => (selectedModel = value)"
          :placeholder="$t('fileUpload.select_entity')"
        />

        <form-select
          :value="uploadType"
          :options="fileTypes"
          class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
          @input="(value) => (uploadType = value)"
          item-key="value"
          label="name_t"
          :placeholder="$t('fileUpload.select_file_type')"
        />

        <OrganizationSearchInput
          v-if="selectedModel === 'Organization'"
          size="large"
          @selectedOrganization="entityId = $event"
          class="bg-white h-12 mb-3 w-full"
        />

        <form-select
          v-if="selectedModel === 'Report'"
          :value="entityId"
          :options="reports"
          item-key="id"
          label="name_t"
          class="bg-white border border-crisiscleanup-dark-100 h-12 mb-3 w-full"
          @input="(value) => (entityId = value)"
          :placeholder="$t('fileUpload.select_report')"
        />

        <DragDrop
          class="border w-72 bg-white"
          :choose-title="$t('dragDrop.choose_files')"
          :drag-title="$t('fileUpload.select_file_upload')"
          :key="entityId"
          @files="handleFileUpload"
        >
          <template v-if="uploading">
            <Loader />
          </template>
        </DragDrop>
      </div>
      <div slot="footer"></div>
    </modal>
    <base-button
      :text="$t('fileUpload.file_uploader')"
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
import {
  ref,
  defineComponent,
  onMounted,
  computed,
} from '@vue/composition-api';
import DragDrop from './DragDrop.vue';
import { getErrorMessage } from '../utils/errors';
import Report from '../models/Report';
import Organization from '../models/Organization';
import OrganizationSearchInput from './OrganizationSearchInput.vue';
import Loader from './Loader.vue';
import usei18n from '@/use/usei18n';
import useHttp from '@/use/useHttp';
import useToasted from '@/use/useToasted';

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
  components: { Loader, OrganizationSearchInput, DragDrop },
  setup() {
    const { $t } = usei18n();
    const { $http } = useHttp();
    const { $toasted } = useToasted();

    const uploading = ref(false);
    const showingUploadModal = ref(false);
    const selectedModel = ref('');
    const entityId = ref<Report | Organization | null>(null);
    const uploadType = ref('');
    const fileAwareModels = ref({ Report, Organization });
    const fileTypes = FILE_TYPES.map((key) => {
      return {
        value: key,
        name_t: $t(key),
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
        const result = await $http.post(
          `${process.env.VUE_APP_API_BASE_URL}/files`,
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
        await $toasted.success($t('info.upload_file_successful'));
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
