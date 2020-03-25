<template>
  <div class="flex h-full relative">
    <div
      v-if="loading"
      style="z-index: 1001;"
      class="absolute bottom-0 left-0 right-0 top-0 bg-crisiscleanup-light-grey opacity-75 flex items-center justify-center"
    >
      <spinner />
    </div>
    <div v-else class="mx-2 flex flex-col pt-2 w-84">
      <div class="flex items-center justify-between">
        <div v-if="isNew" class="font-bold">
          {{ $t('actions.new_location') }}
        </div>
        <div v-else class="font-bold w-4/5">
          {{ $t('actions.edit') }} {{ currentLocation && currentLocation.name }}
        </div>
        <div class="flex">
          <ccu-icon
            v-show="false"
            :alt="$t('actions.edit_location')"
            size="small"
            class="p-1 py-2"
            type="edit"
            @click.native="() => {}"
          />
          <ccu-icon
            v-if="!isNew"
            :alt="$t('locationVue.download_as_shapefile')"
            size="small"
            class="p-1 py-2"
            type="download"
            @click.native="downloadCurrentLocation"
          />
          <ccu-icon
            v-show="false"
            v-if="!isNew"
            :alt="$t('actions.share_location')"
            size="small"
            class="p-1 py-2"
            type="share"
          />
          <ccu-icon
            v-if="!isNew"
            :alt="$t('actions.delete')"
            size="small"
            class="p-1 py-2"
            type="trash"
            @click.native="deleteCurrentLocation"
          />
        </div>
      </div>
      <form
        v-if="currentLocation"
        ref="form"
        class="form flex-grow flex flex-col justify-between"
      >
        <div class="flex flex-col">
          <base-input
            v-model="currentLocation.name"
            type="text"
            class="input form-field"
            size="large"
            required
            :placeholder="$t('locationVue.location_name')"
          />
          <form-select
            v-if="!loading"
            :value="currentLocation.type"
            :options="locationTypes"
            item-key="id"
            label="name_t"
            :required="true"
            :placeholder="$t('locationVue.location_type')"
            select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12"
            @input="
              type => {
                currentLocation.type = type;
                selectedIncidentId = null;
                selectedOrganization = null;
              }
            "
          />

          <div v-if="!currentLocation.id" class="extra-actions">
            <div v-if="isPrimaryResponseArea || isSecondaryResponseArea">
              <autocomplete
                class="form-field"
                icon="search"
                :suggestions="organizationResults"
                display-property="name"
                size="large"
                :placeholder="$t('locationVue.search_for_organization')"
                clear-on-selected
                @selected="onSelectOrganization"
                @search="onOrganizationSearch"
              />
            </div>
            <div v-if="isIncidentRelated">
              <form-select
                :value="selectedIncidentId"
                class="form-field"
                :options="incidents"
                searchable
                select-classes="bg-white border border-crisiscleanup-dark-100 w-full h-12 mb-3"
                item-key="id"
                label="name"
                :placeholder="$t('locationVue.select_incident')"
                @input="onSelectIncident"
              />
            </div>
          </div>

          <div v-else>
            <div
              v-if="
                (isPrimaryResponseArea || isSecondaryResponseArea) &&
                  relatedOrganizations.length
              "
            >
              <base-text :weight="400">{{
                $t('locationVue.related_organizations')
              }}</base-text>
              <div
                v-for="organization in relatedOrganizations"
                class="my-1 flex items-center justify-between"
              >
                {{ organization.name }}
                <ccu-icon
                  type="trash"
                  size="small"
                  :alt="$t('~Clear Location')"
                  @click.native="
                    () => {
                      detachLocationFromOrganization(organization);
                    }
                  "
                />
              </div>
            </div>
            <div v-if="isIncidentRelated && relatedIncidents.length">
              <base-text :weight="400">{{
                $t('locationVue.related_incidents')
              }}</base-text>
              <div
                v-for="incident in relatedIncidents"
                class="my-1 flex items-center justify-between"
              >
                {{ incident.name }}
                <ccu-icon
                  type="trash"
                  size="small"
                  :alt="$t('~Clear Location')"
                  @click.native="
                    () => {
                      detachLocationFromIncident(incident);
                    }
                  "
                />
              </div>
            </div>
          </div>

          <textarea
            v-model="currentLocation.notes"
            class="text-base form-field border border-crisiscleanup-dark-100 placeholder-crisiscleanup-dark-200 outline-none p-2 resize-none"
            rows="4"
            :placeholder="$t('locationVue.notes')"
          />
          <div>
            <div class="mt-8 text-base">{{ $t('locationVue.access') }}</div>
            <div class="flex flex-wrap mt-2">
              <base-radio
                class="mr-4"
                label="shared"
                :name="$t('locationVue.shared')"
                :value="currentLocation.shared"
                @change="currentLocation.shared = $event"
              />
              <base-radio
                class="mr-4"
                label="private"
                :name="$t('locationVue.private')"
                :value="currentLocation.shared"
                @change="currentLocation.shared = $event"
              />
              <base-radio
                class="mr-4"
                label="public"
                :name="$t('locationVue.public')"
                :value="currentLocation.shared"
                @change="currentLocation.shared = $event"
              />
            </div>
          </div>
        </div>
        <div v-if="selectedOrganization">
          <div class="text-base">
            {{ $t('locationVue.organization_incidents') }}
          </div>
          <div class="h-48 overflow-auto">
            <div v-for="incident in selectedOrganization.incident_list">
              {{ incident.name }}
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end h-16">
          <base-button
            :text="$t('actions.reset')"
            class="border border-black p-2 mr-1"
          />
          <base-button
            :text="$t('actions.save_location')"
            class="p-2 mr-1"
            variant="solid"
            :action="saveLocation"
          />
          <base-button
            v-if="isNew"
            :text="$t('actions.save_and_new')"
            class="p-2"
            variant="solid"
            :action="
              () => {
                saveLocation(true);
              }
            "
          />
        </div>
      </form>
    </div>
    <div class="flex-grow flex flex-col">
      <LocationTool
        v-if="currentLocation"
        ref="locationTool"
        :key="$route.params.location_id"
        :incident="selectedIncidentId"
        :organization="selectedOrganization && selectedOrganization.id"
        class="h-full"
        :locations="
          $route.params.location_id ? [$route.params.location_id] : []
        "
        @changed="setCurrentLocation"
      />
    </div>
  </div>
