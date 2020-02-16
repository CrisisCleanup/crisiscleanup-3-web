<template>
  <div class="flex h-full relative">
    <div
      v-if="loading"
      style="z-index: 1001;"
      class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
    >
      <spinner />
    </div>
    <div v-else class="mx-2 flex flex-col">
      <div class="h-16 flex items-center justify-between">
        <div v-if="isNew" class="font-bold">
          {{ $t('actions.new_location') }}
        </div>
        <div v-else class="font-bold">
          {{ $t('actions.edit') }} {{ currentLocation.name }}
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
        class="form flex-grow flex flex-col justify-between w-84"
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
                @selected="
                  value => {
                    selectedOrganization = value;
                    if (!currentLocation.name) {
                      currentLocation.name = `${selectedOrganization.name} ${currentLocation.location_type.name_t}`;
                    }
                  }
                "
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
                @input="
                  value => {
                    selectedIncidentId = value;
                    if (!currentLocation.name) {
                      currentLocation.name = `${selectedIncident.name} ${currentLocation.location_type.name_t}`;
                    }
                  }
                "
              />
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
                label="publix"
                :name="$t('locationVue.public')"
                :value="currentLocation.shared"
                @change="currentLocation.shared = $event"
              />
            </div>
          </div>
        </div>
        <div v-if="selectedOrganization">
          <div class="text-base">{{ $t('~~Organization Incidents') }}</div>
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
            type="primary"
            :action="saveLocation"
          />
          <base-button
            v-if="isNew"
            :text="$t('~~Save and New')"
            class="p-2"
            type="primary"
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
        :incident="selectedIncidentId"
        :organization="selectedOrganization && selectedOrganization.id"
        class="h-full"
        :locations="currentLocation.id ? [currentLocation.id] : []"
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
    this.loading = true;
    await LocationType.api().get('/location_types', {
      dataKey: 'results',
    });
    if (this.$route.params.location_id) {
      try {
        await Location.api().fetchById(this.$route.params.location_id);
        this.currentLocation = Location.find(this.$route.params.location_id);
      } catch (e) {
        this.currentLocation = new Location();
        await this.$router.replace(`/locations/new`);
      } finally {
        this.loading = false;
      }
    } else {
      this.currentLocation = new Location();
    }
    this.loading = false;
  },
  methods: {
    async downloadCurrentLocation() {
      this.loading = true;
      const shapefile = await Location.api().download(this.currentLocation.id);
      forceFileDownload(shapefile.response);
      this.loading = false;
    },
    async deleteCurrentLocation() {
      this.loading = true;
      await Location.api().delete(`/locations/${this.currentLocation.id}`, {
        delete: this.currentLocation.id,
      });
      this.loading = false;
      await this.$toasted.success(this.$t('~~Location Deleted'));
      await this.$router.push('/locations/new');
    },
    setCurrentLocation(location) {
      this.currentPolygon = location;
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
        this.$toasted.error('~~No valid drawing found');
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
        if (this.currentLocation.id) {
          response = await Location.api().put(
            `/locations/${this.currentLocation.id}`,
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
        await this.$toasted.success(this.$t('~~Location Saved'));

        if (goToNew) {
          this.currentLocation = new Location();
          this.currentPolygon = null;
          this.selectedIncidentId = null;
          this.selectedOrganization = null;
          this.$refs.locationTool.clearAll();
        } else {
          const locationId = response.response.data.id;
          await Location.api().fetchById(locationId);
          this.currentLocation = Location.find(locationId);
          await this.$router.push(`/locations/${locationId}/edit`);
        }
      } catch (e) {
        this.$log.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.form-field {
  @apply my-2;
}
</style>
