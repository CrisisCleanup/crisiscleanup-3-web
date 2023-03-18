<template>
  <div class="">
    <div
      v-if="!isOrgActivityModalHidden"
      :class="isOrgActivityModalHidden ? 'translate-x-full' : 'translate-x-0'"
      class="w-full absolute top-0 right-0 flex justify-center transform transition duration-500"
      style="z-index: 1002"
    >
      <OrganizationActivityModal
        :is-loading="isOrgActivityModalLoading"
        :general-info="orgInfo.generalInfo"
        :styles="overlayStyles"
        @close="isOrgActivityModalHidden = true"
      />
    </div>
    <Table
      :columns="orgTable.columns"
      :data="organizations"
      :body-style="{ maxHeight: '40vh', ...styles }"
      :header-style="styles"
      :row-style="{ backgroundColor: 'unset' }"
      class="ml-1"
      @rowClick="onRowClick"
    >
      <template #name="slotProps">
        <img
          class="w-6 mr-2 rounded-full"
          :src="getLogoUrl(slotProps.item)"
          :alt="$t('profileOrg.organization_logo')"
        />
        <span class="truncate w-32">{{ slotProps.item.name }}</span>
      </template>
      <template #incident_count="slotProps">
        <span class="w-full flex justify-end">
          {{ nFormatter(slotProps.item.incident_count)
          }}<span class="pew-pew-blue">*</span>
        </span>
      </template>
      <template #commercial_value="slotProps">
        <span class="w-full flex justify-end">
          ${{ nFormatter(slotProps.item.commercial_value)
          }}<span class="pew-pew-blue">*</span>
        </span>
      </template>
      <template #calls_count="slotProps">
        <span class="w-full flex justify-end">
          {{ nFormatter(slotProps.item.calls_count) }}
        </span>
      </template>
      <template #reported_count="slotProps">
        <div class="w-full flex justify-end">
          <CaseDonutChart
            v-if="!isCaseDonutChartDataEmpty(slotProps.item)"
            class="w-8 h-8"
            :chart-id="`case-donut-chart-${slotProps.item.id}`"
            :chart-data="{
              reportedCases: slotProps.item.reported_count || 0,
              claimedCases:
                (slotProps.item.claimed_count || 0) -
                (slotProps.item.closed_count || 0),
              completedCases: slotProps.item.closed_count || 0,
            }"
          />
          <span v-else class="w-8 h-8 flex items-center justify-center">
            0<span class="pew-pew-blue">*</span>
          </span>
        </div>
      </template>
    </Table>
    <small
      class="py-1 px-8 small-font italic leading-3 text-center text-black absolute bottom-0 ribbon-gradient"
    >
      {{ $t('pewPew.org_disclaimer') }}
    </small>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { nFormatter } from '@/utils/helpers';
import { makeTableColumns } from '@/utils/table';
import { getQueryString } from '@/utils/urls';
import earthGlobe from '@/assets/icons/earth-globe.svg';
import CaseDonutChart from '@/components/live/CaseDonutChart.vue';
import Table from '@/components/Table.vue';
import OrganizationActivityModal from '@/components/live/OrganizationActivityModal.vue';
import type Organization from '@/models/Organization';

export default {
  name: 'LiveOrganizationTable',
  components: { OrganizationActivityModal, CaseDonutChart, Table },
  props: {
    organizations: {
      type: Array,
      default: () => [],
    },
    queryFilter: {
      type: Object,
      default: () => ({}),
    },
    styles: {
      type: Object,
      default: () => ({}),
    },
    overlayStyles: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const isOrgActivityModalLoading = ref(false);
    const isOrgActivityModalHidden = ref(true);

    const orgInfo = reactive({
      generalInfo: {} as Record<string, any>,
      incidents: [],
      capability: [],
    });
    const orgTable = computed(() => {
      const columns = makeTableColumns([
        ['name', '30%', 'Organization'],
        ['incident_count', '15%', 'Incidents'],
        ['reported_count', '15%', 'Cases'],
        ['calls_count', '15%', 'Calls'],
        ['commercial_value', '15%', 'Value'],
      ]);
      for (const column of columns) {
        // overwrite default column title from `Name` to `Organization`
        if (column.key === 'name') {
          column.title = 'Organization';
        }
        column.titleClass = 'small-font';
        column.class = 'small-font text-center';
        column.style = {
          border: 0,
        };
        column.headerStyle = {
          border: 0,
        };
      }
      return {
        columns,
      };
    });

    async function getOrganization(organization_id: string) {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/organizations/${organization_id}`,
        {
          headers: {
            Authorization: null,
          },
        },
      );
      return response.data;
    }
    async function getOrganizationCapabilities(organization_id: string) {
      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/organization_organizations_capabilities?organization=${organization_id}&limit=200`,
      );
      return response.data.results;
    }
    async function getOrganizationStatisticsByIncident(
      organization_id: string,
    ) {
      const { start_date, end_date } = props.queryFilter;
      const params = {
        start_date: start_date.format('YYYY-MM-DD'),
        end_date: end_date.format('YYYY-MM-DD'),
        organization: organization_id,
      };
      const queryString = getQueryString(params);

      const response = await axios.get(
        `${
          import.meta.env.VITE_APP_API_BASE_URL
        }/reports_data/organization_incident_statistics?${queryString}`,
      );
      return response.data;
    }

    function getLogoUrl(organization: Organization) {
      if (organization.files.length > 0) {
        const logos = organization.files.filter(
          (file) => file.file_type_t === 'fileTypes.logo',
        );
        if (logos.length > 0) {
          return logos[0].small_thumbnail_url;
        }
      }
      return earthGlobe;
    }

    function isCaseDonutChartDataEmpty(data: {
      reported_count: any;
      claimed_count: any;
      closed_count: any;
    }): boolean {
      // check if chart data is 0 for all sections
      return (
        (data.reported_count || 0) <= 0 &&
        (data.claimed_count || 0) - (data.closed_count || 0) <= 0 &&
        (data.closed_count || 0) <= 0
      );
    }

    async function onRowClick(item: Organization) {
      isOrgActivityModalLoading.value = true;
      const organization = await getOrganization(item.id);
      orgInfo.generalInfo = item;
      orgInfo.generalInfo.avatar = getLogoUrl(item);
      orgInfo.generalInfo.organization = organization;
      isOrgActivityModalHidden.value = false;

      // fetch statistics object and convert it into array
      orgInfo.generalInfo.capabilities = Object.values(
        await getOrganizationCapabilities(item.id),
      );

      // fetch capabilities object and convert it into array
      orgInfo.generalInfo.statistics = Object.values(
        await getOrganizationStatisticsByIncident(item.id),
      );
      isOrgActivityModalLoading.value = false;
    }

    return {
      nFormatter,
      orgTable,
      orgInfo,
      isOrgActivityModalLoading,
      isOrgActivityModalHidden,
      onRowClick,
      getLogoUrl,
      isCaseDonutChartDataEmpty,
    };
  },
};
</script>

<style scoped></style>
