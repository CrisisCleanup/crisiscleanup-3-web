<template>
    <div class="flex h-full w-3/4 m-auto">
        <div class="p-12 w-full">
              <div class="container">
                  <a-upload-dragger
                        name="file"
                        :multiple="false"
                        :beforeUpload="() => false"
                        @change="handleFileUpload"
                        :file-list="fileList"
                    >
                        <p class="ant-upload-drag-icon">
                        <a-icon type="inbox" />
                        </p>
                        <p class="ant-upload-text">Upload Shapefile</p>
                    </a-upload-dragger>
            </div>

            <div v-if="shapefileStructure">
                <Table class="border text-xs mt-4" :data="tableData" :columns="columns" :loading="this.loading">
                    <template #fields="slotProps">
                        <div class="flex w-full">
                            <base-select v-if="!loading" :change="onSelectShapefileKey" placeholder="Select a key for this shapefile" class="w-full">
                                <template v-slot:options>
                                    <a-select-option :key="key" v-for="key in slotProps.item.fields" :value="key">
                                        {{key}}
                                    </a-select-option>
                                </template>
                            </base-select>
                        </div>
                    </template>
                    <template #types="{slotProps}">
                        <div class="flex w-full">
                            <base-select v-if="!loading" :defaultValue="shapefileType" :change="onSelectShapefileType" class="w-full">
                                <template v-slot:options>
                                    <a-select-option :key="key" v-for="key in locationTypes" :value="key">
                                        {{key}}
                                    </a-select-option>
                                </template>
                            </base-select>
                        </div>
                    </template>
                    <template #sample="slotProps">
                        <div class="flex mr-2">
                            <base-button text="See Sample" type="trash" size="small" :action="() => { showingSampleModal = true }"/>
                            <modal v-if="showingSampleModal" @close="showingSampleModal = false" modal-classes="bg-white max-w-lg shadow">
                                <div class="h-64 overflow-auto p-4">
                                    <div v-for="(value, key) in slotProps.item.sample">
                                        {{key}}: {{value}}
                                    </div>
                                </div>
                            </modal>
                        </div>
                    </template>
                </Table>
                <div class="my-3">
                    <base-button text="Upload" :action="() => { return this.uploadShapefile() }" class="px-6 p-3 m-auto"
                                 type="primary"/>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import shp from 'shpjs'
    import Layer from '@/models/Layer'
    import Table from '@/components/Table'

    const fileToArrayBuffer = file => new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = ()=>{
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });

     const columns = [
        {
            title: 'Filename',
            dataIndex: 'filename',
            key: 'filename'
        },
        {
            title: 'Count',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'Data Key',
            dataIndex: 'fields',
            key: 'fields',
        },
        {
            title: 'Location Type',
            dataIndex: 'types',
            key: 'types',
        },
        {
            title: '',
            dataIndex: 'sample',
            key: 'sample',
        }]

    export default {
        name: "Layers",
        components: {Table},
        async mounted() {
            await Layer.api().get('/layers', {
                dataKey: 'results'
            })
        },
        data(){
            return {
                file: '',
                shapefileStructure: null,
                fileList: [],
                shapefileKey: '',
                shapefileType: 'COUNTY',
                columns,
                showingSampleModal: false,
                loading: false,
                locationTypes: ['US_STATE', 'COUNTY', 'CENSUS_TRACT', 'SVI', 'SVI_COUNTY', 'CONGRESSIONAL_DISTRICT', 'INCIDENT_TRACK', 'INCIDENT_AREA', 'FLOOD']
            }
        },
        methods: {
            onSelectShapefileKey(value) {
                this.shapefileKey = value;
            },
            onSelectShapefileType(value) {
                this.shapefileType = value;
            },
            async handleFileUpload(info){
                let fileList = [...info.fileList];
                this.fileList = fileList.slice(-1);

                if (this.fileList.length === 0) {
                    return
                }
                this.file = this.fileList[0].originFileObj;
                // let buffer = await fileToArrayBuffer(this.file)
                // let shape = await shp(buffer)
                var formData = new FormData();
                formData.append("file", this.fileList[0].originFileObj);
                this.loading = true;
                let result = await this.$http.post(`${process.env.VUE_APP_API_BASE_URL}/inspect_shapefile`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }
                })
                this.loading = false;
                this.shapefileStructure = result.data
            },
            async uploadShapefile() {
                var formData = new FormData();
                formData.append("file", this.fileList[0].originFileObj);
                formData.append("key", this.shapefileKey || 'NAME');
                formData.append("note_key", this.shapefileKey || 'NAME');
                formData.append("type", this.shapefileType || 'US_STATE');

                try {
                    await this.$http.post(`${process.env.VUE_APP_API_BASE_URL}/upload_shapefile`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Accept': 'application/json'
                        }
                    })
                    await this.$message.success('Successfully updated shapefile');
                } catch (e) {

                }
            },
        },
        computed: {
            tableData() {
                if (!this.shapefileStructure) {
                    return [];
                }
                return Object.keys(this.shapefileStructure).map((item) => {
                    let {count, fields, sample} = this.shapefileStructure[item];
                    return {
                        filename: item,
                        count,
                        fields,
                        sample
                    }
                })
            }
        }
    }
</script>

<style scoped>

</style>