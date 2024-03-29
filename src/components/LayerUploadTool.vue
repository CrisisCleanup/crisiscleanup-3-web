<template>
  <div class="h-full m-auto">
    <form class="flex my-6 w-full justify-center">
      <div class="flex">
        <DragDrop
          class="border w-72 bg-white"
          :choose-title="$t('dragDrop.choose_files')"
          :drag-title="$t('layersVue.drag_drop_shp_kml')"
          @files="handleFileUpload"
        >
          <template v-if="shapefileStructure">
            <div v-for="key in Object.keys(shapefileStructure)" :key="key">
              {{ key }}
            </div>

            <div class="text-underline text-primary-dark">
              {{ $t('Choose another file') }}
            </div>
          </template>
        </DragDrop>
      </div>
      <div
        v-if="shapefileStructure"
        class="bg-white px-2 border-t border-b border-r w-1/2"
      >
        <div v-for="data in shapefiles" :key="data.filename">
          <div
            class="
              border-b
              font-semibold
              flex
              justify-between
              items-center
              h-10
            "
          >
            {{ data.filename }}
            <div class="flex">
              <base-button
                :text="$t('actions.see_sample')"
                :alt="$t('actions.see_sample')"
                size="small"
                class="border border-black px-2 py-1"
                :action="
                  () => {
                    shapefileInfo[data.filename].showingSampleModal = true;
                    shapefileInfo = { ...shapefileInfo };
                  }
                "
              />
              <modal
                v-if="shapefileInfo[data.filename].showingSampleModal"
                modal-classes="bg-white max-w-lg shadow"
                @close="
                  () => {
                    shapefileInfo[data.filename].showingSampleModal = false;
                    shapefileInfo = { ...shapefileInfo };
                  }
                "
              >
                <div class="h-64 overflow-auto p-4">
                  <div
                    v-for="(value, key) in shapefileStructure[data.filename]
                      .sample"
                    :key="key"
                  >
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
                :value="shapefileInfo[data.filename].shapefileKey"
                @input="
                  (value) => {
                    shapefileInfo[data.filename].shapefileKey = value;
                    shapefileInfo = { ...shapefileInfo };
                  }
                "
                :options="data.fields"
                :placeholder="$t('layersVue.select_key_shapefile')"
                select-classes="bg-white border w-full"
                class="form-field"
              />

              <textarea
                :value="shapefileInfo[data.filename].shapefileCustomName"
                @input="
                  (event) => {
                    shapefileInfo[data.filename].shapefileCustomName =
                      event.target.value;
                    shapefileInfo = { ...shapefileInfo };
                  }
                "
                :placeholder="$t('layersVue.custom_name_template')"
                rows="2"
                class="
                  form-field
                  text-base
                  w-full
                  border border-crisiscleanup-dark-100
                  placeholder-crisiscleanup-dark-200
                  outline-none
                  p-1
                  resize-none
                "
              />
            </div>
            <div class="w-1/2">
              <div class="flex w-full">
                <form-select
                  v-if="!loading"
                  :value="shapefileInfo[data.filename].shapefileType"
                  @input="
                    (value) => {
                      shapefileInfo[data.filename].shapefileType = value;
                      shapefileInfo = { ...shapefileInfo };
                    }
                  "
                  :options="locationTypes"
                  item-key="id"
                  label="name_t"
                  select-classes="bg-white border w-full"
                  :placeholder="$t('layersVue.location_type')"
                  class="form-field"
                />
              </div>
              <div class="flex w-full">
                <form-select
                  v-if="!loading"
                  :value="shapefileInfo[data.filename].shapefileAccess"
                  @input="
                    (value) => {
                      shapefileInfo[data.filename].shapefileAccess = value;
                      shapefileInfo = { ...shapefileInfo };
                    }
                  "
                  :options="['private', 'public', 'shared']"
                  item-key="id"
                  label="name_t"
                  select-classes="bg-white border w-full"
                  :placeholder="$t('layersVue.degree_of_sharing')"
                  class="form-field"
                />
              </div>
            </div>
          </div>
          <div>
            <base-checkbox
              v-model="shapefileInfo[data.filename].combineLocations"
            >
              {{ $t('layersVue.combine_to_single_object') }}
            </base-checkbox>
          </div>
          <code v-if="shapefileInfo[data.filename].shapefileCustomName">{{
            customSample(data.filename)
          }}</code>
          <div class="my-2 flex justify-center">
            <base-button
              :text="$t('actions.upload')"
              :alt="$t('actions.upload')"
              :action="
                () => {
                  uploadShapefile(data.filename);
                }
              "
              variant="solid"
              size="medium"
            />
          </div>
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
      loading: false,
      shapefileInfo: {},
    };
  },
  computed: {
    locationTypes() {
      return LocationType.all();
    },
    shapefiles() {
      if (!this.shapefileStructure) {
        return [];
      }
      return Object.keys(this.shapefileStructure).map((item) => {
        const { count, fields, sample } = this.shapefileStructure[item];
        return {
          filename: item,
          count,
          fields,
          sample,
        };
      });
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
    customSample(filename) {
      let returnString = this.shapefileInfo[filename].shapefileCustomName;
      const matches =
        this.shapefileInfo[filename].shapefileCustomName.match(/{.+?}/g);
      if (matches) {
        const replaceArray = matches.map((match) =>
          match.replace('{', '').replace('}', ''),
        );
        for (let i = 0; i <= replaceArray.length - 1; i++) {
          if (this.shapefileStructure[filename].sample[replaceArray[i]]) {
            returnString = returnString.replace(
              `{${replaceArray[i]}}`,
              this.shapefileStructure[filename].sample[replaceArray[i]],
            );
          }
        }
      }
      return returnString;
    },
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
      Object.keys(this.shapefileStructure).forEach((key) => {
        this.shapefileInfo[key] = { showingSampleModal: false };
      });
    },
    async uploadShapefile(filename) {
      if (!this.validateUpload(filename)) {
        return;
      }

      const formData = new FormData();
      formData.append('file', this.fileList[0]);
      formData.append('key', this.shapefileInfo[filename].shapefileKey);
      formData.append('note_key', this.shapefileInfo[filename].shapefileKey);
      formData.append('type', this.shapefileInfo[filename].shapefileType);
      formData.append('filename', filename);
      formData.append('shared', this.shapefileAccess || 'shared');
      formData.append(
        'combine_locations',
        this.shapefileInfo[filename].combineLocations || false,
      );
      if (this.shapefileInfo[filename].shapefileCustomName) {
        formData.append(
          'name_template',
          this.shapefileInfo[filename].shapefileCustomName,
        );
      }

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
        await this.$toasted.success(this.$t('layersVue.successful_upload'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    validateUpload(filename) {
      if (
        !this.shapefileInfo[filename].shapefileCustomName &&
        !this.shapefileInfo[filename].shapefileKey
      ) {
        this.$toasted.error(this.$t('layersVue.please_provide_name'));
        return false;
      }

      return true;
    },
  },
};
</script>

<style scoped>
.form-field {
  @apply my-1 w-full;
}
</style>