</template>

<script>
import Location from '@/models/Location';
import LocationType from '@/models/LocationType';
import Organization from '@/models/Organization';
import Incident from '@/models/Incident';
import LocationTool from '@/components/LocationTool';
import { forceFileDownload } from '@/utils/downloads';
import { getErrorMessage } from '@/utils/errors';
import { create } from 'vue-modal-dialogs';
import MessageBox from '@/components/dialogs/MessageBox';
const messageBox = create(MessageBox);

export default {
  name: 'Location',
  components: { LocationTool },
  data() {
    return {
      currentLocation: null,
      loading: false,
      locationAccess: 'Public',
      organizationResults: [],
      selectedOrganization: null,
      selectedIncidentId: null,
      relatedOrganizations: [],
      relatedIncidents: [],
    };
  },
  computed: {
    isNew() {
      return !this.$route.params.location_id;
    },
    locationTypes() {
      return LocationType.all();
    },
    selectedIncident() {
      if (this.selectedIncidentId) {
        return Incident.find(this.selectedIncidentId);
      }
      return null;
    },
    incidents() {
      return Incident.query()
        .orderBy('id', 'desc')
        .get();
    },
    isPrimaryResponseArea() {
      return (
        LocationType.query()
          .where('key', 'org_primary_response_area')
          .get()[0].id === this.currentLocation.type
      );
    },
    isSecondaryResponseArea() {
      return (
        LocationType.query()
          .where('key', 'org_secondary_response_area')
          .get()[0].id === this.currentLocation.type
      );
    },
    isIncidentRelated() {
      const incidentRelatedTypes = LocationType.query()
        .where('key', key =>
          [
            'incident_primary_damaged_area',
            'incident_storm_track',
            'incident_furthest_damaged_area',
            'incident_damage',
          ].includes(key),
        )
        .get();
      return incidentRelatedTypes.some(
        key => key.id === this.currentLocation.type,
      );
    },
  },
  async mounted() {
    await this.loadLocation();
  },
  methods: {
    async loadLocation() {
      this.loading = true;
      await LocationType.api().get('/location_types', {
        dataKey: 'results',
      });
      if (this.$route.params.location_id) {
        try {
          await Location.api().fetchById(this.$route.params.location_id);
          this.currentLocation = Location.find(this.$route.params.location_id);
          this.loadRelatedEntities();
        } catch (e) {
          this.currentLocation = new Location();
          await this.$router.replace(`/locations/new`);
        } finally {
          this.loading = false;
        }
      } else {
        this.reset();
      }
      this.loading = false;
    },
    reset() {
      this.currentLocation = new Location();
      this.currentPolygon = null;
      this.selectedIncidentId = null;
      this.selectedOrganization = null;
      if (this.$refs.locationTool) {
        this.$refs.locationTool.reset();
      }
    },
    async downloadCurrentLocation() {
      this.loading = true;
      const shapefile = await Location.api().download(
        this.$route.params.location_id,
      );
      forceFileDownload(shapefile.response);
      this.loading = false;
    },
    async deleteCurrentLocation() {
      this.loading = true;
      try {
        await Location.api().delete(
          `/locations/${this.$route.params.location_id}`,
          {
            delete: this.$route.params.location_id,
          },
        );
        await this.$toasted.success(this.$t('locationVue.location_deleted'));
        this.reset();
        await this.$router.push('/locations/new');
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.loading = false;
      }
    },
    setCurrentLocation(location) {
      this.currentPolygon = location;
    },
    async onSelectOrganization(value) {
      this.selectedOrganization = value;
      if (!this.currentLocation.name) {
        this.currentLocation.name = `${this.selectedOrganization.name} ${this.currentLocation.location_type.name_t}`;
      }
      if (this.isPrimaryResponseArea && value.primary_location) {
        const result = await messageBox({
          title: this.$t('locationVue.existing_location'),
          content: this.$t(
            'locationVue.location_already_exists_organization',
            {
              organization: value.name,
            },
          ),
          actions: {
            continue: {
              text: this.$t('actions.create_new'),
              type: 'outline',
              buttonClass: 'border border-black',
            },
            edit: {
              text: this.$t('actions.edit_existing'),
              type: 'solid',
              buttonClass: 'border border-black',
            },
          },
        });

        if (result === 'edit') {
          await this.$router.push(`/locations/${value.primary_location}/edit`);
        }
      }
    },

    async onSelectIncident(value) {
      this.selectedIncidentId = value;
      let incident = Incident.find(value);
      if (!this.currentLocation.name) {
        this.currentLocation.name = `${incident.name} ${this.currentLocation.location_type.name_t}`;
      }
      if (this.isIncidentRelated && incident.locations.length) {
        await Incident.api().fetchById(value);
        incident = Incident.find(value);
        const existingLocation = incident.locationModels.find(
          location => location.type === this.currentLocation.type,
        );
        if (existingLocation) {
          const result = await messageBox({
            title: this.$t('locationVue.existing_location'),
            content: this.$t('locationVue.location_already_exists_incident', {
              incident: incident.name,
            }),
            actions: {
              continue: {
                text: this.$t('actions.create_new'),
                type: 'outline',
                buttonClass: 'border border-black',
              },
              edit: {
                text: this.$t('actions.edit_existing'),
                type: 'outline',
                buttonClass: 'border border-black',
              },
            },
          });

          if (result === 'edit') {
            await this.$router.push(`/locations/${existingLocation.id}/edit`);
          }
        }
      }
    },
    async onOrganizationSearch(value) {
      const results = await Organization.api().get(
        `/organizations?search=${value}&limit=10&fields=id,name`,
        {
          dataKey: 'results',
        },
      );
      this.organizationResults = results.entities.organizations;
    },
    async saveLocation(goToNew) {
      const isValid = this.$refs.form.reportValidity();
      if (!isValid) {
        return;
      }

      if (!this.currentPolygon) {
        this.$toasted.error('locationVue.no_valid_drawing_found');
        return;
      }

      this.loading = true;
      let { geometry } = this.currentPolygon.toGeoJSON();
      const { type, features } = this.currentPolygon.toGeoJSON();
      if (type === 'FeatureCollection') {
        const [feature] = features;
        geometry = feature.geometry;
      }

      if (geometry.type === 'Point') {
        this.currentLocation.point = geometry;
      } else if (geometry.type === 'Polygon') {
        this.currentLocation.poly = geometry;
      } else if (geometry.type === 'MultiPolygon') {
        this.currentLocation.geom = geometry;
      }

      try {
        let response;
        if (this.$route.params.location_id) {
          response = await Location.api().put(
            `/locations/${this.$route.params.location_id}`,
            this.currentLocation,
          );
        } else {
          response = await Location.api().post(
            '/locations',
            this.currentLocation,
          );
          if (this.isPrimaryResponseArea) {
            await Organization.api().patch(
              `/organizations/${this.selectedOrganization.id}`,
              {
                primary_location: response.response.data.id,
              },
            );
          }

          if (this.isSecondaryResponseArea) {
            await Organization.api().patch(
              `/organizations/${this.selectedOrganization.id}`,
              {
                secondary_location: response.response.data.id,
              },
            );
          }

          if (this.isIncidentRelated) {
            await Incident.api().addLocation(
              this.selectedIncidentId,
              response.response.data.id,
            );
          }
        }
        await this.$toasted.success(this.$t('locationVue.location_saved'));

        if (goToNew) {
          this.reset();
        } else {
          const locationId = response.response.data.id;
          await this.$router.push(`/locations/${locationId}/edit`);
          await this.loadLocation();
        }
      } catch (e) {
        this.$log.error(e);
      } finally {
        this.loading = false;
      }
    },
    async loadRelatedEntities() {
      this.relatedOrganizations = [];
      this.relatedIncidents = [];
      if (this.isPrimaryResponseArea) {
        const results = await Organization.api().get(
          `/organizations?primary_location=${this.$route.params.location_id}&fields=id,name`,
          {
            dataKey: 'results',
          },
        );
        this.relatedOrganizations = [...results.entities.organizations];
      }
      if (this.isSecondaryResponseArea) {
        const results = await Organization.api().get(
          `/organizations?secondary_location=${this.$route.params.location_id}&fields=id,name`,
          {
            dataKey: 'results',
          },
        );
        this.relatedOrganizations = [...results.entities.organizations];
      }
      if (this.isIncidentRelated) {
        const incidentIds = this.currentLocation.joins.map(
          join => join.object_id,
        );
        const incidents = Incident.query()
          .whereIdIn(incidentIds)
          .get();
        this.relatedIncidents = [...incidents];
      }
    },
    async detachLocationFromOrganization(organization) {
      const data = {};
      if (this.isPrimaryResponseArea) {
        data.primary_location = null;
      }
      if (this.isSecondaryResponseArea) {
        data.secondary_location = null;
      }
      await Organization.api().patch(`/organizations/${organization.id}`, data);
      await this.loadLocation();
    },
    async detachLocationFromIncident(incident) {
      await Incident.api().removeLocation(incident.id, this.currentLocation.id);
      await this.loadLocation();
    },
  },
};
</script>

<style scoped>
.form-field {
  @apply my-2;
}
</style>
