<template>
  <form
    v-if="ready"
    class="bg-white flex flex-col flex-grow w-full"
    @submit.prevent="handleSubmit"
  >
    <div class="intake-form flex-grow">
      <div
        class="py-3 px-3 bg-gray-200 flex items-center justify-between text-base font-semibold"
      >
        <div class="flex items-center">
          <badge width="22px" height="22px" class="mr-2 bg-black text-white"
            >1</badge
          >
          {{ $t('Basic Information') }}
        </div>
      </div>
      <div class="form-field">
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
      <div class="text-base font-semibold my-1 mx-3">
        {{ $t('Location') }}
      </div>
      <div class="form-field">
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
      <div class="form-field">
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
      <div class="form-field">
        <base-input
          :value="worksite.county"
          tooltip="info"
          size="large"
          :placeholder="$t('formLabels.county')"
          :break-glass="true"
          required
          @input="
            value => {
              updateWorksite(value, 'county');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
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
      <div class="form-field">
        <base-input
          :value="worksite.postal_code"
          tooltip="info"
          size="large"
          :placeholder="$t('formLabels.postal_code')"
          required
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
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
            icon="street-view"
            class="text-gray-700 pt-2"
            :action="locateMe"
            :text="$t('formLabels.use_my_location')"
          />
          <base-button
            type="bare"
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
      <template v-for="field in fields">
        <div
          v-if="showAllFields || getValue(field.field_key)"
          :key="field.field_key"
        >
          <template v-if="['h4'].includes(field.html_type)">
            <div
              class="py-3 px-3 bg-gray-200 flex items-center justify-between text-base font-semibold"
            >
              <div class="flex items-center">
                <badge
                  class="mr-2 bg-black text-white"
                  width="22px"
                  height="22px"
                >
                  {{ getSectionCount(field) }}
                </badge>
                {{ field.label_t }}
              </div>
              <ccu-icon
                v-tooltip="{
                  content: field.help_t,
                  trigger: 'hover',
                  classes: 'interactive-tooltip w-72',
                }"
                :alt="$t('help')"
                type="help"
                size="large"
              />
            </div>
          </template>
          <template v-if="['h5'].includes(field.html_type)">
            <div class="text-base font-semibold my-1 mx-3">
              {{ field.label_t }}
            </div>
          </template>
          <template v-if="field.html_type === 'select'">
            <div :key="field.field_key" class="form-field">
              <span slot="label" class="flex items-center">
                <span>{{ field.label_t }}</span>
                <ccu-icon
                  v-tooltip="{
                    content: field.help_t,
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('help')"
                  type="help"
                  size="large"
                />
              </span>
              <form-select
                :value="worksite.formFields[field.field_key]"
                :options="field.values"
                item-key="value"
                label="name_t"
                select-classes="h-12 border"
                @input="
                  value => {
                    dynamicFields[field.field_key] = value;
                  }
                "
              />
            </div>
          </template>
          <template v-if="field.html_type === 'multiselect'">
            <div :key="field.field_key" class="form-field">
              <span slot="label" class="flex items-center">
                <span>{{ field.label_t }}</span>
                <ccu-icon
                  v-tooltip="{
                    content: field.help_t,
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('help')"
                  type="help"
                  size="large"
                />
              </span>
              <form-select
                :value="worksite.formFields[field.field_key]"
                multiple
                :options="field.values"
                item-key="value"
                label="name_t"
                select-classes="h-12 border"
                @input="
                  value => {
                    dynamicFields[field.field_key] = value;
                  }
                "
              />
            </div>
          </template>
          <template v-if="field.html_type === 'text'">
            <div :key="field.field_key" class="form-field">
              <base-input
                :value="worksite.formFields[field.field_key]"
                tooltip="info"
                size="large"
                :break-glass="field.read_only_break_glass"
                :placeholder="field.placeholder_t || field.label_t"
                @input="
                  value => {
                    dynamicFields[field.field_key] = value;
                  }
                "
              />
            </div>
          </template>
          <template v-if="field.html_type === 'suggest'">
            <div :key="field.field_key" class="form-field">
              <autocomplete
                v-model="dynamicFields[field.field_key]"
                :default-value="getValue(field.field_key)"
                tooltip="info"
                display-property="description"
                :placeholder="field.placeholder_t || field.label_t"
              />
            </div>
          </template>
          <template v-if="field.html_type === 'textarea'">
            <div :key="field.field_key" class="form-field">
              <span slot="label" class="flex items-center">
                <span>{{ field.label_t }}</span>
                <ccu-icon
                  v-tooltip="{
                    content: field.help_t,
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('help')"
                  type="help"
                  size="large"
                />
              </span>
              <textarea
                class="block w-full border outline-none"
                :placeholder="field.placeholder_t || field.label_t"
                rows="4"
                :value="worksite.formFields[field.field_key]"
                @input="
                  e => {
                    dynamicFields[field.field_key] = e.target.value;
                  }
                "
              />
            </div>
          </template>
          <template v-if="field.html_type === 'checkbox'">
            <div :key="field.field_key" class="form-field flex items-center">
              <base-checkbox
                :value="worksite.formFields[field.field_key]"
                @input="
                  value => {
                    dynamicFields[field.field_key] = value;
                  }
                "
                >{{ field.label_t }}
              </base-checkbox>
              <ccu-icon
                v-tooltip="{
                  content: field.help_t,
                  trigger: 'hover',
                  classes: 'interactive-tooltip w-72',
                }"
                :alt="$t('help')"
                type="help"
                size="large"
              />
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
  <div v-else class="flex items-center justify-center h-full">
    <spinner />
  </div>
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
      showAllFields: true,
      ready: false,
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
      sectionCounter: 2,
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
    this.ready = false;
    if (this.$route.params.id) {
      try {
        await Worksite.api().fetch(
          this.$route.params.id,
          this.$route.params.incident_id,
        );
      } catch (e) {
        await this.$router.push(
          `/incident/${this.$route.params.incident_id}/cases/new`,
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
        formFields: {},
      };
    }
    this.dynamicFields = {
      ...this.worksite.form_data.map(s => ({ [s.field_key]: s.field_value })),
    };
    this.ready = true;
  },
  methods: {
    handleSubmit() {},
    getSectionCount(currentField) {
      let sectionNumber = 1;
      for (let i = 0; i < this.fields.length; i++) {
        const field = this.fields[i];
        if (field.html_type === 'h4') {
          sectionNumber++;
        }
        if (currentField === field) {
          break;
        }
      }
      return sectionNumber;
    },
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
        await this.$toasted.success(this.$t('Worksite saved successfully'));
        if (reload) {
          this.$emit('reloadTable');
          this.$emit('reloadMap', this.worksite.id);
          await this.$router.push(
            `/incident/${this.$route.params.incident_id}/cases/${this.worksite.id}`,
          );
        }
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
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
        await this.$toasted.success(this.$t('Worksite claimed successfully'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
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
        this.$log.debug(`${field_key}:${key.field_value}`);

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

.form-field {
  @apply py-1 mx-3;
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
