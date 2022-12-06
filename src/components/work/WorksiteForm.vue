<template>
  <form v-if="ready" class="form h-full" ref="form" @submit.prevent>
    <div class="form-content">
      <SectionHeading :count="1" class="mb-3">{{
        $t('caseForm.property_information')
      }}</SectionHeading>
      <section class="form-field">
        <WorksiteSearchInput
          :value="worksite.name"
          selector="js-worksite-name"
          display-property="name"
          :placeholder="$t('formLabels.name')"
          size="large"
          required
          @input="(e) => updateWorksite(e, 'name')"
          @selectedExisting="onWorksiteSelect"
          skip-validation
          class="w-full"
        />
      </section>
      <div class="form-field">
        <base-input
          :model-value="worksite.phone1"
          selector="js-worksite-phone1"
          size="large"
          required
          :placeholder="$t('formLabels.phone1')"
          @update:modelValue="(v) => updateWorksite(v, 'phone1')"
          @iconClicked="() => sendSms(worksite.phone1)"
          :fa-icon="
            currentIncident.auto_contact && worksite.id ? 'comment' : null
          "
          :tooltip="
            currentIncident.auto_contact && worksite.id
              ? $t('caseForm.sms')
              : null
          "
        />
      </div>
      <div class="form-field" v-if="worksite.phone2 || addAdditionalPhone">
        <base-input
          :model-value="worksite.phone2"
          selector="js-worksite-phone2"
          size="large"
          :placeholder="$t('formLabels.phone2')"
          @update:modelValue="(v) => updateWorksite(v, 'phone2')"
          @iconClicked="() => sendSms(worksite.phone2)"
          :fa-icon="
            currentIncident.auto_contact && worksite.id ? 'comment' : null
          "
          :tooltip="
            currentIncident.auto_contact && worksite.id
              ? $t('caseForm.sms')
              : null
          "
        />
      </div>
      <base-button
        v-else
        class="mx-3 text-primary-dark"
        type="link"
        :text="$t('caseView.add_phone')"
        :alt="$t('caseView.add_phone')"
        :action="() => (addAdditionalPhone = true)"
      />
      <div class="form-field">
        <base-input
          :model-value="worksite.email"
          selector="js-worksite-email"
          size="large"
          :placeholder="$t('formLabels.email')"
          @update:modelValue="(v) => updateWorksite(v, 'email')"
        />
      </div>
      <div class="form-field" v-if="currentIncident.auto_contact">
        <span slot="label" class="flex items-center">
          <span>{{ $t('casesVue.auto_contact_frequency') }}</span>
          <ccu-icon
            v-tooltip="{
              content: $t('casesVue.auto_contact_frequency_help'),
              trigger: 'hover',
              classes: 'interactive-tooltip w-72',
            }"
            :alt="$t('casesVue.auto_contact_frequency_help')"
            type="help"
            size="large"
          />
        </span>
        <base-select
          :value="worksite.auto_contact_frequency_t"
          :options="contactFrequencyOptions"
          class="bg-white"
          @input="(v) => updateWorksite(v, 'auto_contact_frequency_t')"
          select-classes="h-12 border"
          item-key="value"
          label="name_t"
          :placeholder="$t('casesVue.auto_contact_frequency')"
        />
      </div>
      <div
        class="text-base font-semibold my-1 mx-3 flex justify-between items-center"
      >
        {{ $t('formLabels.location') }}
        <ccu-icon
          v-tooltip="{
            content: $t('caseForm.location_instructions'),
            trigger: 'click',
            classes: 'interactive-tooltip w-72',
          }"
          :alt="$t('caseForm.location_instructions')"
          type="help"
          size="large"
        />
      </div>

      <div class="form-field">
        <div
          v-if="addressSet"
          class="rounded-lg shadow-lg p-5 border flex justify-between items-center"
        >
          <div class="flex items-start">
            <ccu-icon
              type="pin"
              class="mr-1"
              size="small"
              style="margin-top: 3px"
              :alt="$t('formLabels.location')"
            />
            <span v-html="worksiteAddress"></span>
          </div>
          <div class="flex">
            <ccu-icon
              type="trash"
              size="small"
              class="mx-1"
              :alt="$t('actions.clear_location')"
              @click="clearLocationFields"
            />
            <ccu-icon
              type="edit"
              size="small"
              class="mx-1"
              :alt="$t('caseView.manually_edit_address')"
              @click="unlockLocationFields"
            />
          </div>
        </div>
        <base-input
          v-else-if="shouldSelectOnMap"
          :model-value="worksite.address"
          name="worksite.address"
          selector="js-worksite-address"
          size="large"
          :placeholder="
            showAddressDetails
              ? $t('formLabels.address')
              : $t('caseView.full_address')
          "
          @update:modelValue="(v) => updateWorksite(v, 'address')"
          required
        />
        <WorksiteSearchInput
          v-else
          :value="worksite.address"
          selector="js-worksite-address"
          display-property="description"
          :placeholder="
            showAddressDetails
              ? $t('formLabels.address')
              : $t('caseView.full_address')
          "
          size="large"
          required
          @input="(v) => updateWorksite(v, 'address')"
          @selectedExisting="onWorksiteSelect"
          @selectedGeocode="onGeocodeSelect"
          use-geocoder
          class="w-full"
        />
      </div>
      <template v-if="showAddressDetails">
        <div class="form-field">
          <base-input
            :model-value="worksite.city"
            selector="js-worksite-city"
            size="large"
            :placeholder="$t('formLabels.city')"
            required
            @update:modelValue="(v) => updateWorksite(v, 'city')"
          />
        </div>
        <div class="form-field">
          <base-input
            :model-value="worksite.county"
            name="county"
            selector="js-worksite-county"
            size="large"
            :placeholder="$t('formLabels.county')"
            required
            @update:modelValue="(v) => updateWorksite(v, 'county')"
          />
        </div>
        <div class="form-field">
          <base-input
            name="state"
            :model-value="worksite.state"
            selector="js-worksite-state"
            size="large"
            :placeholder="$t('formLabels.state')"
            required
            @update:modelValue="(v) => updateWorksite(v, 'state')"
          />
        </div>
        <div class="form-field">
          <base-input
            name="zip"
            :model-value="worksite.postal_code"
            selector="js-worksite-postal-code"
            size="large"
            :placeholder="$t('formLabels.postal_code')"
            @update:modelValue="(v) => updateWorksite(v, 'postal_code')"
            required
          />
        </div>
      </template>
      <div class="form-field">
        <base-input
          :model-value="worksite.what3words"
          size="large"
          :placeholder="$t('formLabels.what3words')"
          :required="!worksite.location"
          disabled
          @update:modelValue="(v) => updateWorksite(v, 'what3words')"
        />

        <div class="flex justify-around items-center p-2 text-gray-700">
          <base-button
            type="bare"
            icon="street-view"
            class=""
            :action="locateMe"
            :text="$t('caseForm.use_my_location')"
          />
          <span
            class="p-1"
            :class="
              shouldSelectOnMap
                ? 'border-2 border-primary-light bg-primary-light bg-opacity-40'
                : ''
            "
          >
            <base-button
              type="bare"
              icon="map"
              class=""
              :action="toggleSelectOnMap"
              :text="$t('caseForm.select_on_map')"
            />
          </span>
        </div>
        <WorksiteNotes
          @saveNote="saveNote"
          :worksite="worksite"
          @input="currentNote = $event"
        />
        <div class="my-1 py-1" v-if="!worksite.isWrongLocation">
          <base-checkbox v-model="isWrongLocation" class="text-primary-dark">
            {{ $t('caseForm.address_problems') }}
          </base-checkbox>
        </div>
        <div class="my-1 py-1" v-if="!worksite.isHighPriority">
          <base-checkbox v-model="isHighPriority" class="text-primary-dark">
            {{ $t('flag.flag_high_priority') }}
          </base-checkbox>
        </div>
        <div class="my-1 py-1" v-if="!worksite.isFavorite">
          <base-checkbox v-model="isFavorite" class="text-primary-dark">
            {{ $t('actions.member_of_my_org') }}
          </base-checkbox>
        </div>
      </div>
      <form-tree
        v-for="field in fieldTree"
        :key="field.field_key"
        :field="field"
        :worksite="worksite"
        :dynamic-fields="dynamicFields"
        @updateField="
          ({ key, value }) => {
            updateDirtyFields(key);
            dynamicFields[key] = value;
            dynamicFields = { ...dynamicFields };
          }
        "
        @updateWorkTypeStatus="
          ({ work_type, status }) => {
            statusValueChange(status, work_type);
          }
        "
      ></form-tree>

      <template>
        <SectionHeading :count="5" class="mb-3"
          >{{ $t('caseView.report') }}
        </SectionHeading>
        <WorksiteReportSection
          :worksite="worksite"
          :key="worksite.total_time"
          @timeAdded="reloadWorksite"
        />
        <SectionHeading :count="6" class="mb-3"
          >{{ $t('caseForm.photos') }}
        </SectionHeading>
        <WorksiteImageSection
          class="px-3 pb-3"
          :worksite="worksite"
          :key="worksite.files"
          ref="worksiteImageSection"
          @updateFiles="updateImage"
          @popLocal="onRemoveFile"
        />
      </template>
    </div>
    <div class="form-footer flex justify-between p-3 gap-2">
      <base-button
        size="medium"
        class="flex-grow"
        variant="outline"
        :action="
          () => {
            clearWorksiteStorage();
            $emit('closeWorksite');
          }
        "
        :text="$t('actions.cancel')"
      />
      <base-button
        size="medium"
        variant="solid"
        data-cy="worksite-formaction-save"
        class="flex-grow"
        :action="saveWorksite"
        :text="$t('actions.save')"
      />
      <base-button
        v-if="!disableClaimAndSave"
        size="medium"
        variant="solid"
        class="flex-grow"
        :action="claimAndSaveWorksite"
        :text="$t('actions.save_claim')"
      />
    </div>
  </form>
  <div v-else class="flex items-center justify-center h-full w-full grid">
    <spinner />
  </div>
