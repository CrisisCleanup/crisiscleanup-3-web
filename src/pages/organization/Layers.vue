<template>
  <div class="flex h-full w-3/4 m-auto">
    <div class="p-12 w-full">
      <div class="container">
        <DragDrop @files="handleFileUpload"></DragDrop>
      </div>

      <div v-if="shapefileStructure">
        <Table
          class="border text-xs mt-4"
          :data="tableData"
          :columns="columns"
          :loading="loading"
          :body-style="{ overflow: 'visible' }"
        >
          <template #fields="slotProps">
            <div class="flex w-full">
              <form-select
                v-if="!loading"
                v-model="shapefileKey"
                :options="slotProps.item.fields"
                :placeholder="$t('Select a key for this shapefile')"
                select-classes="bg-white border w-full"
              />
            </div>
          </template>
          <!-- TODO: refactor after unit tests -->
          <!-- eslint-disable-next-line vue/no-unused-vars -->
          <template #types="{slotProps}">
            <div class="flex w-full">
              <form-select
                v-if="!loading"
                v-model="shapefileType"
                :options="locationTypes"
                select-classes="bg-white border w-full"
              />
            </div>
          </template>
          <template #sample="slotProps">
            <div class="flex mr-2">
              <base-button
                :text="$t('actions.see_sample')"
                type="trash"
                size="small"
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
                  <div v-for="(value, key) in slotProps.item.sample" :key="key">
                    {{ key }}: {{ value }}
                  </div>
                </div>
              </modal>
            </div>
          </template>
        </Table>
        <div class="my-3">
          <base-button
            :text="$t('actions.upload')"
            :action="
              () => {
                return uploadShapefile();
              }
            "
            class="px-6 p-3 m-auto"
            type="primary"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Layer from '@/models/Layer';
import Table from '@/components/Table';
import DragDrop from '@/components/DragDrop';
// TODO: refactor after unit tests
// eslint-disable-next-line no-unused-vars
const fileToArrayBuffer = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

export default {
  name: 'Layers',
  components: { DragDrop, Table },
  data() {
    return {
      file: '',
      shapefileStructure: null,
      fileList: [],
      shapefileKey: '',
      shapefileType: 'COUNTY',
      columns: [
        {
          title: this.$t('Filename'),
          dataIndex: 'filename',
          key: 'filename',
        },
        {
          title: this.$t('Count'),
          dataIndex: 'count',
          key: 'count',
        },
        {
          title: this.$t('Data Key'),
          dataIndex: 'fields',
          key: 'fields',
        },
        {
          title: this.$t('Location Type'),
          dataIndex: 'types',
          key: 'types',
        },
        {
          title: '',
          dataIndex: 'sample',
          key: 'sample',
        },
      ],
      showingSampleModal: false,
      loading: false,
      locationTypes: [
        'US_STATE',
        'COUNTY',
        'CENSUS_TRACT',
        'SVI',
        'SVI_COUNTY',
        'CONGRESSIONAL_DISTRICT',
        'INCIDENT_TRACK',
        'INCIDENT_AREA',
        'FLOOD',
      ],
    };
  },
  computed: {
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
  },
  async mounted() {
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
      // let buffer = await fileToArrayBuffer(this.file)
      // let shape = await shp(buffer)
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
      const formData = new FormData();
      formData.append('file', this.fileList[0]);
      formData.append('key', this.shapefileKey || 'NAME');
      formData.append('note_key', this.shapefileKey || 'NAME');
      formData.append('type', this.shapefileType || 'US_STATE');

      try {
        await this.$http.post(
          `${process.env.VUE_APP_API_BASE_URL}/upload_shapefile`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Accept: 'application/json',
            },
          },
        );
        await this.$toasted.success(this.$t('Successfully updated shapefile'));
      } catch (e) {
        // TODO: handle exception
      }
    },
  },
};
</script>

<style scoped></style>
