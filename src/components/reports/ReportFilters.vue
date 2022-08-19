<template>
  <div class="p-1">
    <div class="text-base">{{ $t('~~Filters') }}</div>
    <div class="grid grid-cols-3 gap-3">
      <template v-for="input in inputs">
        <div v-if="input.filter === 'organizations'" :key="input" class="my-1">
          <OrganizationSearchInput
            @selectedOrganization="filters[input.field] = $event.id"
            class="h-12"
            size="large"
          />
        </div>
        <div v-if="input.filter === 'work_types'" :key="input" class="my-1">
          <form-select
            :key="input"
            v-model="filters[input.field]"
            multiple
            item-key="key"
            label="name_t"
            :placeholder="$t('~~Filter by work type')"
            :options="workTypes"
            select-classes="bg-white border text-xs h-12 role-select p-1 form-multiselect"
          />
        </div>
        <div v-if="input.filter === 'timerange'" :key="input" class="my-1">
          <vc-date-picker v-model="filters[input.field]" is-range :key="input">
            <template v-slot="{ inputValue, inputEvents }">
              <div class="flex items-center">
                <input
                  :value="inputValue.start"
                  v-on="inputEvents.start"
                  class="
                    border
                    px-2
                    py-1
                    w-32
                    h-12
                    focus:outline-none
                    text-base
                  "
                  :placeholder="$t('~~Start Date')"
                />
                <svg
                  class="w-4 h-4 mx-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
                <input
                  :value="inputValue.end"
                  v-on="inputEvents.end"
                  class="
                    border
                    px-2
                    py-1
                    w-32
                    h-12
                    focus:outline-none
                    text-base
                  "
                  :placeholder="$t('~~End Date')"
                />
              </div>
            </template>
          </vc-date-picker>
        </div>
        <div v-if="input.filter === 'location'" :key="input" class="my-1">
          <form-select
            searchable
            :key="input"
            v-model="filters[input.field]"
            item-key="id"
            label="name"
            :placeholder="$t('locationTool.search_several_area_types')"
            :options="locations"
            select-classes="bg-white border text-xs h-12 role-select p-1 form-multiselect"
          />
        </div>
      </template>
    </div>
    <base-button
      variant="solid"
      :action="applyFilters"
      :text="$t('actions.apply')"
      class="ml-2 p-3 px-6 text-xs"
    />
    <base-button
      variant="solid"
      :action="downloadCSV"
      :text="$t('~~Download CSV')"
      class="ml-2 p-3 px-6 text-xs"
    />
  </div>
</template>

<script lang="ts">
import { onMounted, ref } from '@vue/composition-api';
import { useGetters, useState } from '@u3u/vue-hooks';
import moment from 'moment';
import OrganizationSearchInput from '@/components/OrganizationSearchInput.vue';
import Location from '@/models/Location';
import { getQueryString } from '@/utils/urls';

export default {
  name: 'ReportFilters',
  components: { OrganizationSearchInput },
  props: {
    inputs: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const { workTypes } = useGetters('enums', ['workTypes']);
    const filters = ref<any>({});
    const locations = ref<any[]>([]);
    const { currentIncidentId } = useState('incident', ['currentIncidentId']);

    const buildQuery = () => {
      const query = {};
      Object.keys(filters.value).forEach((key) => {
        if (filters.value[key].start && filters.value[key].end) {
          const start = moment(filters.value[key].start).format('YYYY-MM-DD');
          const end = moment(filters.value[key].end).format('YYYY-MM-DD');
          query[key] = `${start}|${end}`;
        } else if (Array.isArray(filters.value[key])) {
          query[key] = filters.value[key].join(',');
        } else {
          query[key] = filters.value[key];
        }
      });
      return query;
    };

    const applyFilters = () => {
      const query = buildQuery();
      emit('onFilter', query);
    };

    const downloadCSV = () => {
      const query = buildQuery();
      emit('onCSV', query);
    };

    const onLocationSearch = async () => {
      const params = {
        type__key__in: 'boundary_political_us_county',
        incident_area: currentIncidentId.value,
        limit: 500,
      };

      const queryString = getQueryString(params);
      const results = await Location.api().get(`/locations?${queryString}`, {
        dataKey: 'results',
      });
      locations.value = results.response.data.results;
    };

    onMounted(async () => {
      await onLocationSearch();
    });

    return { filters, workTypes, locations, applyFilters, downloadCSV };
  },
};
</script>

<style scoped></style>
