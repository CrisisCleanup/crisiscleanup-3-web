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
            class="border-b font-semibold flex justify-between items-center h-10"
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
              <base-select
                v-if="!loading"
                :model-value="shapefileInfo[data.filename].shapefileKey"
                @update:modelValue="
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
                :model-value="shapefileInfo[data.filename].shapefileCustomName"
                @update:modelValue="
                  (event) => {
                    shapefileInfo[data.filename].shapefileCustomName =
                      event.target.value;
                    shapefileInfo = { ...shapefileInfo };
                  }
                "
                :placeholder="$t('layersVue.custom_name_template')"
                rows="2"
                class="form-field text-base w-full border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-1 resize-none"
              />
            </div>
            <div class="w-1/2">
              <div class="flex w-full">
                <base-select
                  v-if="!loading"
                  :model-value="shapefileInfo[data.filename].shapefileType"
                  @update:modelValue="
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
                <base-select
                  v-if="!loading"
                  :model-value="shapefileInfo[data.filename].shapefileAccess"
                  @update:modelValue="
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
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import Layer from '../../models/Layer';
import { getErrorMessage } from '../../utils/errors';
import DragDrop from '../DragDrop.vue';
import LocationType from '../../models/LocationType';

export default {
  name: 'LayerUploadTool',
  components: { DragDrop },
  setup(props, { emit }) {
    const { t } = useI18n();
    const $toasted = useToast();

    const file = ref('');
    const shapefileStructure = ref(null);
    const fileList = ref([]);
    const loading = ref(false);
    const shapefileInfo = ref({});

    const locationTypes = computed(() => {
      return LocationType.all();
    });

    const shapefiles = computed(() => {
      if (!shapefileStructure.value) {
        return [];
      }
      return Object.keys(shapefileStructure.value).map((item) => {
        const { count, fields, sample } = shapefileStructure.value[item];
        return {
          filename: item,
          count,
          fields,
          sample,
        };
      });
    });

    function customSample(filename) {
      let returnString = shapefileInfo.value[filename].shapefileCustomName;
      const matches =
        shapefileInfo.value[filename].shapefileCustomName.match(/{.+?}/g);
      if (matches) {
        const replaceArray = matches.map((match) =>
          match.replace('{', '').replace('}', ''),
        );
        for (let i = 0; i <= replaceArray.length - 1; i++) {
          if (shapefileStructure.value[filename].sample[replaceArray[i]]) {
            returnString = returnString.replace(
              `{${replaceArray[i]}}`,
              shapefileStructure.value[filename].sample[replaceArray[i]],
            );
          }
        }
      }
      return returnString;
    }
    async function handleFileUpload(f) {
      fileList.value = f;
      if (f.length === 0) {
        return;
      }
      const formData = new FormData();
      formData.append('file', f[0]);
      const result = await axios.post(
        `${import.meta.env.VITE_APP_API_BASE_URL}/inspect_shapefile`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
          },
        },
      );
      shapefileStructure.value = result.data;
      for (const key of Object.keys(shapefileStructure.value)) {
        shapefileInfo.value[key] = { showingSampleModal: false };
      }
    }
    async function uploadShapefile(filename) {
      if (!validateUpload(filename)) {
        return;
      }

      const formData = new FormData();
      formData.append('file', fileList.value[0]);
      formData.append('key', shapefileInfo.value[filename].shapefileKey);
      formData.append('note_key', shapefileInfo.value[filename].shapefileKey);
      formData.append('type', shapefileInfo.value[filename].shapefileType);
      formData.append('filename', filename);
      formData.append(
        'shared',
        shapefileInfo.value[filename].shapefileAccess || 'shared',
      );
      formData.append(
        'combine_locations',
        shapefileInfo.value[filename].combineLocations || false,
      );
      if (shapefileInfo.value[filename].shapefileCustomName) {
        formData.append(
          'name_template',
          shapefileInfo.value[filename].shapefileCustomName,
        );
      }

      try {
        const results = await axios.post(
          `${import.meta.env.VITE_APP_API_BASE_URL}/upload_shapefile`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        emit('addedLayer', results.data);
        await $toasted.success(t('layersVue.successful_upload'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }
    function validateUpload(filename) {
      if (
        !shapefileInfo.value[filename].shapefileCustomName &&
        !shapefileInfo.value[filename].shapefileKey
      ) {
        $toasted.error(t('layersVue.please_provide_name'));
        return false;
      }

      return true;
    }

    onMounted(async () => {
      await LocationType.api().get('/location_types', {
        dataKey: 'results',
      });
      await Layer.api().get('/layers', {
        dataKey: 'results',
      });
    });

    return {
      file,
      shapefileStructure,
      fileList,
      loading,
      shapefileInfo,
      locationTypes,
      shapefiles,
      customSample,
      handleFileUpload,
      uploadShapefile,
      validateUpload,
    };
  },
};
</script>

<style scoped>
.form-field {
  @apply my-1 w-full;
}
</style>
