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
                <a-input disabled="" v-model="worksite.what3words" size="large" placeholder="Location">
                    <a-tooltip slot="addonAfter">
                        <template slot="title">
                            <span v-html=""></span>
                        </template>
                        <a-icon type="question-circle-o"/>
                    </a-tooltip>
                </a-input>
                <div class="flex justify-around items-center">
                    <BaseButton type="link" size="large" icon="street-view" class="text-gray-700 pt-2" :action="locateMe" title="Use my location" />
                    <BaseButton type="link" size="large" icon="map" class="text-gray-700 pt-2" :action="showOverlayMap" title="Select on Map" />
                    <a-modal :closable="false" title="" v-model="overlayMapVisible" @ok="handleOk">
                        <OverlayMap @addedMarker="onAddedMarker" />
                    </a-modal>
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
<!--                <a-auto-complete-->
<!--                        :dataSource="[]"-->
<!--                        style="width: 200px"-->
<!--                        @select="onSelect"-->
<!--                        @search="geocoderSearch"-->
<!--                        placeholder="input here"-->
<!--                        v-model="worksite.address"-->
<!--                />-->
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
                                <template slot="suffixIcon">
                                    <font-awesome-icon size="sm" icon="sort" />
                                </template>
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
                                <template slot="suffixIcon">
                                    <font-awesome-icon size="sm" icon="sort" />
                                </template>
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
            <BaseButton size="medium" class="flex-grow m-1 border-2 border-black" :action="resetForm" title="Reset"></BaseButton>
            <BaseButton size="medium" type="primary" class="flex-grow m-1 text-black" :action="saveWorksite" title="Save"></BaseButton>
            <BaseButton size="medium" type="primary" class="flex-grow m-1 text-black" :action="claimAndSaveWorksite" title="Claim & Save"></BaseButton>
        </div>
    </a-form>
</template>

<script>
    import Worksite from "@/models/Worksite";
    import OverlayMap from "@/components/OverlayMap";
    import BaseButton from "@/components/BaseButton";
    import GeocoderService from "@/services/geocoder.service"

    export default {
        props: {
            fields: Array,
            worksite: Object,
            reloadTable: Function,
        },
        components: {
            BaseButton,
            OverlayMap
        },
        name: "CaseForm",
        data() {
            return {
                form: this.$form.createForm(this),
                showAllFields: true,
                spinning: false,
                gettingLocation: false,
                location: null,
                what3words: null,
                overlayMapVisible: false,
                overlayMapLocation: null,
                geocoderResults: []
            };
        },
        methods: {
            handleSubmit() {

            },
            async geocoderSearch(value) {
                this.geocoderResults = await GeocoderService.getMatchingAddresses(value, 'US');
            },
            async handleOk() {
                this.overlayMapVisible = false;
                if (this.overlayMapLocation) {
                    this.worksite.location = {
                        type: "Point",
                        coordinates: [
                            this.overlayMapLocation.lng, this.overlayMapLocation.lat
                        ]
                    };

                    let response = await this.$http.request({
                        url: `https://api.what3words.com/v3/convert-to-3wa?coordinates=${this.overlayMapLocation.lat}%2C${this.overlayMapLocation.lng}&key=${process.env.VUE_APP_WHAT_3_WORDS_API_KEY}`,
                        method: 'GET',
                        transformRequest: [(data, headers) => {
                            delete headers.common.Authorization;
                            return data
                        }]
                    });
                    this.worksite.what3words = response.data.words;
                }
            },
            onAddedMarker(value) {
                this.overlayMapLocation = value;
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

                const truthy_values = Object.keys(field_data).filter(
                    (key) => {
                        return Boolean(field_data[key])
                    }
                );

                this.worksite.form_data = truthy_values.map(
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
                try {
                    let claim_status = await Worksite.api().claimWorksite(this.worksite.id, []);
                    console.log(claim_status);
                    this.$message.success('Worksite claimed successfully');
                } catch (error) {
                    this.$message.error(error.response.data.errors[0].message[0]);
                }
                let worksite = await Worksite.api().fetchById(this.worksite.id);
                this.worksite = worksite.entities.worksites[0];
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
            showOverlayMap() {
                this.overlayMapVisible = true;
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
                    this.worksite.what3words = response.data.words;
                } catch(e) {
                    this.gettingLocation = false;
                    this.errorStr = e.message;
                }
            }
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