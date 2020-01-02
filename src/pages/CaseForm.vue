<template>
  <form
    ref="form"
    layout="vertical"
    class="bg-white flex flex-col flex-grow"
    @submit.prevent="handleSubmit"
  >
    <div class="intake-form p-3 flex-grow">
      <h4 class="py-3 m-1 border-t border-b flex items-center justify-between">
        <div class="flex items-center">
          <badge
            width="20px"
            height="20px"
            class="mr-2 bg-primary-light text-black"
            >1</badge
          >
          {{ $t('Basic Information') }}
        </div>
      </h4>
      <div class="py-1">
        <base-input
          :value="worksite.what3words"
          tooltip="info"
          size="large"
          :placeholder="$t('formLabels.location')"
          required
          disabled
          @input="
            value => {
              updateWorksite(value, 'what3words');
            }
          "
        />

        <div class="flex justify-around items-center">
          <base-button
            type="bare"
            size="large"
            icon="street-view"
            class="text-gray-700 pt-2"
            :action="locateMe"
            :text="$t('formLabels.use_my_location')"
          />
          <base-button
            type="bare"
            size="large"
            icon="map"
            class="text-gray-700 pt-2"
            :action="showOverlayMap"
            :text="$t('formLabels.select_on_map')"
          />
          <modal
            v-if="overlayMapVisible"
            modal-classes="bg-white w-1/3 shadow"
            modal-style="height: 60%"
            @close="overlayMapVisible = false"
          >
            >
            <OverlayMap
              :initial-location="this.worksite.location"
              @addedMarker="onAddedMarker"
            />
            <div
              slot="footer"
              class="flex items-center justify-center p-2 bg-white"
            >
              <base-button
                :text="$t('actions.save')"
                size="medium"
                class="m-1 p-1 px-6"
                type="primary"
                :action="handleOk"
              />
            </div>
          </modal>
        </div>
      </div>
      <div class="py-1">
        <WorksiteSearchInput
          :value="worksite.name"
          tooltip="info"
          :suggestions="[
            {
              name: 'worksites',
              data: searchWorksitesNameResults || [],
              key: 'name',
            },
          ]"
          display-property="name"
          :placeholder="$t('formLabels.name')"
          size="large"
          required
          @input="
            value => {
              updateWorksite(value, 'name');
            }
          "
          @selectedExisting="onWorksiteSelect"
          @search="worksitesSearch"
        />
      </div>
      <div class="py-1">
        <WorksiteSearchInput
          :value="worksite.address"
          tooltip="info"
          :suggestions="[
            {
              name: 'worksites',
              data: searchWorksitesResults || [],
              key: 'address',
            },
            {
              name: 'geocoder',
              data: geocoderResults || [],
              key: 'description',
            },
          ]"
          display-property="description"
          :placeholder="$t('formLabels.address')"
          size="large"
          required
          @input="
            value => {
              updateWorksite(value, 'address');
            }
          "
          @selectedExisting="onWorksiteSelect"
          @selectedGeocode="onGeocodeSelect"
          @search="geocoderSearch"
        />
      </div>
      <div class="py-1">
        <base-input
          :value="worksite.city"
          tooltip="info"
          size="large"
          :placeholder="$t('formLabels.city')"
          required
          @input="
            value => {
              updateWorksite(value, 'city');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="py-1">
        <base-input
          :value="worksite.county"
          tooltip="info"
          size="large"
          :placeholder="$t('formLabels.county')"
          required
          @input="
            value => {
              updateWorksite(value, 'county');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="py-1">
        <base-input
          :value="worksite.state"
          tooltip="info"
          size="large"
          :placeholder="$t('formLabels.state')"
          required
          @input="
            value => {
              updateWorksite(value, 'state');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="py-1">
        <base-input
          :value="worksite.postal_code"
          tooltip="info"
          size="large"
          :placeholder="$t('formLabels.postal_code')"
          required
          @change="findPotentialGeocode"
        />
      </div>
      <template v-for="field in this.fields">
        <div
          v-if="showAllFields || getValue(field.field_key)"
          :key="field.field_key"
        >
          <template v-if="['h4'].includes(field.html_type)">
            <component
              :is="field.html_type"
              :key="field.field_key"
              class="py-3 m-1 border-t border-b flex items-center justify-between"
            >
              <div class="flex items-center">
                <badge
                  class="mr-2 bg-primary-light text-black"
                  width="20px"
                  height="20px"
                >
                  {{ field.list_order }}
                </badge>
                {{ field.label_t }}
              </div>
              <a-tooltip>
                <template slot="title">
                  <span v-html="field.help_t"></span>
                </template>
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </component>
          </template>
          <template v-if="['h5'].includes(field.html_type)">
            <component :is="field.html_type" :key="field.field_key">
              {{ field.label_t }}
            </component>
          </template>
          <template v-if="field.html_type === 'select'">
            <div :key="field.field_key" class="py-1">
              <span slot="label" class="flex items-center">
                <span>{{ field.label_t }}</span>
                <a-tooltip class="px-1">
                  <template slot="title">
                    <span v-html="field.help_t"></span>
                  </template>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <form-select
                v-model="dynamicFields[field.field_key]"
                :value="field.values.find(val => getValue(field.field_key))"
                :options="field.values"
                item-key="value"
                label="name_t"
              />
            </div>
          </template>
          <template v-if="field.html_type === 'multiselect'">
            <div :key="field.field_key" class="py-1">
              <span slot="label" class="flex items-center">
                <span>{{ field.label_t }}</span>
                <a-tooltip class="px-1">
                  <template slot="title">
                    <span v-html="field.help_t"></span>
                  </template>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-select
                v-model="dynamicFields[field.field_key]"
                :default-value="getValue(field.field_key)"
                mode="multiple"
                size="large"
              >
                <a-select-option
                  v-for="option in field.values"
                  :key="option.value"
                  :value="option.value"
                >
                  >
                  {{ option.name_t }}
                </a-select-option>
                <template slot="suffixIcon">
                  <font-awesome-icon size="sm" icon="sort" />
                </template>
              </a-select>
            </div>
          </template>
          <template v-if="field.html_type === 'text'">
            <div :key="field.field_key" class="py-1">
              <base-input
                v-model="dynamicFields[field.field_key]"
                :value="getValue(field.field_key)"
                tooltip="info"
                size="large"
                :placeholder="field.placeholder_t || field.label_t"
              ></base-input>
            </div>
          </template>
          <template v-if="field.html_type === 'suggest'">
            <div :key="field.field_key" class="py-1">
              <autocomplete
                v-model="dynamicFields[field.field_key]"
                :default-value="getValue(field.field_key)"
                tooltip="info"
                display-property="description"
                :placeholder="field.placeholder_t || field.label_t"
              ></autocomplete>
            </div>
          </template>
          <template v-if="field.html_type === 'textarea'">
            <div :key="field.field_key" class="py-1">
              <span slot="label" class="flex items-center">
                <span>{{ field.label_t }}</span>
                <a-tooltip class="px-1">
                  <template slot="title">
                    <span v-html="field.help_t"></span>
                  </template>
                  <a-icon type="question-circle-o" />
                </a-tooltip>
              </span>
              <a-textarea
                v-model="dynamicFields[field.field_key]"
                :placeholder="field.placeholder_t || field.label_t"
                rows="4"
                :default-value="getValue(field.field_key)"
              />
            </div>
          </template>
          <template v-if="field.html_type === 'checkbox'">
            <div :key="field.field_key" class="py-1 flex items-center">
              <base-checkbox
                v-model="dynamicFields[field.field_key]"
                :value="getBooleanValue(field.field_key)"
                >{{ field.label_t }}
              </base-checkbox>
              <a-tooltip class="px-1">
                <template slot="title">
                  <span v-html="field.help_t"></span>
                </template>
                <a-icon type="question-circle-o" />
              </a-tooltip>
            </div>
          </template>
        </div>
      </template>
    </div>
    <div
      class="bg-white p-3 border border-r-0 border-gray-300 card-footer flex justify-between"
    >
      <base-button
        size="medium"
        class="flex-grow m-1 border-2 border-black"
        :action="
          () => {
            $emit('closeWorksite');
          }
        "
        :text="$t('actions.cancel')"
      />
      <base-button
        size="medium"
        type="primary"
        class="flex-grow m-1 text-black"
        :action="saveWorksite"
        :text="$t('actions.save')"
      />
      <base-button
        size="medium"
        type="primary"
        class="flex-grow m-1 text-black"
        :action="claimAndSaveWorksite"
        :text="$t('actions.save_claim')"
      />
    </div>
  </form>
</template>

<script>
import Worksite from '@/models/Worksite';
import OverlayMap from '@/components/OverlayMap';
import GeocoderService from '@/services/geocoder.service';
import { What3wordsService } from '@/services/what3words.service';
import { getErrorMessage } from '@/utils/errors';
import WorksiteSearchInput from '@/components/WorksiteSearchInput';
import Incident from '@/models/Incident';
import { buildForm, groupBy } from '@/utils/form';
import FormSelect from '@/components/FormSelect';

export default {
  name: 'CaseForm',
  components: {
    FormSelect,
    OverlayMap,
    WorksiteSearchInput,
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
      searchWorksitesNameResults: [],
      worksite: {},
      dynamicFields: {},
    };
  },
  computed: {
    fields() {
      if (this.currentIncident && this.currentIncident.form_fields) {
        const formFields = this.currentIncident.form_fields;
        const returnArray = [];
        buildForm(null, groupBy('field_parent_key')(formFields), returnArray);
        return returnArray;
      }
      return [];
    },
    currentIncident() {
      return Incident.find(this.$route.params.incident_id);
    },
    fieldsArray() {
      return this.fields.map(field => field.field_key);
    },
  },
  async mounted() {
    if (this.$route.params.id) {
      try {
        await Worksite.api().fetch(
          this.$route.params.id,
          this.$route.params.incident_id,
        );
      } catch (e) {
        await this.$router.push(
          `/incident/${this.$route.params.incident_id}/cases`,
        );
      }
      this.worksite = Worksite.find(this.$route.params.id);
      if (this.$route.query.showOnMap) {
        this.$emit('jumpToCase', this.$route.params.id);
      }
    } else {
      this.worksite = {
        incident: this.$route.params.incident_id,
        form_data: [],
      };
    }
    this.dynamicFields = {
      ...this.worksite.form_data.map(s => ({ [s.field_key]: s.field_value })),
    };
  },
  methods: {
    handleSubmit() {},
    updateWorksite(value, key) {
      if (this.worksite.id) {
        Worksite.update({
          where: this.worksite.id,
          data: {
            [key]: value,
          },
        });
        this.worksite = Worksite.find(this.worksite.id);
      } else {
        this.worksite[key] = value;
        this.worksite = { ...this.worksite };
      }
    },
    async findPotentialGeocode() {
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      const nonEmptyKeys = geocodeKeys.filter(key =>
        Boolean(this.worksite[key]),
      );
      if (nonEmptyKeys.length > 1) {
        const values = nonEmptyKeys.map(key => this.worksite[key]);
        const address = values.join(', ');
        const geocode = await GeocoderService.getPlaceDetails(address);
        geocodeKeys.forEach(key =>
          this.updateWorksite(geocode.address_components[key], key),
        );
        const { lat, lng } = geocode.location;
        this.updateWorksite(
          {
            type: 'Point',
            coordinates: [lng, lat],
          },
          'location',
        );
        const what3words = await What3wordsService.getWords(lat, lng);
        this.updateWorksite(what3words, 'what3words');
        this.$emit('geocoded', geocode.location);
      }
    },
    async onGeocodeSelect(value) {
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      const geocode = await GeocoderService.getPlaceDetails(value.description);
      geocodeKeys.forEach(key =>
        this.updateWorksite(geocode.address_components[key], key),
      );
      const { lat, lng } = geocode.location;
      this.updateWorksite(
        {
          type: 'Point',
          coordinates: [lng, lat],
        },
        'location',
      );
      const what3words = await What3wordsService.getWords(lat, lng);
      this.updateWorksite(what3words, 'what3words');
      this.$emit('geocoded', geocode.location);
    },
    async onWorksiteSelect(value) {
      this.$emit('navigateToWorksite', value.id);
    },
    async geocoderSearch(value) {
      this.geocoderResults = await GeocoderService.getMatchingAddressesGoogle(
        value,
      );
      const searchWorksites = await Worksite.api().searchWorksites(
        value,
        this.$route.params.incident_id,
      );
      this.searchWorksitesResults = searchWorksites.entities.worksites;
    },
    async worksitesSearch(value) {
      const searchWorksites = await Worksite.api().searchWorksites(
        value,
        this.$route.params.incident_id,
      );
      this.searchWorksitesNameResults = searchWorksites.entities.worksites;
    },
    async handleOk() {
      this.overlayMapVisible = false;
      if (this.overlayMapLocation) {
        const { lat, lng } = this.overlayMapLocation;
        this.updateWorksite(
          {
            type: 'Point',
            coordinates: [lng, lat],
          },
          'location',
        );
        const what3words = await What3wordsService.getWords(lat, lng);
        this.updateWorksite(what3words, 'what3words');
      }
    },
    onAddedMarker(value) {
      this.overlayMapLocation = value;
    },
    async saveWorksite(reload = true) {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }

      if (this.location) {
        this.updateWorksite(
          {
            type: 'Point',
            coordinates: [
              this.location.coords.longitude,
              this.location.coords.latitude,
            ],
          },
          'location',
        );

        const what3words = await What3wordsService.getWords(
          this.location.coords.latitude,
          this.location.coords.longitude,
        );
        this.updateWorksite(what3words, 'what3words');
      }
      const field_data = this.dynamicFields;

      const truthy_values = Object.keys(field_data).filter(key => {
        return Boolean(field_data[key]) && this.fieldsArray.includes(key);
      });

      const form_data = truthy_values.map(key => {
        return {
          field_key: key,
          field_value: field_data[key],
        };
      });

      this.updateWorksite(form_data, 'form_data');

      try {
        if (this.worksite.id) {
          await Worksite.api().put(`/worksites/${this.worksite.id}`, {
            ...this.worksite,
            skip_duplicate_check: true,
          });
        } else {
          const savedWorksite = await Worksite.api().post('/worksites', {
            ...this.worksite,
            skip_duplicate_check: true,
          });
          this.worksite = Worksite.find(savedWorksite.entities.worksites[0].id);
        }
        await this.$message.success(this.$t('Worksite saved successfully'));
        if (reload) {
          this.$emit('reloadTable');
          this.$emit('reloadMap', this.worksite.id);
          await this.$router.push(
            `/incident/${this.$route.params.incident_id}/cases/${this.worksite.id}`,
          );
        }
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      }
    },
    async claimAndSaveWorksite() {
      await this.saveWorksite(false);
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }
      try {
        await Worksite.api().claimWorksite(this.worksite.id, []);
        await this.$message.success(this.$t('Worksite claimed successfully'));
      } catch (error) {
        await this.$message.error(getErrorMessage(error));
      }
      await Worksite.api().fetch(this.worksite.id);
      this.worksite = Worksite.find(this.worksite.id);
      this.$emit('reloadTable');
      this.$emit('reloadMap', this.worksite.id);
      await this.$router.push(
        `/incident/${this.$route.params.incident_id}/cases/${this.worksite.id}`,
      );
    },
    resetForm() {
      this.worksite = new Worksite({
        incident: this.$route.params.incident_id,
        form_data: [],
      });
    },
    getValue(field_key) {
      if (!this.worksite || !this.worksite.form_data) {
        return '';
      }

      const key = this.worksite.form_data.find(element => {
        return element.field_key === field_key;
      });
      if (key) {
        return key.field_value;
      }
      return '';
    },
    getSelectValue(field_key) {
      if (!this.worksite || !this.worksite.form_data) {
        return '';
      }

      const key = this.worksite.form_data.find(element => {
        return element.field_key === field_key;
      });
      if (key) {
        const currentField = this.fields.find(field => {
          return field.field_key === field_key;
        });

        return currentField.values.find(field => {
          return field.value === key.field_value;
        });
      }
      return '';
    },
    getBooleanValue(field_key) {
      if (!this.worksite || !this.worksite.form_data) {
        return '';
      }

      const key = this.worksite.form_data.find(element => {
        return element.field_key === field_key;
      });
      if (key) {
        return key.field_value;
      }
      return false;
    },
    showOverlayMap() {
      this.overlayMapVisible = true;
      return false;
    },
    async getLocation() {
      return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error('Geolocation is not available.'));
        }
        navigator.geolocation.getCurrentPosition(
          pos => {
            resolve(pos);
          },
          err => {
            reject(err);
          },
        );
      });
    },
    async locateMe() {
      this.gettingLocation = true;
      try {
        this.gettingLocation = false;
        this.location = await this.getLocation();
        const what3words = await What3wordsService.getWords(
          this.location.coords.latitude,
          this.location.coords.longitude,
        );
        this.updateWorksite(what3words, 'what3words');
      } catch (e) {
        this.gettingLocation = false;
        this.errorStr = e.message;
      }
    },
  },
};
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

.intake-form::-webkit-scrollbar {
  /* WebKit */
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