</template>

<script>
import { computed, onMounted, ref, watch } from 'vue';
import { sortBy, uniqueId } from 'lodash';
import moment from 'moment';
import * as turf from '@turf/turf';
import GeocoderService from '../../services/geocoder.service';
import Worksite from '../../models/Worksite';
import { StorageService } from '../../services/storage.service';
import { What3wordsService } from '../../services/what3words.service';
import { buildForm, groupBy, nest } from '../../utils/form';
import { getErrorMessage } from '../../utils/errors';
import Incident from '../../models/Incident';
import WorksiteImageSection from '../../components/work/WorksiteImageSection.vue';
import WorksiteReportSection from '../../components/work/WorksiteReportSection.vue';
import WorksiteSearchInput from '../../components/work/WorksiteSearchInput.vue';
import SectionHeading from '../../components/work/SectionHeading.vue';
import WorksiteNotes from '../../components/work/WorksiteNotes.vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'vue-toastification';
import useDialogs from '../../hooks/useDialogs';
import useEmitter from '../../hooks/useEmitter';
import axios from 'axios';
import BaseSelect from '../BaseSelect.vue';

const AUTO_CONTACT_FREQUENCY_OPTIONS = [
  'formOptions.often',
  'formOptions.not_often',
  'formOptions.never',
];

