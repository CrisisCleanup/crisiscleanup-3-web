<template>
    <form ref="form" @submit.prevent="handleSubmit" layout="vertical" class="bg-white flex flex-col flex-grow">
        <div class="intake-form p-3 flex-grow">
            <h4 class="py-3 m-1 border-t border-b flex items-center justify-between">
                <div class="flex items-center">
                    <a-badge :count="1" class="mr-2 bg-primary-light text-black"/>
                    Basic Information
                </div>
            </h4>
            <div class="py-1">
                <base-input :value="worksite.what3words" @input="(value) => { updateWorksite(value,'what3words') }" tooltip="info" size="large" placeholder="Location" required disabled></base-input>

                <div class="flex justify-around items-center">
                    <base-button type="bare" size="large" icon="street-view" class="text-gray-700 pt-2" :action="locateMe"
                                 text="Use my location"/>
                    <base-button type="bare" size="large" icon="map" class="text-gray-700 pt-2" :action="showOverlayMap"
                                 text="Select on Map"/>
                    <modal v-if="overlayMapVisible" @close="overlayMapVisible = false" modal-classes="bg-white w-1/3 shadow" modal-style="height: 60%">
                        <OverlayMap @addedMarker="onAddedMarker" :initial-location="this.worksite.location" />
                        <div slot="footer" class="flex items-center justify-center p-2 bg-white">
                            <base-button text="Save" size="medium" class="m-1 p-1 px-6" type="primary" :action="handleOk"></base-button>
                        </div>
                    </modal>
                </div>
            </div>
            <div class="py-1">
                <base-input :value="worksite.name" @input="(value) => { updateWorksite(value,'name') }" tooltip="info" size="large" placeholder="Name" required></base-input>
            </div>
            <div class="py-1">
                <AddressGeocoder :value="worksite.address" @input="(value) => { updateWorksite(value,'address') }"
                              @selectedExisting="onWorksiteSelect" @selectedGeocode="onGeocodeSelect" @search="geocoderSearch" tooltip="info"
                              :suggestions="[{name:'worksites', data: searchWorksitesResults || [], key: 'address' }, {name:'geocoder', data: geocoderResults || [], key: 'description' }]"
                              display-property="description" placeholder="Address" size="large" required/>
            </div>
            <div class="py-1">
                <base-input :value="worksite.city" @input="(value) => { updateWorksite(value,'city') }" tooltip="info" size="large" placeholder="City" required @change="findPotentialGeocode"></base-input>
            </div>
            <div class="py-1">
                <base-input :value="worksite.county" @input="(value) => { updateWorksite(value,'county') }" tooltip="info" size="large" placeholder="County" required @change="findPotentialGeocode"></base-input>
            </div>
            <div class="py-1">
                <base-input :value="worksite.state" @input="(value) => { updateWorksite(value,'state') }" tooltip="info" size="large" placeholder="State" required @change="findPotentialGeocode"></base-input>
            </div>
            <div class="py-1">
                <base-input :value="worksite.postal_code" tooltip="info" size="large" placeholder="Postal Code" required @change="findPotentialGeocode"></base-input>
            </div>
            <template v-for="field in this.fields">
                <div :key="field.field_key" v-if="showAllFields || getValue(field.field_key)">
                    <template v-if="['h4'].includes(field.html_type)">
                        <component :is="field.html_type" :key="field.field_key"
                                   class="py-3 m-1 border-t border-b flex items-center justify-between">
                            <div class="flex items-center">
                                <a-badge :count="field.list_order" class="mr-2 bg-primary-light text-black"/>
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
                        <div class="py-1" :key="field.field_key">
                          <span slot="label" class="flex items-center">
                            <span>{{field.label_t}}</span>
                            <a-tooltip class="px-1">
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                              <a-icon type="question-circle-o"/>
                            </a-tooltip>
                          </span>
                            <a-select :defaultValue="getValue(field.field_key)" v-model="dynamicFields[field.field_key]" size="large">
                                <a-select-option :key="option.value" :value="option.value" v-for="option in field.values">
                                    {{option.name_t}}
                                </a-select-option>
                                <template slot="suffixIcon">
                                    <font-awesome-icon size="sm" icon="sort" />
                                </template>
                            </a-select>
                        </div>
                    </template>
                    <template v-if="field.html_type === 'multiselect'">
                        <div class="py-1" :key="field.field_key">
                          <span slot="label" class="flex items-center">
                    <span>{{field.label_t}}</span>
                            <a-tooltip class="px-1">
                        <template slot="title">
                            <span v-html="field.help_t"></span>
                        </template>
                      <a-icon type="question-circle-o"/>
                    </a-tooltip>
                  </span>
                            <a-select :defaultValue="getValue(field.field_key)" v-model="dynamicFields[field.field_key]" mode="multiple" size="large">
                                <a-select-option :key="option.value" :value="option.value" v-for="option in field.values">
                                    {{option.name_t}}
                                </a-select-option>
                                <template slot="suffixIcon">
                                    <font-awesome-icon size="sm" icon="sort" />
                                </template>
                            </a-select>
                        </div>
                    </template>
                    <template v-if="field.html_type === 'text'">
                        <div class="py-1" :key="field.field_key">
                            <base-input :value="getValue(field.field_key)" v-model="dynamicFields[field.field_key]" tooltip="info" size="large" :placeholder="field.placeholder_t"></base-input>
                        </div>
                    </template>
                    <template v-if="field.html_type === 'suggest'">
                        <div class="py-1" :key="field.field_key">
                            <autocomplete :defaultValue="getValue(field.field_key)" v-model="dynamicFields[field.field_key]" tooltip="info" display-property="description" :placeholder="field.placeholder_t"></autocomplete>
                        </div>
                    </template>
                    <template v-if="field.html_type === 'textarea'">
                        <div class="py-1" :key="field.field_key">
                            <span slot="label" class="flex items-center">
                    <span>{{field.label_t}}</span>
                            <a-tooltip class="px-1">
                        <template slot="title">
                            <span v-html="field.help_t"></span>
                        </template>
                      <a-icon type="question-circle-o"/>
                    </a-tooltip>
                  </span>
                            <a-textarea :placeholder="field.placeholder_t" rows="4" :defaultValue="getValue(field.field_key)" v-model="dynamicFields[field.field_key]"/>
                        </div>
                    </template>
                    <template v-if="field.html_type === 'checkbox'">
                        <div class="py-1 flex items-center" :key="field.field_key">
                            <base-checkbox :value="getBooleanValue(field.field_key)" v-model="dynamicFields[field.field_key]">{{field.label_t}}</base-checkbox>
                            <a-tooltip class="px-1">
                                <template slot="title">
                                    <span v-html="field.help_t"></span>
                                </template>
                                <a-icon type="question-circle-o"/>
                            </a-tooltip>
                        </div>
                    </template>
                </div>
            </template>
        </div>
        <div class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-between">
            <base-button size="medium" class="flex-grow m-1 border-2 border-black" :action="() => { $emit('closeWorksite') }" text="Cancel"/>
            <base-button size="medium" type="primary" class="flex-grow m-1 text-black" :action="saveWorksite" text="Save"/>
            <base-button size="medium" type="primary" class="flex-grow m-1 text-black" :action="claimAndSaveWorksite" text="Claim & Save"/>
        </div>
    </form>
