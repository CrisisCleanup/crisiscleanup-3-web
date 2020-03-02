<template>
  <div class="w-3/4 m-auto">
    <LayerUploadTool />
    <div>
      <div class="flex justify-between">
        <base-input
          v-model="currentSearch"
          icon="search"
          class="w-84 mr-4"
          :placeholder="$t('actions.search')"
          @input="getLocations"
        ></base-input>
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
import { getQueryString } from '../../utils/urls';
export default {
  name: 'Layers',
  components: { LocationTable, LayerUploadTool },
  data() {
    return {
      locations: [],
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

<style scoped></style>
