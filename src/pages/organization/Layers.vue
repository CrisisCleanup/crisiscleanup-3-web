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
            <base-select
              v-model="locationTypeFilter"
              :options="locationTypes"
              class="w-full sm:w-64 border border-crisiscleanup-dark-100"
              item-key="id"
              label="name_t"
              :placeholder="$t('locationVue.location_type')"
              select-classes="bg-white border text-xs location-select p-1"
              @update:modelValue="getLocations"
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

<script lang="ts">
import { useToast } from 'vue-toastification';
import LayerUploadTool from '@/components/LayerUploadTool.vue';
import LocationTable from '@/components/LocationTable.vue';
import User from '@/models/User';
import Location from '@/models/Location';
import LocationType from '@/models/LocationType';
import { getQueryString } from '@/utils/urls';
import { getErrorMessage } from '@/utils/errors';

export default defineComponent({
  name: 'Layers',
  components: { LocationTable, LayerUploadTool },
  setup() {
    const store = useStore();
    const toasted = useToast();
    const { t } = useI18n();

    const currentUser = computed(() => User.find(store.getters['auth/userId']));
    const locationTypes = computed(() => LocationType.all());
    const locationTypeFilter = ref();
    const currentSearch = ref<string>('');
    const locationsLoading = ref(false);
    const locations = ref<Array<Location>>([]);
    const locationsMeta = reactive({
      pagination: {
        pageSize: 20,
        page: 1,
        current: 1,
        total: 0,
      },
    });

    const getLocations = async () => {
      locationsLoading.value = true;
      const params: Record<string, any> = {
        created_by__organization: currentUser.value?.organization.id,
        type__isnull: false,
        fields: 'id,name,type,shared',
        offset:
          locationsMeta.pagination.pageSize *
          (locationsMeta.pagination.page - 1),
        limit: locationsMeta.pagination.pageSize,
      };
      if (currentSearch.value) {
        params.search = currentSearch.value;
      }
      if (locationTypeFilter.value) {
        params.type = locationTypeFilter.value;
      }
      const results = await Location.api().get(
        `/locations?${getQueryString(params)}`,
        {
          dataKey: 'results',
          save: false,
        },
      );
      locations.value = results.response.data.results;

      locationsMeta.pagination.total = results.response.data.count;
      locationsMeta.pagination = { ...locationsMeta.pagination };
      locationsLoading.value = false;
    };

    const handleTableChange = async ({ pagination }) => {
      locationsMeta.pagination = { ...pagination };
      await getLocations();
    };

    const deleteLocation = async (locationId: string) => {
      locationsLoading.value = true;
      try {
        await Location.api().delete(`/locations/${locationId}`, {
          delete: locationId,
        });
        await toasted.success(t('locationVue.location_deleted'));
        await getLocations();
      } catch (error) {
        await toasted.error(getErrorMessage(error));
      } finally {
        locationsLoading.value = false;
      }
    };

    onMounted(async () => await getLocations());

    return {
      currentUser,
      locationTypes,
      locations,
      locationTypeFilter,
      currentSearch,
      locationsLoading,
      locationsMeta,
      getLocations,
      handleTableChange,
      deleteLocation,
    };
  },
});
</script>

<style scoped lang="postcss">
.location-select .vs__selected {
  @apply text-xs bg-white !important;
}
</style>
