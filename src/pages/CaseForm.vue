<template>
  <form
    v-if="ready"
    ref="form"
    class="bg-white flex flex-col flex-grow w-full intake-form-container"
    :class="noGrid && 'no-grid'"
    @submit.prevent
    :style="formStyle"
  >
    <resize-observer @notify="calcFormStyle" />
    <div class="intake-form" :class="noGrid && 'no-grid'">
      <SectionHeading :count="1" class="mb-3">{{
        $t('caseForm.property_information')
      }}</SectionHeading>
      <section class="form-field">
        <WorksiteSearchInput
          :value="worksite.name"
          selector="js-worksite-name"
          :suggestions="[
            {
              name: 'worksites',
              data: searchWorksitesNameResults || [],
              key: 'name',
            },
          ]"
          @clearSuggestions="searchWorksitesNameResults = []"
          display-property="name"
          :placeholder="$t('formLabels.name')"
          size="large"
          :required="true"
          @input="
            (value) => {
              updateWorksite(value, 'name');
            }
          "
          @selectedExisting="onWorksiteSelect"
          @search="worksitesSearch"
        />
      </section>
      <div class="form-field">
        <base-input
          :value="worksite.phone1"
          selector="js-worksite-phone1"
          size="large"
          :placeholder="$t('formLabels.phone1')"
          @input="
            (value) => {
              updateWorksite(value, 'phone1');
            }
          "
        />
      </div>
      <div class="form-field" v-if="worksite.phone2 || addAdditionalPhone">
        <base-input
          :value="worksite.phone2"
          selector="js-worksite-phone2"
          size="large"
          :placeholder="$t('formLabels.phone2')"
          @input="
            (value) => {
              updateWorksite(value, 'phone2');
            }
          "
        />
      </div>
      <base-button
        v-else
        class="mx-3 text-primary-dark"
        type="link"
        :text="$t('caseView.add_phone')"
        :alt="$t('caseView.add_phone')"
        :action="
          () => {
            addAdditionalPhone = true;
          }
        "
      />
      <div class="form-field">
        <base-input
          :value="worksite.email"
          selector="js-worksite-email"
          size="large"
          :placeholder="$t('formLabels.email')"
          @input="
            (value) => {
              updateWorksite(value, 'email');
            }
          "
        />
      </div>
      <div
        class="
          text-base
          font-semibold
          my-1
          mx-3
          flex
          justify-between
          items-center
        "
      >
        {{ $t('formLabels.location') }}
        <ccu-icon
          type="trash"
          size="small"
          :alt="$t('caseView.clear_location')"
          @click.native="clearLocationFields"
        />
      </div>
      <div class="form-field">
        <WorksiteSearchInput
          :value="worksite.address"
          selector="js-worksite-address"
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
          @clearSuggestions="
            () => {
              searchWorksitesResults = [];
              geocoderResults = [];
            }
          "
          display-property="description"
          :placeholder="$t('formLabels.address')"
          size="large"
          :required="true"
          @input="
            (value) => {
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
          selector="js-worksite-city"
          size="large"
          :placeholder="$t('formLabels.city')"
          required
          @input="
            (value) => {
              updateWorksite(value, 'city');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="worksite.county"
          selector="js-worksite-county"
          size="large"
          :placeholder="$t('formLabels.county')"
          :break-glass="true"
          required
          @input="
            (value) => {
              updateWorksite(value, 'county');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="worksite.state"
          selector="js-worksite-state"
          size="large"
          :placeholder="$t('formLabels.state')"
          required
          @input="
            (value) => {
              updateWorksite(value, 'state');
            }
          "
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="worksite.postal_code"
          selector="js-worksite-postal-code"
          size="large"
          :placeholder="$t('formLabels.postal_code')"
          required
          @change="findPotentialGeocode"
        />
      </div>
      <div class="form-field">
        <base-input
          :value="worksite.what3words"
          size="large"
          :placeholder="$t('formLabels.what3words')"
          :required="!worksite.location"
          disabled
          @input="
            (value) => {
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
            :text="$t('caseForm.use_my_location')"
          />
          <base-button
            type="bare"
            icon="map"
            class="text-gray-700 pt-2"
            :action="selectOnMap"
            :text="$t('caseForm.select_on_map')"
          />
        </div>
        <WorksiteNotes
          @saveNote="saveNote"
          :worksite="worksite"
          @input="currentNote = $event"
        />
        <div class="my-1 py-1" v-if="!worksite.isHighPriority">
          <base-checkbox
            v-model="isHighPriority"
            class="text-crisiscleanup-red-700"
          >
            {{ $t('flag.flag_high_priority') }}
          </base-checkbox>
        </div>
      </div>
      <form-tree
        v-for="field in fieldTree"
        :key="field.field_key"
        :field="field"
        :worksite="worksite"
        @updateField="
          ({ key, value }) => {
            updateDirtyFields(key);
            dynamicFields[key] = value;
          }
        "
      ></form-tree>

      <template v-if="isEditing">
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
          :worksite="worksite"
          :key="worksite.files"
          @photosChanged="reloadWorksite"
        />
      </template>
    </div>
    <div
      class="
        bg-white
        p-3
        border border-r-0 border-gray-300
        card-footer
        flex
        justify-between
      "
    >
      <base-button
        size="medium"
        class="flex-grow m-1 border-2 border-black"
        variant="text"
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
        class="flex-grow m-1 text-black"
        :action="saveWorksite"
        :text="$t('actions.save')"
      />
      <base-button
        v-if="!disableClaimAndSave"
        size="medium"
        variant="solid"
        class="flex-grow m-1 text-black"
        :action="claimAndSaveWorksite"
        :text="$t('actions.save_claim')"
      />
    </div>
  </form>
  <div v-else class="flex items-center justify-center h-full w-full">
    <spinner />
  </div>
</template>

<script>
import * as turf from '@turf/turf';
import * as moment from 'moment';
import { create } from 'vue-modal-dialogs';
import { sortBy, uniqueId } from 'lodash';
import Worksite from '@/models/Worksite';
import GeocoderService from '@/services/geocoder.service';
import { What3wordsService } from '@/services/what3words.service';
import { getErrorMessage } from '@/utils/errors';
import WorksiteSearchInput from '@/components/WorksiteSearchInput';
import Incident from '@/models/Incident';
import { buildForm, groupBy, nest } from '@/utils/form';
import MessageBox from '@/components/dialogs/MessageBox';
import WorksiteImageSection from '@/components/WorksiteImageSection';
import WorksiteReportSection from '@/components/WorksiteReportSection';
import { StorageService } from '@/services/storage.service';
import SectionHeading from '../components/SectionHeading';
import { EventBus } from '../event-bus';
import { ValidateMixin } from '../mixins';
import WorksiteNotes from './WorksiteNotes';

const messageBox = create(MessageBox);

export default {
  name: 'CaseForm',
  components: {
    WorksiteNotes,
    SectionHeading,
    WorksiteSearchInput,
    WorksiteReportSection,
    WorksiteImageSection,
  },
  mixins: [ValidateMixin],
  created() {
    EventBus.$on('updatedWorksiteLocation', (latLng) => {
      this.geocodeWorksite(latLng.lat, latLng.lng, true);
    });
    EventBus.$on('clearWorksite', () => {
      this.worksite = {
        incident: this.incidentId,
        form_data: [],
        formFields: {},
      };
    });
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
      default: () => {},
    },
    resizeMethod: {
      // one of:
      // parent: resize based on intake container.
      // screen: resize based on scrollable screen.
      type: String,
      default: 'parent',
    },
    noGrid: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      showAllFields: true,
      ready: false,
      isHighPriority: false,
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
      potentialIncidents: [],
      dirtyFields: new Set(),
      sectionCounter: 2,
      addAdditionalPhone: false,
      currentNote: '',
      formStyle: {},
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
    fieldTree() {
      if (this.currentIncident && this.currentIncident.form_fields) {
        const formFields = this.currentIncident.form_fields;
        return sortBy(nest(formFields), (o) => o.list_order);
      }
      return {};
    },
    currentIncident() {
      return Incident.find(this.incidentId);
    },
    fieldsArray() {
      return this.fields.map((field) => field.field_key);
    },
  },
  async mounted() {
    this.ready = false;
    if (this.worksiteId) {
      try {
        await Worksite.api().fetch(this.worksiteId, this.incidentId);
      } catch (e) {
        this.$emit('clearWorksite');
        return;
      }
      this.worksite = Worksite.find(this.worksiteId);
      if (this.$route.query.showOnMap) {
        this.$emit('jumpToCase', this.worksiteId);
      }
    } else {
      this.worksite = { ...StorageService.getItem('currentWorksite') };

      if (!this.worksite.incident) {
        this.worksite = {
          form_data: [],
          notes: [],
          formFields: {},
          ...this.dataPrefill,
        };
      }

      this.worksite.incident = this.incidentId;

      if (this.pdaId) {
        const response = await this.$http.get(
          `${process.env.VUE_APP_API_BASE_URL}/pdas/${this.pdaId}`,
        );
        this.worksite = new Worksite(response.data);
        delete this.worksite.id;
      }
    }
    this.dynamicFields = this.worksite.form_data.reduce(function (map, obj) {
      map[obj.field_key] = obj.field_value;
      return map;
    }, {});

    StorageService.removeItem('currentWorksite');
    this.ready = true;
    this.$nextTick(() => this.calcFormStyle());
  },
  methods: {
    async saveNote(currentNote) {
      const notes = [...this.worksite.notes];
      notes.push({
        id: uniqueId(),
        note: currentNote,
        created_at: this.$moment().toISOString(),
        pending: true,
      });

      this.updateWorksite(notes, 'notes');
    },
    getSectionCount(currentField) {
      return currentField.order_label;
    },
    clearWorksiteStorage() {
      StorageService.removeItem('currentWorksite');
    },
    updateDirtyFields(key) {
      this.dirtyFields = new Set(this.dirtyFields.add(key));
    },
    updateWorksite(value, key) {
      this.updateDirtyFields(key);
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
        StorageService.setItem('currentWorksite', this.worksite);
      }
    },
    reloadWorksite() {
      this.worksite = Worksite.find(this.worksite.id);
    },
    async findPotentialGeocode() {
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      const nonEmptyKeys = geocodeKeys.filter((key) =>
        Boolean(this.worksite[key]),
      );
      if (nonEmptyKeys.length > 1) {
        const values = nonEmptyKeys.map((key) => this.worksite[key]);
        const address = values.join(', ');
        const geocode = await GeocoderService.getPlaceDetails(address);
        geocodeKeys.forEach((key) =>
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
    checkGeocodeLocation({ lat, lng }) {
      if (!this.currentIncident.locationModels.length) {
        return true;
      }
      let isWithinBounds = false;

      this.currentIncident.locationModels.forEach((location) => {
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
    async getPotentialIncidents({ lat, lng }) {
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
        result = await messageBox({
          title: this.$t('caseForm.incorrect_location'),
          content: this.$t('caseForm.suggested_incident', {
            incident: incidents[0].name,
          }),
          actions: {
            switchIncident: {
              text: this.$t('caseForm.yes'),
              type: 'solid',
            },
            keep: {
              text: this.$t('caseForm.no'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
          },
        });
      } else {
        result = await messageBox({
          title: this.$t('caseForm.case_outside_incident'),
          content: this.$t('caseForm.warning_case_outside_incident', {
            incident: this.currentIncident.name,
          }),
          actions: {
            continue: {
              text: this.$t('actions.continue_anyway'),
              type: 'solid',
            },
            retry: {
              text: this.$t('actions.retry'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
          },
        });
      }

      this.potentialIncidents = incidents;

      return result;
    },
    async updateWorksiteFields(geocode) {
      const { lat, lng } = geocode.location;
      const geocodeKeys = ['address', 'city', 'county', 'state', 'postal_code'];
      geocodeKeys.forEach((key) =>
        this.updateWorksite(geocode.address_components[key], key),
      );

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
      geocodeKeys.forEach((key) => this.updateWorksite(null, key));
      this.$emit('clearMarkers');
    },

    async onGeocodeSelect(value) {
      const geocode = await GeocoderService.getPlaceDetails(
        value.description,
        value.data.place_id,
      );
      const { lat, lng } = geocode.location;
      const isWithinCurrentIncident = this.checkGeocodeLocation({ lat, lng });
      if (!isWithinCurrentIncident) {
        const incidentResult = await this.getPotentialIncidents({ lat, lng });

        if (incidentResult === 'retry' || incidentResult === 'cancel') {
          this.updateWorksite('', 'address');
          return;
        }
        if (incidentResult === 'switchIncident') {
          this.updateWorksite(this.potentialIncidents[0].id, 'incident');
          await this.updateWorksiteFields(geocode);
          await this.saveWorksite(false);
          this.$emit('reloadTable');
          this.$emit('reloadMap', this.worksite.id);
          this.$emit('switchIncident', {
            incident: this.potentialIncidents[0].id,
            worksite: this.worksite,
          });
          return;
        }
      }
      await this.updateWorksiteFields(geocode);
    },
    async onWorksiteSelect(value) {
      this.$emit('navigateToWorksite', value.id);
    },
    searchWorksites(search, incident) {
      return this.$http.get(
        `${process.env.VUE_APP_API_BASE_URL}/worksites?fields=id,name,address,case_number,postal_code,city,state,incident,work_types&limit=5&search=${search}&incident=${incident}`,
      );
    },
    async geocoderSearch(value) {
      this.geocoderResults = await GeocoderService.getMatchingAddresses(
        value,
        'USA',
      );
      const searchWorksites = await this.searchWorksites(
        value,
        this.incidentId,
      );
      this.searchWorksitesResults = searchWorksites.data.results;
    },
    async worksitesSearch(value) {
      const searchWorksites = await this.searchWorksites(
        value,
        this.incidentId,
      );
      this.searchWorksitesNameResults = searchWorksites.data.results;
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
        this.$log.debug('worksite failed to save, invalid.');
        return;
      }

      if (this.beforeSave) {
        const beforeSaveCheck = await this.beforeSave();
        if (!beforeSaveCheck) {
          this.$log.debug('worksite failed to save, before save check failed.');
          return;
        }
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
      const fieldData = this.dynamicFields;
      const truthyValues = Object.keys(fieldData).filter((key) => {
        return Boolean(fieldData[key]) && this.fieldsArray.includes(key);
      });

      const formData = truthyValues.map((key) => {
        return {
          field_key: key,
          field_value: fieldData[key],
        };
      });

      this.updateWorksite(formData, 'form_data');

      const anyWorkTypes = this.currentIncident.form_fields
        .map(
          (field) =>
            // eslint-disable-next-line camelcase
            field.if_selected_then_work_type && fieldData[field.field_key],
        )
        .some((x) => x);
      if (!anyWorkTypes) {
        await this.$toasted.error(this.$t('caseForm.select_work_type_error'));
        return;
      }

      try {
        const notesToSave = this.worksite.notes
          .filter((n) => Boolean(n.pending))
          .map((n) => n.note);

        if (this.currentNote) {
          notesToSave.push(this.currentNote);
          this.currentNote = '';
        }

        if (this.worksite.id) {
          const data = { ...this.worksite };
          delete data.flags;
          delete data.notes;
          await Worksite.api().put(`/worksites/${this.worksite.id}`, {
            ...data,
            skip_duplicate_check: true,
          });
          await Promise.all(
            notesToSave.map((n) => Worksite.api().addNote(this.worksite.id, n)),
          );
          if (this.isHighPriority) {
            await Worksite.api().addFlag(this.worksite.id, {
              reason_t: 'flag.worksite_high_priority',
              is_high_priority: true,
              notes: '',
              requested_action: '',
            });
          }
        } else {
          const savedWorksite = await Worksite.api().post('/worksites', {
            ...this.worksite,
            incident: this.incidentId,
            skip_duplicate_check: true,
          });
          const worksiteId = savedWorksite.entities.worksites[0].id;
          StorageService.removeItem('currentWorksite');
          await Promise.all(
            notesToSave.map((n) => Worksite.api().addNote(worksiteId, n)),
          );
          if (this.isHighPriority) {
            await Worksite.api().addFlag(worksiteId, {
              reason_t: 'flag.worksite_high_priority',
              is_high_priority: true,
              notes: '',
              requested_action: '',
            });
          }
          this.worksite = Worksite.find(worksiteId);
        }
        await this.$toasted.success(this.$t('caseForm.new_case_success'));
        this.dirtyFields = new Set();
        if (reload) {
          this.$emit('reloadTable');
          this.$emit('reloadMap', this.worksite.id);
          this.$emit('savedWorksite', this.worksite);
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
        await this.$toasted.success(this.$t('caseForm.claim_success'));
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      }
      await Worksite.api().fetch(this.worksite.id);
      this.worksite = Worksite.find(this.worksite.id);
      this.$emit('reloadTable');
      this.$emit('reloadMap', this.worksite.id);
      this.$emit('savedWorksite', this.worksite);
    },
    resetForm() {
      this.worksite = new Worksite({
        incident: this.incidentId,
        form_data: [],
      });
    },
    getValue(fieldKey) {
      if (!this.worksite || !this.worksite.form_data) {
        return '';
      }

      const key = this.worksite.form_data.find((element) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        this.$log.debug(`${fieldKey}:${key.field_value}`);

        return key.field_value;
      }
      return '';
    },
    getSelectValue(fieldKey) {
      if (!this.worksite || !this.worksite.form_data) {
        return '';
      }

      const key = this.worksite.form_data.find((element) => {
        return element.field_key === fieldKey;
      });
      if (key) {
        const currentField = this.fields.find((field) => {
          return field.field_key === fieldKey;
        });

        return currentField.values.find((field) => {
          return field.value === key.field_value;
        });
      }
      return '';
    },
    getSelectValuesList(defaultValues) {
      return Object.keys(defaultValues).map((key) => {
        return {
          value: key,
          name_t: this.$t(defaultValues[key]),
        };
      });
    },
    getBooleanValue(fieldKey) {
      if (!this.worksite || !this.worksite.form_data) {
        return '';
      }

      const key = this.worksite.form_data.find((element) => {
        return element.field_key === fieldKey;
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
          (pos) => {
            resolve(pos);
          },
          (err) => {
            reject(err);
          },
        );
      });
    },
    async geocodeWorksite(latitude, longitude, skipAddress = false) {
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
          this.updateWorksite(geocode.address_components[key], key),
        );
      }
      this.updateWorksite(
        {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        'location',
      );
      const what3words = await What3wordsService.getWords(latitude, longitude);
      this.updateWorksite(what3words, 'what3words');
      return geocode;
    },
    async selectOnMap() {
      this.$emit('geocoded', null);
    },
    async locateMe() {
      this.gettingLocation = true;
      try {
        this.gettingLocation = false;
        this.location = await this.getLocation();
        const { latitude, longitude } = this.location.coords;
        const geocode = await this.geocodeWorksite(latitude, longitude);
        this.$emit('geocoded', geocode.location);
      } catch (e) {
        this.gettingLocation = false;
        this.errorStr = e.message;
      }
    },
    logFormdata() {
      this.$log.debug(new FormData(this.$refs.form));
    },
    calcFormStyle() {
      if (!this.$refs.form) return;
      if (this.resizeMethod === 'none' || this.resizeMethod === null) return;
      const topOffset = this.$refs.form.offsetTop;
      let parentHeight = this.$refs.form.offsetParent.clientHeight;
      if (this.resizeMethod === 'screen') {
        parentHeight = window.screen.availHeight;
      }
      const formHeight = parentHeight - topOffset;
      this.formStyle = {
        'grid-template-rows': `${formHeight - 80}px 80px`,
      };
    },
  },
};
</script>

<style scoped>
.ant-form-item {
  padding-top: 10px;
  margin: 0;
}

.intake-form-container {
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  display: grid;
  &.no-grid {
    display: inherit;
  }
}

.intake-form {
  /*height: 600px;*/
  overflow: auto;
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
