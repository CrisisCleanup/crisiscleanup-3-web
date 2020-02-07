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
        <div class="font-bold">{{ $t('actions.new_location') }}</div>
        <div class="flex">
          <ccu-icon
            alt="$t('actions.edit_location')"
            size="small"
            class="p-1 py-2"
            type="edit"
            @click.native="() => {}"
          />
          <ccu-icon
            alt="$t('locationVue.download_as_shapefile')"
            size="small"
            class="p-1 py-2"
            type="download"
            @click.native="() => {}"
          />
          <ccu-icon
            alt="$t('actions.share_location')"
            size="small"
            class="p-1 py-2"
            type="share"
          />
          <ccu-icon
            alt="$t('actions.delete')"
            size="small"
            class="p-1 py-2"
            type="trash"
            @click.native="() => {}"
          />
        </div>
      </div>
      <form
        v-if="currentLocation"
        ref="form"
        class="form flex-grow flex flex-col justify-between w-84"
        @submit.prevent="saveLocation"
      >
        <div class="flex flex-col">
          <base-input
            v-model="currentLocation.name"
            type="text"
            class="input form-field"
            size="large"
            placeholder="$t('locationVue.location_name')"
          />
          <form-select
            v-if="!loading"
            :value="currentLocation.type"
            :options="locationTypes"
            item-key="id"
            label="name_t"
            placeholder="$t('locationVue.location_type')"
            select-classes="bg-white border w-full h-12"
            @input="
              type => {
                currentLocation.type = type;
                selectedIncident = null;
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
                placeholder="$t('locationVue.search_for_organization')"
                clear-on-selected
                @selected="
                  value => {
                    selectedOrganization = value;
                  }
                "
                @search="onOrganizationSearch"
              />
            </div>
            <div v-if="isIncidentRelated">
              <form-select
                v-model="selectedIncident"
                class="form-field"
                :options="incidents"
                searchable
                select-classes="bg-white border w-full h-12 mb-3"
                item-key="id"
                label="name"
                placeholder="$t('locationVue.select_incident')"
              />
            </div>
          </div>

          <textarea
            v-model="currentLocation.notes"
            class="text-base form-field border outline-none p-2 resize-none"
            rows="4"
            placeholder="$t('locationVue.notes')"
          />
          <div>
            <div class="mt-8 text-base">{{ $t('locationVue.access') }}</div>
            <div class="flex mt-2">
              <base-radio
                class="mr-6"
                name="Private"
                label="Private"
                :value="locationAccess"
                @change="locationAccess = $event"
              />
              <base-radio
                class="mr-6"
                name="Public"
                label="Public"
                :value="locationAccess"
                @change="locationAccess = $event"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center justify-end h-16">
          <base-button
            :text="$t('actions.reset')"
            class="border-2 border-black mx-2 p-2 px-4"
          />
          <base-button
            :text="$t('actions.save_location')"
            class="mx-2 p-2 px-4"
            type="primary"
            :action="saveLocation"
          />
        </div>
      </form>
    </div>
    <div class="flex-grow flex flex-col">
      <LocationTool
        v-if="currentLocation"
        :incident="selectedIncident"
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

export default {
  name: 'Location',
  components: { LocationTool },
  data() {
    return {
      currentLocation: null,
      loading: false,
      locationAccess: 'Private',
      organizationResults: [],
      selectedOrganization: null,
      selectedIncident: null,
    };
  },
  computed: {
    locationTypes() {
      return LocationType.all();
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
    async saveLocation() {
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
              this.selectedIncident,
              response.response.data.id,
            );
          }
        }
        const locationId = response.response.data.id;
        await Location.api().fetchById(locationId);
        this.currentLocation = Location.find(locationId);
        await this.$router.push(`/locations/${locationId}/edit`);
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
