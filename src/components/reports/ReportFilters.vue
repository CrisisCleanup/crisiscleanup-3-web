<template>
  <div class="p-1">
    <div class="text-base">{{ $t('reports.filters') }}</div>
    <div class="grid grid-cols-3 gap-3">
      <template v-for="input in inputs" :key="input">
        <div v-if="input.filter === 'timerange'" :key="input" class="my-1">
          <datepicker
            v-model="filters[input.field]"
            range
            auto-apply
            format="yyyy-MM-dd"
          />
        </div>
        <div v-if="input.filter === 'organizations'" :key="input" class="my-1">
          <base-select
            v-model="filters[input.field]"
            searchable
            multiple
            item-key="id"
            label="name"
            :placeholder="$t('reports.organizations_optional')"
            :options="onOrganizationSearch"
            select-classes="bg-white outline-none w-full h-12"
          />
        </div>
        <div v-if="input.filter === 'work_types'" :key="input" class="my-1">
          <base-select
            v-model="filters[input.field]"
            searchable
            multiple
            item-key="key"
            label="name_t"
            :placeholder="$t('reports.filter_by_work_type')"
            :options="filteredWorkTypes"
            select-classes="bg-white outline-none w-full h-12"
          />
        </div>
        <div v-if="input.filter === 'location'" :key="input" class="my-1">
          <base-select
            v-model="filters[input.field]"
            searchable
            item-key="id"
            label="name"
            :placeholder="$t('locationTool.search_several_area_types')"
            :options="onLocationSearch"
            select-classes="bg-white outline-none w-full h-12"
          />
        </div>
      </template>
    </div>
    <div class="flex mt-4 justify-end">
      <base-button
        variant="outline"
        :action="printReport"
        :text="$t('actions.print')"
        class="ml-2 p-3 px-6 text-xs"
      />
      <base-button
        variant="solid"
        :action="downloadCSV"
        :text="$t('actions.download_csv')"
        class="ml-2 p-3 px-6 text-xs"
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
import { onMounted, ref, computed } from 'vue';
import moment from 'moment';
import { useStore } from 'vuex';
import Location from '@/models/Location';
import Organization from '@/models/Organization';
import { getQueryString } from '@/utils/urls';
import Incident from '@/models/Incident';

export default defineComponent({
  name: 'ReportFilters',
  props: {
    inputs: {
      type: Array,
      default: () => [],
    },
  },
  emits: ['onFilter', 'onCSV', 'onPrint'],
  setup(props, { emit }) {
    const store = useStore();
    const workTypes = store.getters['enums/workTypes'];
    const currentIncidentId = computed(
      () => store.getters['incident/currentIncidentId'],
    );
    const filters = ref<any>({});
    const locations = ref<any[]>([]);
    const organizations = ref<any[]>([]);
    const currentIncident = computed(() => {
      return Incident.find(currentIncidentId.value);
    });
    const router = useRouter();
    const route = useRoute();

    const queryParmToFilter = (queryParam, filterType) => {
      if (filterType === 'timerange') {
        const [start, end] = queryParam.split('|');
        return [moment(start).toDate(), moment(end).toDate()];
      }

      return queryParam.split(',');
    };

    const buildQuery = () => {
      const query = {};
      for (const key of Object.keys(filters.value)) {
        if (filters.value[key] === null) {
          query[key] = filters.value[key];
        } else if (
          moment(filters.value[key][0], 'YYYY-MM-DD', true).isValid()
        ) {
          const start = moment(filters.value[key][0]).format('YYYY-MM-DD');
          const end = moment(filters.value[key][1]).format('YYYY-MM-DD');
          query[key] = `${start}|${end}`;
        } else if (Array.isArray(filters.value[key])) {
          query[key] = filters.value[key].join(',');
        } else {
          query[key] = filters.value[key];
        }
      }

      return query;
    };

    const applyFilters = () => {
      const query = buildQuery();

      for (const key in query) {
        if (query[key] === null || query[key] === undefined) {
          delete query[key];
        }
      }

      router.replace({ ...router.currentRoute, query } as any);
      emit('onFilter', query);
    };

    if (props.inputs)
      for (const input of props.inputs) {
        if (input.filter === 'timerange') {
          filters.value[input.field] = [
            moment(currentIncident.value.start_at).toDate(),
            new Date(),
          ];
        }

        let runReport = false;
        if (route.query[input.field]) {
          runReport = true;
          filters.value[input.field] = queryParmToFilter(
            route.query[input.field],
            input.filter,
          );
        }

        if (runReport) {
          applyFilters();
        }
      }

    const downloadCSV = () => {
      const query = buildQuery();
      emit('onCSV', query);
    };

    const printReport = () => {
      const query = buildQuery();
      emit('onPrint', query);
    };

    const onLocationSearch = async (value: string) => {
      const params = {
        type__key__in:
          'boundary_political_us_county,boundary_political_us_state,boundary_political_us_city,boundary_political_us_zip_code,boundary_political_us_fema_region',
        incident_area: currentIncidentId.value,
        limit: 10,
        sort: 'name',
        search: value,
      };

      const queryString = getQueryString(params);
      const results = await Location.api().get(`/locations?${queryString}`, {
        dataKey: 'results',
      });
      return results.response.data.results;
    };

    const onOrganizationSearch = async (value: string) => {
      const params = {
        incident: currentIncidentId.value,
        limit: 10,
        fields: 'id,name',
        sort: 'name',
        search: value,
      };

      const queryString = getQueryString(params);
      const results = await Organization.api().get(
        `/organizations?${queryString}`,
        {
          dataKey: 'results',
        },
      );
      return results.response.data.results;
    };

    const filteredWorkTypes = computed(() => {
      return (
        currentIncident.value.created_work_types &&
        workTypes.filter((wt) =>
          currentIncident.value.created_work_types.includes(wt.key),
        )
      );
    });

    // onMounted(async () => {
    //   onLocationSearch().then(() => {});
    //   onOrganizationSearch().then(() => {});
    // });

    return {
      filters,
      filteredWorkTypes,
      locations,
      organizations,
      applyFilters,
      downloadCSV,
      printReport,
      onOrganizationSearch,
      onLocationSearch,
    };
  },
});
</script>

<style scoped></style>
