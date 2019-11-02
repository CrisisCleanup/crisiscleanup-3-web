<template>
    <a-form :form="form" @submit="handleSubmit" layout="vertical" class="bg-white flex flex-col h-full">
        <div class="intake-form p-3 flex-grow">
            <h4 class="py-3 m-1 border-t border-b flex items-center justify-between">
                <div class="flex items-center">
                    <a-badge :count="1" :numberStyle="{backgroundColor: '#FECE09', color: '#000000'}" class="mr-2"/>
                    Basic Information
                </div>
            </h4>
            <a-form-item>
                <a-input disabled="" v-model="what3words" size="large" placeholder="name">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
                <div class="flex justify-around items-center">
                    <a-button type="link" size="large" class="text-gray-700" @click="locateMe">
                        <font-awesome-icon size="lg" class="mx-2" icon="street-view" /> Use my location
                    </a-button>
                    <a-button type="link" size="large" class="text-gray-700" @click="locateMe">
                        <font-awesome-icon size="lg" class="mx-2" icon="map" /> Select on Map
                    </a-button>
                </div>
            </a-form-item>
            <a-form-item>
                <a-input v-model="worksite.name" size="large" placeholder="name">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-input v-model="worksite.address" size="large" placeholder="address">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-input v-model="worksite.city" size="large" placeholder="city">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-input v-model="worksite.county" size="large" placeholder="county">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-input v-model="worksite.state" size="large" placeholder="state">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
            </a-form-item>
            <a-form-item>
                <a-input v-model="worksite.postal_code" size="large" placeholder="postal_code">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
            </a-form-item>
            <template v-for="field in this.fields">
                <div :key="field.field_key" v-if="showAllFields || getValue(field.field_key)">
                    <template v-if="['h4'].includes(field.html_type)">
                        <component :is="field.html_type" :key="field.field_key"
                                   class="py-3 m-1 border-t border-b flex items-center justify-between">
                            <div class="flex items-center">
                                <a-badge :count="field.list_order" :numberStyle="{backgroundColor: '#FECE09', color: '#000000'}" class="mr-2"/>
                                {{field.label_t}}
                            </div>
                            <a-tooltip>
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                                <a-icon type="question-circle-o"/>
                            </a-tooltip>
                        </component>
                    </template>
                    <template v-if="['h5'].includes(field.html_type)">
                        <component :is="field.html_type" :key="field.field_key">
                            {{field.label_t}}
                        </component>
                    </template>
                    <template v-if="field.html_type === 'select'">
                        <a-form-item :key="field.field_key">
                          <span slot="label">
                            {{field.label_t}}
                            <a-tooltip>
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                              <a-icon type="question-circle-o"/>
                            </a-tooltip>
                          </span>
                            <a-select v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]" size="large">
                                <a-select-option :key="option.value" :value="option.value" v-for="option in field.values">
                                    {{option.name_t}}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'multiselect'">
                        <a-form-item :key="field.field_key">
                  <span slot="label">
                    {{field.label_t}}
                    <a-tooltip>
                        <template slot="title">
                            <span v-html="field.help_t"></span>
                        </template>
                      <a-icon type="question-circle-o"/>
                    </a-tooltip>
                  </span>
                            <a-select v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]" mode="multiple" size="large">
                                <a-select-option :key="option.value" :value="option.value" v-for="option in field.values">
                                    {{option.name_t}}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'text'">
                        <a-form-item :key="field.field_key">
                            <a-input v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]" size="large" :placeholder="field.placeholder_t">
                                <a-tooltip slot="addonAfter">
                                    <template slot="title">
                                        <span v-html="field.help_t"></span>
                                    </template>
                                    <a-icon type="question-circle-o"/>
                                </a-tooltip>
                            </a-input>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'suggest'">
                        <a-form-item :key="field.field_key">
                            <a-auto-complete :placeholder="field.placeholder_t" v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]">
                                <a-tooltip slot="addonAfter">
                                    <template slot="title">
                                        <span v-html="field.help_t"></span>
                                    </template>
                                    <a-icon type="question-circle-o"/>
                                </a-tooltip>
                            </a-auto-complete>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'textarea'">
                        <a-form-item :key="field.field_key">
                  <span slot="label">
                    {{field.label_t}}
                    <a-tooltip>
                        <template slot="title">
                            <span v-html="field.help_t"></span>
                        </template>
                      <a-icon type="question-circle-o"/>
                    </a-tooltip>
                  </span>
                            <a-textarea :placeholder="field.placeholder_t" rows="4" v-decorator="[`${field.field_key}`, {initialValue: getValue(field.field_key)}]"/>
                        </a-form-item>
                    </template>
                    <template v-if="field.html_type === 'checkbox'">
                        <a-form-item :key="field.field_key">
                            <a-checkbox v-decorator="[`${field.field_key}`, { initialValue: getBooleanValue(field.field_key), valuePropName: 'checked' }]">{{field.label_t}}</a-checkbox>
                            <a-tooltip>
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                                <a-icon type="question-circle-o"/>
                            </a-tooltip>
                        </a-form-item>
                    </template>
                </div>
            </template>
        </div>
        <div class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-between">
            <a-button size="large" class="flex-grow m-1" @click="resetForm">Reset</a-button>
            <a-button size="large" type="primary" class="flex-grow m-1 text-black" @click="saveWorksite">Save</a-button>
            <a-button size="large" type="primary" class="flex-grow m-1 text-black" @click="claimAndSaveWorksite">Claim & Save</a-button>
        </div>
    </a-form>