</template>

<script>
    import Worksite from "@/models/Worksite";
    import OverlayMap from "@/components/OverlayMap";
    import GeocoderService from "@/services/geocoder.service"
    import { What3wordsService } from "@/services/what3words.service";
    import {getErrorMessage} from "@/utils/errors";
    import AddressGeocoder from "@/components/AddressGeocoder";

    export default {
        props: {
            fields: Array,
            worksiteId: String,
            reloadTable: Function, //TODO: replace with action
            incident: Object,
        },
        components: {
            OverlayMap,
            AddressGeocoder
        },
        name: "CaseForm",
        mounted() {
            if (this.worksiteId) {
                this.worksite = Worksite.find(this.worksiteId)
            } else {
                this.worksite = {
                    incident: this.incident.id,
                    form_data: []
                }
            }
            this.dynamicFields = Object.assign({}, ...this.worksite.form_data.map(s => ({[s.field_key]: s.field_value})));
        },
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
                geocoderResults: [],
                searchWorksitesResults: [],
                worksite: {},
                dynamicFields: {

                }
            };
        },
        computed: {
          fieldsArray() {
              return  this.fields.map(field => field.field_key);
          }
        },
        methods: {
            handleSubmit() {

            },
            updateWorksite(value, key) {
                if (this.worksiteId) {
                    Worksite.update({
                        where: this.worksite.id,
                        data: {
                            [key]: value
                        },
                    });
                    this.worksite = Worksite.find(this.worksite.id);
                } else {
                    this.worksite[key] = value;
                    this.worksite = { ...this.worksite };
                }
            },
            async findPotentialGeocode() {
                let geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
                let nonEmptyKeys = geocodeKeys.filter(key => Boolean(this.worksite[key]));
                if (nonEmptyKeys.length > 1) {
                    let values = nonEmptyKeys.map(key => this.worksite[key]);
                    let address = values.join(', ');
                    let geocode = await GeocoderService.getPlaceDetails(address);
                    geocodeKeys.forEach((key) => this.updateWorksite(geocode.address_components[key], key));
                    const { lat, lng } = geocode.location;
                    this.updateWorksite({
                        type: "Point",
                        coordinates: [
                            lng, lat
                        ]
                    }, 'location');
                    const what3words = await What3wordsService.getWords(lat, lng);
                    this.updateWorksite(what3words, 'what3words');
                    this.$emit('geocoded', geocode.location)
                }
            },
            async onGeocodeSelect(value) {
                let geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
                let geocode = await GeocoderService.getPlaceDetails(value.description);
                geocodeKeys.forEach((key) => this.updateWorksite(geocode.address_components[key], key));
                const { lat, lng } = geocode.location;
                this.updateWorksite({
                    type: "Point",
                    coordinates: [
                        lng, lat
                    ]
                }, 'location');
                const what3words = await What3wordsService.getWords(lat, lng);
                this.updateWorksite(what3words, 'what3words');
                this.$emit('geocoded', geocode.location)
            },
            async onWorksiteSelect(value) {
                this.$emit('savedWorksite', value.id)
            },
            async geocoderSearch(value) {
                this.geocoderResults = await GeocoderService.getMatchingAddressesGoogle(value);
                let searchWorksites = await Worksite.api().searchWorksites(value, this.incident.id);
                this.searchWorksitesResults = searchWorksites.entities.worksites;
            },
            async handleOk() {
                this.overlayMapVisible = false;
                if (this.overlayMapLocation) {
                    let { lat, lng } = this.overlayMapLocation;
                    this.updateWorksite({
                        type: "Point",
                        coordinates: [
                            lng, lat
                        ]
                    }, 'location');
                    const what3words = await What3wordsService.getWords(lat, lng);
                    this.updateWorksite(what3words, 'what3words');
                }
            },
            onAddedMarker(value) {
                this.overlayMapLocation = value;
            },
            async saveWorksite(reload = true) {
                let isValid = this.$refs.form.reportValidity();
                if (!isValid) {
                    return;
                }

                if (this.location) {
                    this.updateWorksite({
                        type: "Point",
                        coordinates: [
                            this.location.coords.longitude, this.location.coords.latitude
                        ]
                    }, 'location');

                    const what3words = await What3wordsService.getWords(this.location.coords.latitude, this.location.coords.longitude);
                    this.updateWorksite(what3words, 'what3words');
                }
                let field_data = this.dynamicFields;

                const truthy_values = Object.keys(field_data).filter(
                    (key) => {
                        return Boolean(field_data[key]) && this.fieldsArray.includes(key)
                    }
                );

                const form_data = truthy_values.map(
                    (key) => {
                        return {
                            field_key: key,
                            field_value: field_data[key]
                        }
                    }
                );

                this.updateWorksite(form_data, 'form_data');

                try {
                    if (this.worksite.id) {
                        await Worksite.api().put(`/worksites/${this.worksite.id}`, {
                            ...this.worksite,
                            skip_duplicate_check: true
                        })
                    } else {
                        let savedWorksite = await Worksite.api().post('/worksites', {...this.worksite, skip_duplicate_check: true});
                        this.worksite = Worksite.find(savedWorksite.entities.worksites[0].id);
                    }
                    await this.$message.success('Worksite saved successfully');
                    if (reload) {
                        this.reloadTable()
                        this.$emit('savedWorksite', this.worksite.id)
                    }
                } catch (error) {
                    await this.$message.error(getErrorMessage(error));
                }
            },
            async claimAndSaveWorksite() {
                await this.saveWorksite(false);
                let isValid = this.$refs.form.reportValidity();
                if (!isValid) {
                    return;
                }
                try {
                    await Worksite.api().claimWorksite(this.worksite.id, []);
                    await this.$message.success('Worksite claimed successfully');
                } catch (error) {
                    await this.$message.error(getErrorMessage(error));
                }
                await Worksite.api().fetchById(this.worksite.id);
                this.worksite = Worksite.find(this.worksite.id);
                this.reloadTable()
                this.$emit('savedWorksite', this.worksite.id)
            },
            resetForm() {
                this.worksite = new Worksite({incident: this.incident.id, form_data: []});
            },
            getValue(field_key) {
                if (!this.worksite || !this.worksite.form_data) {
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
                if (!this.worksite || !this.worksite.form_data) {
                    return ''
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
                return false;
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
                    const what3words = await What3wordsService.getWords(this.location.coords.latitude, this.location.coords.longitude);
                    this.updateWorksite(what3words, 'what3words');
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
        font-size: 14px;
        font-weight: bold;
    }
</style>