export default {
  name: 'WorksiteForm',
  components: {
    BaseSelect,
    WorksiteNotes,
    SectionHeading,
    WorksiteSearchInput,
    WorksiteReportSection,
    WorksiteImageSection,
  },
  props: {
    worksiteId: {
      type: String,
      default: null,
    },
    incidentId: {
      type: String,
      default: null,
    },
    pdaId: {
      type: String,
      default: null,
    },
    isEditing: {
      type: Boolean,
    },
    disableClaimAndSave: {
      type: Boolean,
    },
    beforeSave: {
      type: Function,
      default: () => true,
    },
    dataPrefill: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const { t } = useI18n();
    const $toasted = useToast();
    const { confirm } = useDialogs();
    const { emitter } = useEmitter();
    const dirtyFields = ref(new Set());
    const worksite = ref({});
    const updatedFiles = ref([]);
    const updateImage = (formData) => {
      updatedFiles.value.push(formData.id);
    };
    const contactFrequencyOptions = AUTO_CONTACT_FREQUENCY_OPTIONS.map(
      (key) => {
        return {
          value: key,
          name_t: t(key),
        };
      },
    );
    const advancedAddressFields = ['city', 'county', 'state', 'postal_code'];
    const fieldToErrorMsgMap = {
      name: t('caseForm.name_required'),
      phone1: t('caseForm.phone_required'),
      address: t('caseForm.address_required'),
      city: t('caseForm.city_required'),
      county: t('caseForm.county_required'),
      state: t('caseForm.state_required'),
      postal_code: t('caseForm.postal_code_required'),
    };

    const shouldSelectOnMap = ref(false);
    const isWrongLocation = ref(false);
    const hideDetailedAddressFields = ref(true);
    const ready = ref(false);
    const addressSet = ref(false);
    const dynamicFields = ref({});
    const potentialIncidents = ref([]);
    const location = ref(null);
    const currentNote = ref('');
    const errorStr = ref('');
    const isHighPriority = ref(false);
    const isFavorite = ref(false);
    const searchWorksitesResults = ref([]);
    const geocoderResults = ref([]);
    const overlayMapVisible = ref(false);
    const overlayMapLocation = ref({});
    const gettingLocation = ref(false);
    const addAdditionalPhone = ref(false);
    const searchWorksitesNameResults = ref([]);
    const form = ref(null);
    const worksiteImageSection = ref(null);

    const currentIncident = computed(() => {
      return Incident.find(props.incidentId);
    });

    const fields = computed(() => {
      if (currentIncident.value && currentIncident.value.form_fields) {
        const formFields = currentIncident.value.form_fields;
        const returnArray = [];
        buildForm(null, groupBy('field_parent_key')(formFields), returnArray);
        return returnArray;
      }
      return [];
    });

    const fieldsArray = computed(() => {
      return fields.value.map((field) => field.field_key);
    });

    const fieldTree = computed(() => {
      if (currentIncident.value && currentIncident.value.form_fields) {
        const formFields = currentIncident.value.form_fields;
        return sortBy(nest(formFields), (o) => o.list_order);
      }
      return {};
    });

    const worksiteAddress = computed(() => {
      if (worksite.value) {
        const {
          address,
          city,
          state,
          postal_code: postalCode,
          county,
        } = worksite.value;
        return `${address} <br> ${city}, ${state}, ${
          county || ''
        } <br> ${postalCode}`;
      }
      return '';
    });

    const isAddressValid = computed(() => {
      const {
        address,
        city,
        state,
        postal_code: postalCode,
        county,
        location: { coordinates } = {},
      } = worksite.value;
      const hasLatLon = Boolean(coordinates && coordinates.length === 2);
      const hasValidAddress = Boolean(
        address && city && state && county && postalCode,
      );
      return hasLatLon && hasValidAddress;
    });

    const showAddressDetails = computed(() => {
      return (
        shouldSelectOnMap.value ||
        isWrongLocation.value ||
        !hideDetailedAddressFields.value
      );
    });

    function updateDirtyFields(key) {
      dirtyFields.value = new Set(dirtyFields.value.add(key));
    }

    function updateWorksite(value, key) {
      updateDirtyFields(key);
      if (worksite.value.id) {
        Worksite.update({
          where: worksite.value.id,
          data: { [key]: value },
        });
        worksite.value = Worksite.find(worksite.value.id);
      } else {
        worksite.value[key] = value;
        worksite.value = { ...worksite.value };
        StorageService.setItem('currentWorksite', worksite.value);
      }
    }

    async function geocodeWorksite(latitude, longitude, skipAddress = false) {
      const geocode = await GeocoderService.getLocationDetails({
        latitude,
        longitude,
      });
      if (!skipAddress) {
        const geocodeKeys = [
          'address',
          'city',
          'county',
          'state',
          'postal_code',
        ];
        geocodeKeys.forEach((key) =>
          updateWorksite(geocode.address_components[key], key),
        );
      }
      updateWorksite(
        {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        'location',
      );
      const what3words = await What3wordsService.getWords(latitude, longitude);
      updateWorksite(what3words, 'what3words');
      return geocode;
    }

    async function initForm() {
      ready.value = false;
      if (props.worksiteId) {
        try {
          await Worksite.api().fetch(props.worksiteId, props.incidentId);
        } catch (e) {
          emit('clearWorksite');
          return;
        }
        worksite.value = Worksite.find(props.worksiteId);
        addressSet.value = true;
      } else {
        worksite.value = {
          ...StorageService.getItem('currentWorksite'),
          ...props.dataPrefill,
        };

        if (!worksite.value.incident) {
          worksite.value = {
            form_data: [],
            notes: [],
            formFields: {},
            auto_contact_frequency_t: currentIncident.value.auto_contact
              ? 'formOptions.often'
              : 'formOptions.never',
            ...props.dataPrefill,
          };
        }
        worksite.value.incident = props.incidentId;

        if (props.pdaId) {
          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_BASE_URL}/pdas/${props.pdaId}`,
          );
          worksite.value = new Worksite(response.data);
          delete worksite.value.id;
        }
      }
      dynamicFields.value = worksite.value.form_data.reduce(function (
        map,
        obj,
      ) {
        map[obj.field_key] = obj.field_value;
        return map;
      },
      {});

      StorageService.removeItem('currentWorksite');
      ready.value = true;
    }

    async function saveNote(n) {
      const notes = [...worksite.value.notes];
      notes.push({
        id: uniqueId(),
        note: n,
        created_at: moment().toISOString(),
        pending: true,
      });

      updateWorksite(notes, 'notes');
    }

    function getSectionCount(currentField) {
      return currentField.order_label;
    }

    function clearWorksiteStorage() {
      StorageService.removeItem('currentWorksite');
    }

    async function statusValueChange(value, workTypeKey) {
      try {
        await Worksite.api().updateWorkTypeStatus(
          worksite.value.work_types.find((wt) => wt.work_type === workTypeKey)
            ?.id,
          value,
        );
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      } finally {
        const { data } = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/worksites/${
            worksite.value.id
          }?fields=work_types`,
        );
        updateWorksite(data.work_types, 'work_types');
      }
    }

    function reloadWorksite() {
      worksite.value = Worksite.find(worksite.value.id);
    }

    async function sendSms(phone) {
      try {
        await Worksite.api().sendSurvivorSms(worksite.value.id, phone);
        await $toasted.success(t('caseForm.sms_sent'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    async function findPotentialGeocode() {
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      const nonEmptyKeys = geocodeKeys.filter((key) =>
        Boolean(worksite.value[key]),
      );
      if (nonEmptyKeys.length > 1) {
        const values = nonEmptyKeys.map((key) => worksite.value[key]);
        const address = values.join(', ');
        const geocode = await GeocoderService.getPlaceDetails(address);
        geocodeKeys.forEach((key) =>
          updateWorksite(geocode.address_components[key], key),
        );
        const { lat, lng } = geocode.location;
        updateWorksite(
          {
            type: 'Point',
            coordinates: [lng, lat],
          },
          'location',
        );
        const what3words = await What3wordsService.getWords(lat, lng);
        updateWorksite(what3words, 'what3words');
        emit('geocoded', geocode.location);
      }
    }

    function checkGeocodeLocation({ lat, lng }) {
      if (!currentIncident.value.locationModels.length) {
        return true;
      }
      let isWithinBounds = false;

      currentIncident.value.locationModels.forEach((l) => {
        const geojsonFeature = {
          type: 'Feature',
          properties: l.attr,
          geometry: l.poly || l.geom || l.point,
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
    }

    async function getPotentialIncidents({ lat, lng }) {
      const sixtyDaysAgo = moment().subtract(60, 'days');

      const response = await Incident.api().get(
        `/incidents?fields=id,name&location=${lng},${lat}&start_at__gt=${sixtyDaysAgo.toISOString()}`,
        {
          save: false,
        },
      );
      const incidents = response.response.data.results;
      let result;
      if (incidents.length > 0) {
        result = await confirm({
          title: t('caseForm.incorrect_location'),
          content: t('caseForm.suggested_incident', {
            incident: incidents[0].name,
          }),
          actions: {
            switchIncident: {
              text: t('caseForm.yes'),
              type: 'solid',
            },
            keep: {
              text: t('caseForm.no'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
          },
        });
      } else {
        result = await confirm({
          title: t('caseForm.case_outside_incident'),
          content: t('caseForm.warning_case_outside_incident', {
            incident: currentIncident.value.name,
          }),
          actions: {
            continue: {
              text: t('actions.continue_anyway'),
              type: 'solid',
            },
            retry: {
              text: t('actions.retry'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
          },
        });
      }

      potentialIncidents.value = incidents;

      return result;
    }

    async function updateWorksiteFields(geocode) {
      const { lat, lng } = geocode.location;
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      geocodeKeys.forEach((key) =>
        updateWorksite(geocode.address_components[key], key),
      );

      updateWorksite(
        {
          type: 'Point',
          coordinates: [lng, lat],
        },
        'location',
      );
      const what3words = await What3wordsService.getWords(lat, lng);
      updateWorksite(what3words, 'what3words');
      emit('geocoded', geocode.location);
      addressSet.value = true;
    }

    function unlockLocationFields() {
      hideDetailedAddressFields.value = false;
      addressSet.value = false;
      emit('clearMarkers');
    }

    function clearLocationFields() {
      const geocodeKeys = [
        'address',
        'city',
        'county',
        'state',
        'postal_code',
        'location',
        'what3words',
      ];
      geocodeKeys.forEach((key) => updateWorksite('', key));
      emit('clearMarkers');
      shouldSelectOnMap.value = false;
      addressSet.value = false;
    }

    function onRemoveFile(imageList) {
      updatedFiles.value = imageList;
    }

    async function saveWorksite(reload = true) {
      const validationErrors = Object.entries(fieldToErrorMsgMap).reduce(
        (errors, [field, errorMsg]) => {
          if (!worksite.value[field]) {
            // enable select on map to show hidden advanced fields
            if (
              !shouldSelectOnMap.value &&
              advancedAddressFields.includes(field)
            ) {
              shouldSelectOnMap.value = true;
            }
            errors.push(errorMsg);
          }
          return errors;
        },
        [],
      );
      const isValid =
        form.value.reportValidity() &&
        isAddressValid.value &&
        validationErrors.length === 0;
      if (!isValid) {
        if (!isAddressValid.value) {
          $toasted.error(t('caseForm.no_lat_lon_error'));
        }
        validationErrors.forEach((e) => $toasted.error(e));
        return;
      }
      if (props.beforeSave) {
        const beforeSaveCheck = await props.beforeSave();
        if (!beforeSaveCheck) {
          return;
        }
      }
      if (location.value) {
        updateWorksite(
          {
            type: 'Point',
            coordinates: [
              location.value.coords.longitude,
              location.value.coords.latitude,
            ],
          },
          'location',
        );

        const what3words = await What3wordsService.getWords(
          location.value.coords.latitude,
          location.value.coords.longitude,
        );
        updateWorksite(what3words, 'what3words');
      }
      const fieldData = dynamicFields.value;
      const truthyValues = Object.keys(fieldData).filter((key) => {
        return Boolean(fieldData[key]) && fieldsArray.value.includes(key);
      });

      const formData = truthyValues.map((key) => {
        return {
          field_key: key,
          field_value: fieldData[key],
        };
      });

      updateWorksite(formData, 'form_data');

      const anyWorkTypes = currentIncident.value.form_fields
        .map(
          (field) =>
            // eslint-disable-next-line camelcase
            field.if_selected_then_work_type && fieldData[field.field_key],
        )
        .some((x) => x);
      if (!anyWorkTypes) {
        await $toasted.error(t('caseForm.select_work_type_error'));
        return;
      }

      try {
        const notesToSave = worksite.value.notes
          .filter((n) => Boolean(n.pending))
          .map((n) => n.note);

        if (currentNote.value) {
          notesToSave.push(currentNote.value);
          currentNote.value = '';
        }
        if (worksite.value.id) {
          const data = { ...worksite.value };
          delete data.flags;
          delete data.notes;
          await Worksite.api().put(`/worksites/${worksite.value.id}`, {
            ...data,
            skip_duplicate_check: true,
          });
          await Promise.all(
            notesToSave.map((n) =>
              Worksite.api().addNote(worksite.value.id, n),
            ),
          );
          if (isHighPriority.value) {
            await Worksite.api().addFlag(worksite.value.id, {
              reason_t: 'flag.worksite_high_priority',
              is_high_priority: true,
              notes: '',
              requested_action: '',
            });
          }
          if (isFavorite.value) {
            await Worksite.api().favorite(worksite.value.id);
          }
        } else {
          const savedWorksite = await Worksite.api().post('/worksites', {
            ...worksite.value,
            incident: props.incidentId,
            skip_duplicate_check: true,
            send_sms: true,
          });
          const worksiteId = savedWorksite.entities.worksites[0].id;
          StorageService.removeItem('currentWorksite');
          await Promise.all(
            notesToSave.map((n) => Worksite.api().addNote(worksiteId, n)),
          );
          updatedFiles.value.forEach((file) => {
            worksiteImageSection.value.saveToWorkSite(file, worksiteId);
          });
          if (isHighPriority.value) {
            await Worksite.api().addFlag(worksiteId, {
              reason_t: 'flag.worksite_high_priority',
              is_high_priority: true,
              notes: '',
              requested_action: '',
            });
          }
          if (isFavorite.value) {
            await Worksite.api().favorite(worksiteId);
          }
          if (isWrongLocation.value) {
            await Worksite.api().addFlag(worksiteId, {
              reason_t: 'flag.worksite_wrong_location',
              is_wrong_location: true,
              notes: '',
              requested_action: '',
            });
          }
          worksite.value = Worksite.find(worksiteId);
        }
        await $toasted.success(t('caseForm.new_case_success'));
        dirtyFields.value = new Set();
        if (reload) {
          emit('reloadTable');
          emit('reloadMap', worksite.value.id);
          emit('savedWorksite', worksite.value);
        }
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
    }

    async function onGeocodeSelect(value) {
      const geocode = await GeocoderService.getPlaceDetails(
        value.description,
        value.data.place_id,
      );
      const { lat, lng } = geocode.location;
      const isWithinCurrentIncident = checkGeocodeLocation({ lat, lng });
      if (!isWithinCurrentIncident) {
        const incidentResult = await getPotentialIncidents({ lat, lng });

        if (incidentResult === 'retry' || incidentResult === 'cancel') {
          updateWorksite('', 'address');
          return;
        }
        if (incidentResult === 'switchIncident') {
          updateWorksite(potentialIncidents.value[0].id, 'incident');
          await updateWorksiteFields(geocode);
          await saveWorksite(false);
          emit('reloadTable');
          emit('reloadMap', worksite.value.id);
          emit('switchIncident', {
            incident: potentialIncidents.value[0].id,
            worksite: worksite.value,
          });
          return;
        }
      }
      await updateWorksiteFields(geocode);
    }

    async function onWorksiteSelect(value) {
      emit('navigateToWorksite', value.id);
    }

    function searchWorksites(search, incident) {
      return axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/worksites?fields=id,name,address,case_number,postal_code,city,state,incident,work_types&limit=5&search=${search}&incident=${incident}`,
      );
    }

    async function geocoderSearch(value) {
      geocoderResults.value = await GeocoderService.getMatchingAddresses(
        value,
        'USA',
      );
      const sites = await searchWorksites(value, props.incidentId);
      searchWorksitesResults.value = sites.data.results;
    }

    async function worksitesSearch(value) {
      const sites = await searchWorksites(value, props.incidentId);
      searchWorksitesNameResults.value = sites.data.results;
    }

    async function handleOk() {
      overlayMapVisible.value = false;
      if (overlayMapLocation.value) {
        const { lat, lng } = overlayMapLocation.value;
        updateWorksite(
          {
            type: 'Point',
            coordinates: [lng, lat],
          },
          'location',
        );
        const what3words = await What3wordsService.getWords(lat, lng);
        updateWorksite(what3words, 'what3words');
      }
    }

    function onAddedMarker(value) {
      overlayMapLocation.value = value;
    }

    async function claimAndSaveWorksite() {
      await saveWorksite(false);
      const isValid = form.value.reportValidity();
      if (!isValid) {
        return;
      }
      try {
        await Worksite.api().claimWorksite(worksite.value.id, []);
        await $toasted.success(t('caseForm.claim_success'));
      } catch (error) {
        await $toasted.error(getErrorMessage(error));
      }
      await Worksite.api().fetch(worksite.value.id);
      worksite.value = Worksite.find(worksite.value.id);
      emit('reloadTable');
      emit('reloadMap', worksite.value.id);
      emit('savedWorksite', worksite.value);
    }

    function resetForm() {
      worksite.value = new Worksite({
        incident: props.incidentId,
        form_data: [],
        auto_contact_frequency_t: currentIncident.value.auto_contact
          ? 'formOptions.often'
          : 'formOptions.never',
      });
    }

    function getValue(fieldKey) {
      if (!worksite.value || !worksite.value.form_data) {
        return '';
      }

      const key = worksite.value.form_data.find((element) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        return key.field_value;
      }
      return '';
    }

    function getSelectValue(fieldKey) {
      if (!worksite.value || !worksite.value.form_data) {
        return '';
      }

      const key = worksite.value.form_data.find((element) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        const currentField = fields.value.find((field) => {
          return field.field_key === fieldKey;
        });

        return currentField.values.find((field) => {
          return field.value === key.field_value;
        });
      }
      return '';
    }

    function getSelectValuesList(defaultValues) {
      return Object.keys(defaultValues).map((key) => {
        return {
          value: key,
          name_t: t(defaultValues[key]),
        };
      });
    }

    function getBooleanValue(fieldKey) {
      if (!worksite.value || !worksite.value.form_data) {
        return '';
      }

      const key = worksite.value.form_data.find((element) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        return key.field_value;
      }
      return false;
    }

    function showOverlayMap() {
      overlayMapVisible.value = true;
      return false;
    }

    async function getLocation() {
      return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(new Error('Geolocation is not available.'));
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve(pos);
          },
          (err) => {
            reject(err);
          },
        );
      });
    }

    async function toggleSelectOnMap() {
      shouldSelectOnMap.value = !shouldSelectOnMap.value;
      if (shouldSelectOnMap.value) {
        emit('geocoded', null);
      }
    }

    async function locateMe() {
      gettingLocation.value = true;
      try {
        gettingLocation.value = false;
        location.value = await getLocation();
        const { latitude, longitude } = location.value.coords;
        const geocode = await geocodeWorksite(latitude, longitude);
        emit('geocoded', geocode.location);
      } catch (e) {
        gettingLocation.value = false;
        errorStr.value = e.message;
      }
    }

    watch(props.dataPrefill, (newValue) => {
      worksite.value = { ...worksite.value, ...newValue };
    });

    watch(props.worksiteId, (newValue) => {
      if (!newValue) {
        worksite.value = {};
      }
    });

    watch(isWrongLocation, (newValue) => {
      if (newValue !== shouldSelectOnMap.value) {
        shouldSelectOnMap.value = newValue;
      }
    });

    emitter.on('updatedWorksiteLocation', (latLng) => {
      geocodeWorksite(latLng.lat, latLng.lng, true);
    });

    emitter.on('clearWorksite', () => {
      worksite.value = {
        incident: props.incidentId,
        form_data: [],
        formFields: {},
        auto_contact_frequency_t: currentIncident.value.auto_contact
          ? 'formOptions.often'
          : 'formOptions.never',
      };
    });

    onMounted(async () => {
      await initForm();
    });

    return {
      updatedFiles,
      updateImage,
      advancedAddressFields,
      contactFrequencyOptions,
      dirtyFields,
      worksite,
      fields,
      fieldTree,
      fieldsArray,
      worksiteAddress,
      isAddressValid,
      fieldToErrorMsgMap,
      shouldSelectOnMap,
      isWrongLocation,
      hideDetailedAddressFields,
      showAddressDetails,
      ready,
      dynamicFields,
      saveNote,
      getSectionCount,
      clearWorksiteStorage,
      statusValueChange,
      reloadWorksite,
      sendSms,
      findPotentialGeocode,
      checkGeocodeLocation,
      potentialIncidents,
      getPotentialIncidents,
      updateWorksiteFields,
      unlockLocationFields,
      clearLocationFields,
      onGeocodeSelect,
      onWorksiteSelect,
      saveWorksite,
      location,
      currentNote,
      isHighPriority,
      isFavorite,
      searchWorksites,
      geocoderResults,
      geocoderSearch,
      worksitesSearch,
      overlayMapVisible,
      overlayMapLocation,
      handleOk,
      onAddedMarker,
      claimAndSaveWorksite,
      resetForm,
      getValue,
      getSelectValue,
      getSelectValuesList,
      getBooleanValue,
      showOverlayMap,
      getLocation,
      toggleSelectOnMap,
      errorStr,
      locateMe,
      searchWorksitesNameResults,
      updateWorksite,
      currentIncident,
      addressSet,
      searchWorksitesResults,
      updateDirtyFields,
      addAdditionalPhone,
      form,
      onRemoveFile,
      worksiteImageSection,
    };
  },
};
</script>

<style scoped lang="postcss">
.form {
  display: grid;
  grid-template-rows: auto 80px;
  @supports (-webkit-touch-callout: none) {
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}

.form-content {
  overflow-y: auto;
}
</style>
