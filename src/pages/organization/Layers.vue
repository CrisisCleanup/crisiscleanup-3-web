<template>
  <div class="w-3/4 m-auto">
    <LayerUploadTool />
    <div>
      <div class="flex justify-between">
        <div class="flex items-center">
          <base-input
            v-model="currentSearch"
            icon="search"
            class="w-72 mr-4"
            :placeholder="$t('actions.search')"
            @input="getLocations"
          ></base-input>
          <form-select
            v-model="locationTypeFilter"
            :options="locationTypes"
            class="w-64 border border-crisiscleanup-dark-100"
            item-key="id"
            label="name_t"
            :placeholder="$t('locationVue.location_type')"
            select-classes="bg-white border text-xs location-select p-1"
            @input="getLocations"
          />
        </div>
        <base-button
          text="~~Create Location"
          type="primary"
          class="px-3 py-1 my-3"
          :action="
            () => {
              $router.push('/locations/new');
            }
          "
        />
      </div>
      <LocationTable
        :locations="locations"
        :meta="locationsMeta"
        :loading="locationsLoading"
        @change="handleTableChange"
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
    async getLocations() {
      this.locationsLoading = true;
      const params = {
        created_by__organization: this.currentUser.organization.id,
        type__isnull: false,
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
        },
      );
      const { locations } = results.entities;
      this.locations = locations;

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