</template>

<script>
    import Worksite from "@/models/Worksite";

    export default {
        props: {
            fields: Array,
            worksite: Object,
            reloadTable: Function,
        },
        name: "CaseForm",
        methods: {
            handleSubmit() {

            },
            async saveWorksite(reload = true) {
                if (this.location) {
                    this.worksite.location = {
                        type: "Point",
                        coordinates: [
                            this.location.coords.longitude, this.location.coords.latitude
                        ]
                    };
                }
                let field_data = this.form.getFieldsValue();
                this.worksite.form_data = Object.keys(field_data).map(
                    (key) => {
                        return {
                            field_key: key,
                            field_value: field_data[key]
                        }
                    }
                )
                if (this.worksite.id) {
                    await Worksite.api().put(`/worksites/${this.worksite.id}`, {...this.worksite, skip_duplicate_check: true})
                } else {
                    let worksite = await Worksite.api().post('/worksites', {...this.worksite, skip_duplicate_check: true})
                    this.worksite = worksite.entities.worksites[0];
                }
                this.$message.success('Worksite saved successfully');
                if (reload) {
                    this.reloadTable()
                }
            },
            async claimAndSaveWorksite() {
                await this.saveWorksite(false);
                await Worksite.api().claimWorksite(this.worksite.id, []);
                let worksite = await Worksite.api().fetchById(this.worksite.id);
                this.worksite = worksite.entities.worksites[0];
                this.$message.success('Worksite claimed successfully');
                this.reloadTable()
            },
            resetForm() {
                console.log(this.form.getFieldsValue())
            },
            getValue(field_key) {
                if (!this.worksite) {
                    return ''
                }

                let key = this.worksite.form_data.find((element) => {
                    return element.field_key === field_key;
                });
                if (key) {
                    return key['field_value']
                }
                return ''
            },
            getBooleanValue(field_key) {
                if (!this.worksite) {
                    return false
                }

                let key = this.worksite.form_data.find((element) => {
                    return element.field_key === field_key;
                });
                if (key) {
                    return key['field_value']
                }
                return false
            },
            async getLocation() {
                return new Promise((resolve, reject) => {
                    if(!("geolocation" in navigator)) {
                        reject(new Error('Geolocation is not available.'));
                    }
                    navigator.geolocation.getCurrentPosition(pos => {
                        resolve(pos);
                    }, err => {
                        reject(err);
                    });
                });
            },
            async locateMe() {
                this.gettingLocation = true;
                try {
                    this.gettingLocation = false;
                    this.location = await this.getLocation();

                    let response = await this.$http.request({
                        url: `https://api.what3words.com/v3/convert-to-3wa?coordinates=${this.location.coords.latitude}%2C${this.location.coords.longitude}&key=${process.env.VUE_APP_WHAT_3_WORDS_API_KEY}`,
                        method: 'GET',
                        transformRequest: [(data, headers) => {
                            delete headers.common.Authorization;
                            return data
                        }]
                    });
                    this.what3words = response.data.words;
                } catch(e) {
                    this.gettingLocation = false;
                    this.errorStr = e.message;
                }
            }
        },
        data() {
            return {
                form: this.$form.createForm(this),
                showAllFields: true,
                spinning: false,
                gettingLocation: false,
                location: null,
                what3words: null,
            };
        }
    }
</script>

<style scoped>
    .ant-form-item {
        padding-top: 10px;
        margin: 0;
    }

    .intake-form {
        height: 600px;
        overflow: scroll;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }

    .intake-form::-webkit-scrollbar { /* WebKit */
        width: 0;
        height: 0;
    }

    .card-footer {
        min-height: 80px;
    }

    h4 {
        font-size: 16px;
        font-weight: bold;
    }

    h5 {
        font-size: 12px;
        font-weight: bold;
    }
</style>