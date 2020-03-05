<template>
  <div class="h-full m-auto">
    <form class="flex my-6 w-full justify-center">
      <div class="flex">
        <DragDrop
          class="border w-72 bg-white"
          :choose-title="
            shapefileData
              ? $t('Choose another file')
              : $t('dragDrop.choose_files')
          "
          :drag-title="
            (shapefileData && shapefileData.filename) ||
              $t(
                '~~Upload SHP or KML files. You will be able to preview the content of the files and choose some options before uploading',
              )
          "
          @files="handleFileUpload"
        ></DragDrop>
      </div>
      <div
        v-if="shapefileStructure"
        class="bg-white px-2 border-t border-b border-r w-1/2"
      >
        <div
          class="border-b font-semibold flex justify-between items-center h-10"
        >
          {{ shapefileData.filename }}
          <div class="flex">
            <base-button
              :text="$t('actions.see_sample')"
              size="small"
              class="border border-black px-2 py-1"
              :action="
                () => {
                  showingSampleModal = true;
                }
              "
            />
            <modal
              v-if="showingSampleModal"
              modal-classes="bg-white max-w-lg shadow"
              @close="showingSampleModal = false"
            >
              <div class="h-64 overflow-auto p-4">
                <div v-for="(value, key) in shapefileData.sample" :key="key">
                  {{ key }}: {{ value }}
                </div>
              </div>
            </modal>
          </div>
        </div>
        <div class="flex">
          <div class="flex w-1/2 flex-col items-center mr-2">
            <form-select
              v-if="!loading"
              v-model="shapefileKey"
              :options="shapefileData.fields"
              :placeholder="$t('layersVue.select_key_shapefile')"
              select-classes="bg-white border w-full"
              class="form-field"
            />

            <textarea
              v-model="shapefileCustomName"
              :placeholder="$t('~~Custom Name Template')"
              rows="4"
              class="form-field text-base w-full border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-1 resize-none"
            />
          </div>
          <div class="w-1/2">
            <div class="flex w-full">
              <form-select
                v-if="!loading"
                v-model="shapefileType"
                :options="locationTypes"
                item-key="id"
                label="name_t"
                select-classes="bg-white border w-full"
                :placeholder="$t('~~Select a location type')"
                class="form-field"
              />
            </div>
            <div class="flex w-full">
              <form-select
                v-if="!loading"
                v-model="shapefileAccess"
                :options="['private', 'public', 'shared']"
                item-key="id"
                label="name_t"
                select-classes="bg-white border w-full"
                :placeholder="$t('~~Select access level for uploaded files')"
                class="form-field"
              />
            </div>
          </div>
        </div>
        <div class="my-3">
          <base-button
            :text="$t('actions.upload')"
            :action="uploadShapefile"
            class="px-6 p-1 m-auto"
            type="primary"
          />
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import Layer from '@/models/Layer';
import DragDrop from '@/components/DragDrop';
import LocationType from '@/models/LocationType';
import { getErrorMessage } from '../utils/errors';

export default {
  name: 'LayerUploadTool',
  components: { DragDrop },
  data() {
    return {
      file: '',
      shapefileStructure: null,
      fileList: [],
      shapefileKey: '',
      shapefileCustomName: '',
      shapefileType: null,
      shapefileAccess: null,
      showingSampleModal: false,
      loading: false,
    };
  },
  computed: {
    locationTypes() {
      return LocationType.all();
    },
    tableData() {
      if (!this.shapefileStructure) {
        return [];
      }
      return Object.keys(this.shapefileStructure).map(item => {
        const { count, fields, sample } = this.shapefileStructure[item];
        return {
          filename: item,
          count,
          fields,
          sample,
        };
      });
    },
    shapefileData() {
      if (this.tableData.length) {
        const [shapeFileData] = this.tableData;
        return shapeFileData;
      }
      return null;
    },
  },
  async mounted() {
    await LocationType.api().get('/location_types', {
      dataKey: 'results',
    });
    await Layer.api().get('/layers', {
      dataKey: 'results',
    });
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
      this.loading = true;
      const result = await this.$http.post(
        `${process.env.VUE_APP_API_BASE_URL}/inspect_shapefile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );
      this.loading = false;
      this.shapefileStructure = result.data;
    },
    async uploadShapefile() {
      if (!this.validateUpload()) {
        return;
      }

      const formData = new FormData();
      formData.append('file', this.fileList[0]);
      formData.append('key', this.shapefileKey);
      formData.append('note_key', this.shapefileKey);
      formData.append('type', this.shapefileType);
      formData.append('shared', this.shapefileAccess || 'shared');

      try {
        const results = await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/upload_shapefile`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        this.$emit('addedLayer', results.data);
        this.shapefileStructure = null;
        await this.$toasted.success(this.$t('layersVue.successful_upload'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    validateUpload() {
      if (this.shapefileCustomName) {
        const [shapeFileData] = this.tableData;
        const hasFieldInTemplate = shapeFileData.fields.some(field =>
          this.shapefileCustomName.includes(`{${field}}`),
        );
        if (hasFieldInTemplate) {
          return true;
        }

        this.$toasted.error(
          this.$t(
            '~~You need at least one valid field in the template for a custom name',
          ),
        );
        return false;
      }

      return true;
    },
  },
};
</script>

<style scoped>
.form-field {
  @apply my-2;
}
</style>
