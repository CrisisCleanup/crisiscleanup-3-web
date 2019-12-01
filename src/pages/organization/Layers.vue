<template>
    <div class="flex h-full w-3/4 m-auto">
        <div class="p-12 w-full">
              <div class="container">
                <div class="large-12 medium-12 small-12 cell">
                <label>File
                    <input type="file" id="file" ref="file"/>
                </label>
                    <button v-on:click="handleFileUpload">Inspect</button>
                </div>
            </div>

            <div v-if="shapefileStructure">
                <div v-for="key in Object.keys(shapefileStructure)">
                    {{key}}
                    <br>
                    {{shapefileStructure[key].count}} Items
                    <br>
                    {{shapefileStructure[key].fields}}
                    <br>
                    <code>{{shapefileStructure[key].sample}}</code>
                </div>
                <button v-on:click="uploadShapefile">Upload</button>
            </div>
        </div>
    </div>
</template>

<script>
    import shp from 'shpjs'
    import Layer from '@/models/Layer'

    const fileToArrayBuffer = file => new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.onload = ()=>{
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });

    export default {
        name: "Layers",
        async mounted() {
            await Layer.api().get('/layers', {
                dataKey: 'results'
            })
        },
        data(){
            return {
                file: '',
                shapefileStructure: null
            }
        },
        methods: {
            async handleFileUpload(){
                this.file = this.$refs.file.files[0];
                let buffer = await fileToArrayBuffer(this.file)
                let shape = await shp(buffer)
                var formData = new FormData();
                formData.append("file", this.$refs.file.files[0]);
                let result = await this.$http.post(`${process.env.VUE_APP_API_BASE_URL}/inspect_shapefile`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }
                })
                this.shapefileStructure = result.data
                console.log(this.shapefileStructure)
            },
            async uploadShapefile() {
                var formData = new FormData();
                formData.append("file", this.$refs.file.files[0]);
                formData.append("key", 'NAME');
                formData.append("note_key", 'NAME');
                formData.append("type", 'US_STATES');

                let result = await this.$http.post(`${process.env.VUE_APP_API_BASE_URL}/upload_shapefile`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    }
                })
    
            },
        },

    }
</script>

<style scoped>

</style>