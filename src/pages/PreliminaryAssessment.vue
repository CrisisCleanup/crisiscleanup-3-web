<template>
  <form
    v-if="ready"
    ref="form"
    class="bg-white flex flex-col flex-grow w-full h-full border"
    @submit.prevent
  >
    <div class="intake-form flex-grow">
      <SectionHeading :count="1" class="mb-3">{{
        $t('caseForm.property_information')
      }}</SectionHeading>
      <section class="form-field">
        <base-input
          :value="pda.name"
          selector="js-pda-name"
          :placeholder="$t('formLabels.name')"
          size="large"
          :required="true"
          @input="
            value => {
              updatePda(value, 'name');
            }
          "
        />
      </section>
      <div class="form-field">
        <base-input
          :value="pda.phone1"
          selector="js-worksite-phone1"
          size="large"
          :placeholder="$t('formLabels.phone1')"
          @input="
            value => {
              updatePda(value, 'phone1');
            }
          "
        />
      </div>
      <div class="form-field" v-if="pda.phone2 || addAdditionalPhone">
        <base-input
          :value="pda.phone2"
          selector="js-worksite-phone2"
          size="large"
          :placeholder="$t('formLabels.phone2')"
          @input="
            value => {
              updatePda(value, 'phone2');
            }
          "
        />
      </div>
      <base-button
        v-else
        class="mx-3 text-primary-dark"
        type="link"
        :text="$t('~~caseView.add_phone')"
        :alt="$t('~~caseView.add_phone')"
        :action="
          () => {
            addAdditionalPhone = true;
          }
        "
      />
      <div class="form-field">
        <base-input
          :value="pda.email"
          selector="js-worksite-email"
          size="large"
          :placeholder="$t('formLabels.email')"
          @input="
            value => {
              updatePda(value, 'email');
            }
          "
        />
      </div>
      <div
        class="text-base font-semibold my-1 mx-3 flex justify-between items-center"
      >
        {{ $t('formLabels.location') }}
        <ccu-icon
          type="trash"
          size="small"
          :alt="$t('~Clear Location')"
          @click.native="clearLocationFields"
        />
      </div>
      <div class="form-field">
        <WorksiteSearchInput
          :value="pda.address"
          selector="js-worksite-address"
          :suggestions="[
            {
              name: 'geocoder',
              data: geocoderResults || [],
              key: 'description',
            },
          ]"
          @clearSuggestions="
            () => {
              geocoderResults = [];
            }
          "
          display-property="description"
          :placeholder="$t('formLabels.address')"
          size="large"
          :required="true"
          @input="
            value => {
              updatePda(value, 'address');
            }
          "
          @selectedGeocode="onGeocodeSelect"
          @search="geocoderSearch"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="pda.city"
          selector="js-worksite-city"
          size="large"
          :placeholder="$t('formLabels.city')"
          required
          @input="
            value => {
              updatePda(value, 'city');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="pda.county"
          selector="js-worksite-county"
          size="large"
          :placeholder="$t('formLabels.county')"
          :break-glass="true"
          required
          @input="
            value => {
              updatePda(value, 'county');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="pda.state"
          selector="js-worksite-state"
          size="large"
          :placeholder="$t('formLabels.state')"
          required
          @input="
            value => {
              updatePda(value, 'state');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="pda.postal_code"
          selector="js-worksite-postal-code"
          size="large"
          :placeholder="$t('formLabels.postal_code')"
          required
          @change="findPotentialGeocode"
        />
      </div>
      <template v-for="field in fields">
        <div :key="field.field_key">
          <template v-if="['h4'].includes(field.html_type)">
            <SectionHeading
              :count="getSectionCount(field)"
              :tooltip="field.help_t"
              class="mb-3"
              >{{ field.label_t }}</SectionHeading
            >
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
                  v-if="field.help_t"
                  v-tooltip="{
                    content: field.help_t,
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('actions.help_alt')"
                  type="help"
                  size="large"
                />
              </span>
              <form-select
                :value="pda.formFields[field.field_key]"
                :options="
                  field.values || getSelectValuesList(field.values_default_t)
                "
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
                  v-if="field.help_t"
                  v-tooltip="{
                    content: field.help_t,
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('actions.help_alt')"
                  type="help"
                  size="large"
                />
              </span>
              <form-select
                :value="pda.formFields[field.field_key]"
                multiple
                :options="
                  field.values || getSelectValuesList(field.values_default_t)
                "
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
                :value="pda.formFields[field.field_key]"
                :tooltip="field.help_t"
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
                  v-if="field.help_t"
                  v-tooltip="{
                    content: field.help_t,
                    trigger: 'hover',
                    classes: 'interactive-tooltip w-72',
                  }"
                  :alt="$t('actions.help_alt')"
                  type="help"
                  size="large"
                />
              </span>
              <textarea
                class="block w-full border outline-none"
                :placeholder="field.placeholder_t || field.label_t"
                rows="4"
                :value="pda.formFields[field.field_key]"
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
                :value="pda.formFields[field.field_key]"
                @input="
                  value => {
                    dynamicFields[field.field_key] = value;
                  }
                "
                >{{ field.label_t }}
              </base-checkbox>
              <ccu-icon
                v-if="field.help_t"
                v-tooltip="{
                  content: field.help_t,
                  trigger: 'hover',
                  classes: 'interactive-tooltip w-72',
                }"
                :alt="$t('actions.help_alt')"
                type="help"
                size="large"
              />
            </div>
          </template>
        </div>
      </template>
    </div>
    <div
      class="bg-white p-3 border-t border-gray-300 card-footer flex justify-between"
    >
      <base-button
        size="medium"
        class="flex-grow m-1 border-2 border-black"
        variant="text"
        :action="
          () => {
            $emit('closeWorksite');
          }
        "
        :text="$t('actions.cancel')"
      />
      <base-button
        size="medium"
        variant="solid"
        data-cy="worksite-formaction-save"
        class="flex-grow m-1 text-black"
        :action="savePda"
        :text="$t('actions.save')"
      />
    </div>
  </form>
  <div v-else class="flex items-center justify-center h-full">
    <spinner />
  </div>
</template>

<script>
import * as turf from '@turf/turf';
import Pda from '@/models/Pda';
import GeocoderService from '@/services/geocoder.service';
import { What3wordsService } from '@/services/what3words.service';
import { getErrorMessage } from '@/utils/errors';
import WorksiteSearchInput from '@/components/WorksiteSearchInput';
import Incident from '@/models/Incident';
import { buildForm, groupBy } from '@/utils/form';
import FormSelect from '@/components/FormSelect';
import SectionHeading from '../components/SectionHeading';

export default {
  name: 'PreliminaryAssessment',
  components: {
    SectionHeading,
    FormSelect,
    WorksiteSearchInput,
  },
  async mounted() {
    this.ready = false;
    await Incident.api().fetchById(this.$route.params.incident_id);
    this.ready = true;
  },
  data() {
    return {
      ready: false,
      gettingLocation: false,
      location: null,
      incident: null,
      geocoderResults: [],
      pda: {
        formFields: {},
      },
      dynamicFields: {},
      sectionCounter: 2,
      addAdditionalPhone: false,
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
  methods: {
    getSectionCount(currentField) {
      return currentField.order_label;
    },
    updatePda(value, key) {
      this.pda[key] = value;
      this.pda = { ...this.pda };
    },
    async findPotentialGeocode() {
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      const nonEmptyKeys = geocodeKeys.filter(key => Boolean(this.pda[key]));
      if (nonEmptyKeys.length > 1) {
        const values = nonEmptyKeys.map(key => this.pda[key]);
        const address = values.join(', ');
        const geocode = await GeocoderService.getPlaceDetails(address);
        geocodeKeys.forEach(key =>
          this.updatePda(geocode.address_components[key], key),
        );
        const { lat, lng } = geocode.location;
        this.updatePda(
          {
            type: 'Point',
            coordinates: [lng, lat],
          },
          'location',
        );
        this.$emit('geocoded', geocode.location);
      }
    },
    checkGeocodeLocation({ lat, lng }) {
      if (!this.currentIncident.locationModels.length) {
        return true;
      }
      let isWithinBounds = false;

      this.currentIncident.locationModels.forEach(location => {
        const geojsonFeature = {
          type: 'Feature',
          properties: location.attr,
          geometry: location.poly || location.geom || location.point,
        };
        const locationFeature = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
        };
        const intersects = turf.booleanPointInPolygon(
          locationFeature,
          geojsonFeature,
        );
        if (intersects) {
          isWithinBounds = true;
        }
      });
      return isWithinBounds;
    },
    async updatePdaFields(geocode) {
      const { lat, lng } = geocode.location;
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      geocodeKeys.forEach(key =>
        this.updatePda(geocode.address_components[key], key),
      );

      this.updatePda(
        {
          type: 'Point',
          coordinates: [lng, lat],
        },
        'location',
      );
      const what3words = await What3wordsService.getWords(lat, lng);
      this.updatePda(what3words, 'what3words');
      this.$emit('geocoded', geocode.location);
    },

    clearLocationFields() {
      const geocodeKeys = [
        'address',
        'city',
        'county',
        'state',
        'postal_code',
        'location',
        'what3words',
      ];
      geocodeKeys.forEach(key => this.updatePda(null, key));
      this.$emit('clearMarkers');
    },

    async onGeocodeSelect(value) {
      const geocode = await GeocoderService.getPlaceDetails(value.description);
      await this.updatePdaFields(geocode);
    },
    async geocoderSearch(value) {
      this.geocoderResults = await GeocoderService.getMatchingAddressesGoogle(
        value,
      );
    },
    async savePda() {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }

      if (this.location) {
        this.updatePda(
          {
            type: 'Point',
            coordinates: [
              this.location.coords.longitude,
              this.location.coords.latitude,
            ],
          },
          'location',
        );
      }
      const fieldData = this.dynamicFields;

      const truthyValues = Object.keys(fieldData).filter(key => {
        return Boolean(fieldData[key]) && this.fieldsArray.includes(key);
      });

      const formData = truthyValues.map(key => {
        return {
          field_key: key,
          field_value: fieldData[key],
        };
      });

      this.updatePda(formData, 'form_data');

      try {
        await Pda.api().post('/pdas', {
          ...this.pda,
          incident: this.currentIncident.id,
        });
        await this.$toasted.success(this.$t('caseForm.new_case_success'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
    },
    resetForm() {
      this.pda = new Pda({});
    },
    getValue(fieldKey) {
      if (!this.pda || !this.pda.form_data) {
        return '';
      }

      const key = this.pda.form_data.find(element => {
        return element.field_key === fieldKey;
      });
      if (key) {
        this.$log.debug(`${fieldKey}:${key.field_value}`);

        return key.field_value;
      }
      return '';
    },
    getSelectValue(fieldKey) {
      if (!this.pda || !this.pda.form_data) {
        return '';
      }

      const key = this.pda.form_data.find(element => {
        return element.field_key === fieldKey;
      });
      if (key) {
        const currentField = this.fields.find(field => {
          return field.field_key === fieldKey;
        });

        return currentField.values.find(field => {
          return field.value === key.field_value;
        });
      }
      return '';
    },
    getSelectValuesList(defaultValues) {
      return Object.keys(defaultValues).map(key => {
        return {
          value: key,
          name_t: this.$t(defaultValues[key]),
        };
      });
    },
    getBooleanValue(fieldKey) {
      if (!this.pda || !this.pda.form_data) {
        return '';
      }

      const key = this.pda.form_data.find(element => {
        return element.field_key === fieldKey;
      });
      if (key) {
        return key.field_value;
      }
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
