<template>
  <div class="p-1">
    <div class="text-base">{{ $t('reports.filters') }}</div>
    <div class="grid grid-cols-3 gap-3">
      <template v-for="input in inputs">
        <div v-if="input.filter === 'timerange'" :key="input" class="my-1">
          <litepie-datepicker
            v-model="filters[input.field]"
            :formatter="{
              date: 'YYYY-MM-DD',
              month: 'MMM',
            }"
          />
        </div>
        <div v-if="input.filter === 'organizations'" :key="input" class="my-1">
          <form-select
            searchable
            multiple
            :key="input"
            v-model="filters[input.field]"
            item-key="id"
            label="name"
            :placeholder="$t('reports.organizations_optional')"
            :options="organizations"
            select-classes="bg-white border text-xs h-12 role-select p-1 form-multiselect"
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
            :options="filteredWorkTypes"
            select-classes="bg-white border text-xs h-12 role-select p-1 form-multiselect"
          />
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
    <div class="flex mt-4 justify-end">
      <base-button
        variant="solid"
        :action="downloadCSV"
        :text="$t('actions.download_csv')"
        class="p-3 px-6 text-xs"
      />
      <base-button
        variant="solid"
        :action="applyFilters"
        :text="$t('actions.run_report')"
        class="ml-2 p-3 px-6 text-xs"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { onMounted, ref, computed } from '@vue/composition-api';
import { useGetters, useState } from '@u3u/vue-hooks';
import moment from 'moment';
import LitepieDatepicker from 'vue2-litepie-datepicker';
import Location from '@/models/Location';
import Organization from '@/models/Organization';
import { getQueryString } from '@/utils/urls';

export default {
  name: 'ReportFilters',
  components: {
    LitepieDatepicker,
  },
  props: {
    inputs: {
      type: Array,
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const { workTypes } = useGetters('enums', ['workTypes']);
    const { currentIncident } = useGetters('incident', ['currentIncident']);
    const filters = ref<any>({});
    const locations = ref<any[]>([]);
    const organizations = ref<any[]>([]);
    const { currentIncidentId } = useState('incident', ['currentIncidentId']);

    props.inputs?.forEach((input) => {
      if (input.filter === 'timerange') {
        filters.value[input.field] = [
          moment(currentIncident.value.start_at).toDate(),
          new Date(),
        ];
      }
    });

    const buildQuery = () => {
      const query = {};
      Object.keys(filters.value).forEach((key) => {
        if (moment(filters.value[key][0], 'YYYY-MM-DD', true).isValid()) {
          const start = moment(filters.value[key][0]).format('YYYY-MM-DD');
          const end = moment(filters.value[key][1]).format('YYYY-MM-DD');
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

    const onOrganizationSearch = async () => {
      const params = {
        incident: currentIncidentId.value,
        limit: 500,
      };

      const queryString = getQueryString(params);
      const results = await Organization.api().get(
        `/organizations?${queryString}`,
        {
          dataKey: 'results',
        },
      );
      organizations.value = results.response.data.results;
    };

    const filteredWorkTypes = computed(() => {
      return (
        currentIncident.value.created_work_types &&
        workTypes.value.filter((wt) =>
          currentIncident.value.created_work_types.includes(wt.key),
        )
      );
    });

    onMounted(async () => {
      await onLocationSearch();
      await onOrganizationSearch();
    });

    return {
      filters,
      filteredWorkTypes,
      locations,
      organizations,
      applyFilters,
      downloadCSV,
    };
  },
};
</script>

<style scoped></style>
