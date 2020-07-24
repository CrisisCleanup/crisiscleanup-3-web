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
          :options="FILE_TYPES"
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

<script>
import DragDrop from './DragDrop';
import { getErrorMessage } from '../utils/errors';
import Report from '../models/Report';
import Organization from '../models/Organization';
import OrganizationSearchInput from './OrganizationSearchInput';
import Loader from './Loader';

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

export default {
  name: 'FileUpload',
  components: { Loader, OrganizationSearchInput, DragDrop },
  data() {
    return {
      uploading: false,
      showingUploadModal: false,
      selectedModel: null,
      uploadType: '',
      entityId: null,
      FILE_TYPES: FILE_TYPES.map((key) => {
        return {
          value: key,
          name_t: this.$t(key),
        };
      }),
      fileAwareModels: { Report, Organization },
    };
  },
  async mounted() {
    await Report.api().get('/reports', {
      dataKey: 'results',
    });
  },
  computed: {
    reports() {
      return Report.all();
    },
  },
  methods: {
    async handleFileUpload(fileList) {
      if (fileList.length === 0) {
        this.uploading = false;
        return;
      }
      const formData = new FormData();
      formData.append('upload', fileList[fileList.length - 1]);
      formData.append('type_t', this.uploadType);
      this.uploading = true;
      try {
        const result = await this.$http.post(
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
        await this.fileAwareModels[this.selectedModel]
          .api()
          .addFile(this.entityId, file);
        await this.$toasted.success(this.$t('info.upload_file_successful'));
        this.entityId = null;
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>

<style scoped></style>
