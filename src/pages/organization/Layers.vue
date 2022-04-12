<template>
  <div class="w-3/4 m-auto">
    <LayerUploadTool :key="locations" @addedLayer="getLocations" />
    <div class="mb-24">
      <div class="flex justify-between mb-2">
        <div class="flex flex-col sm:flex-row items-center">
          <base-input
            v-model="currentSearch"
            icon="search"
            class="sm:w-72 w-full sm:mr-4"
            :placeholder="$t('actions.search')"
            @input="getLocations"
          ></base-input>
          <div class="flex w-full">
            <form-select
              v-model="locationTypeFilter"
              :options="locationTypes"
              class="w-full sm:w-64 border border-crisiscleanup-dark-100"
              item-key="id"
              label="name_t"
              :placeholder="$t('locationVue.location_type')"
              select-classes="bg-white border text-xs location-select p-1"
              @input="getLocations"
            />
            <base-button
              :text="$t('actions.create_location')"
              :alt="$t('actions.create_location')"
              variant="solid"
              size="small"
              :action="
                () => {
                  $router.push('/locations/new');
                }
              "
            />
          </div>
        </div>
      </div>
      <LocationTable
        :locations="locations"
        :meta="locationsMeta"
        :loading="locationsLoading"
        @change="handleTableChange"
        @deleteLocation="deleteLocation"
      />
    </div>
  </div>
</template>

<script>
import LayerUploadTool from '@/components/LayerUploadTool';
import LocationTable from '../../components/LocationTable';
import User from '../../models/User';
import Location from '../../models/Location';
import LocationType from '../../models/LocationType';
import { getQueryString } from '../../utils/urls';
import { getErrorMessage } from '../../utils/errors';

export default {
  name: 'Layers',
  components: { LocationTable, LayerUploadTool },
  data() {
    return {
      locations: [],
      locationTypeFilter: null,
      currentSearch: '',
      locationsLoading: false,
      locationsMeta: {
        pagination: {
          pageSize: 20,
          page: 1,
          current: 1,
        },
      },
    };
  },
  computed: {
    currentUser() {
      return User.find(this.$store.getters['auth/userId']);
    },
    locationTypes() {
      return LocationType.all();
    },
  },
  methods: {
    async handleTableChange({ pagination }) {
      this.locationsMeta.pagination = { ...pagination };
      await this.getLocations();
    },
    async deleteLocation(locationId) {
      this.locationsLoading = true;
      try {
        await Location.api().delete(`/locations/${locationId}`, {
          delete: locationId,
        });
        await this.$toasted.success(this.$t('locationVue.location_deleted'));
        await this.getLocations();
      } catch (error) {
        await this.$toasted.error(getErrorMessage(error));
      } finally {
        this.locationsLoading = false;
      }
    },
    async getLocations() {
      this.locationsLoading = true;
      const params = {
        created_by__organization: this.currentUser.organization.id,
        type__isnull: false,
        fields: 'id,name,type,shared',
        offset:
          this.locationsMeta.pagination.pageSize *
          (this.locationsMeta.pagination.page - 1),
        limit: this.locationsMeta.pagination.pageSize,
      };
      if (this.currentSearch) {
        params.search = this.currentSearch;
      }
      if (this.locationTypeFilter) {
        params.type = this.locationTypeFilter;
      }
      const results = await Location.api().get(
        `/locations?${getQueryString(params)}`,
        {
          dataKey: 'results',
          save: false,
        },
      );
      this.locations = results.response.data.results;

      this.locationsMeta.pagination.total = results.response.data.count;
      this.locationsMeta.pagination = { ...this.locationsMeta.pagination };
      this.locationsLoading = false;
    },
  },
  async mounted() {
    await this.getLocations();
  },
};
</script>

<style>
.location-select .vs__selected {
  @apply text-xs bg-white !important;
}
</style>
