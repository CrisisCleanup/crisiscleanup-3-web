<template>
  <Table
    class="border"
    :data="worksites"
    :columns="columns"
    enable-selection
    enable-pagination
    :pagination="pagination"
    :sorter="sorter"
    :loading="tableLoading"
    :body-style="{ height: '60vh' }"
    @change="handleTableChange"
    @rowClick="displayWorksite"
    @selectionChanged="
      (selectedItems) => {
        $emit('selectionChanged', selectedItems);
      }
    "
  >
    <template #flags="slotProps">
      <div class="case-flag w-8">
        <router-link
          v-if="slotProps.item.flags.length > 0"
          :to="`/incident/${$route.params.incident_id}/cases/${slotProps.item.id}/flag`"
        >
          <ccu-icon
            :alt="$t('actions.flag')"
            size="medium"
            class="p-1 py-2"
            type="flag-filled"
          />
        </router-link>
      </div>
    </template>
    <template #work_types="slotProps">
      <div class="flex flex-col">
        <div
          v-for="work_type in slotProps.item.work_types"
          :key="`${work_type.id}`"
          class="badge-holder flex items-center"
        >
          <badge
            class="mx-1"
            :color="
              getColorForStatus(work_type.status, Boolean(work_type.claimed_by))
            "
          />
          {{ work_type.work_type | getWorkTypeName }}
        </div>
      </div>
    </template>
  </Table>
</template>
<script>
import Table from '@/components/Table';
import { getColorForStatus } from '@/filters';
import VueTypes from 'vue-types';

export default {
  name: 'WorksiteTable',
  components: { Table },
  data() {
    return {
      getColorForStatus,
    };
  },
  props: {
    worksites: VueTypes.object,
    pagination: VueTypes.object,
    selectedTableItems: VueTypes.array,
    sorter: VueTypes.object,
    tableLoading: VueTypes.bool,
  },
  computed: {
    columns() {
      return [
        {
          title: this.$t('casesVue.number_abbrev'),
          dataIndex: 'case_number',
          key: 'case_number',
          sortKey: 'id',
          width: '0.5fr',
          sortable: true,
        },
        {
          title: '',
          dataIndex: 'flags',
          key: 'flags',
          width: '0.25fr',
        },
        {
          title: this.$t('casesVue.work_type'),
          dataIndex: 'work_types',
          key: 'work_types',
          scopedSlots: { customRender: 'work_types' },
          width: '1.5fr',
        },
        {
          title: this.$t('casesVue.name'),
          dataIndex: 'name',
          key: 'name',
          width: '1.5fr',
          sortable: true,
        },
        {
          title: this.$t('casesVue.full_address'),
          dataIndex: 'address',
          key: 'address',
        },
        {
          title: this.$t('casesVue.city'),
          dataIndex: 'city',
          key: 'city',
          sortable: true,
        },
        {
          title: this.$t('casesVue.county_parish'),
          dataIndex: 'county',
          key: 'county',
          sortable: true,
        },
      ];
    },
  },
  methods: {
    handleTableChange({ pagination, filters, sorter }) {
      this.$emit('handleTableChange', { pagination, filters, sorter });
    },
    displayWorksite(worksite) {
      this.$emit('displayWorksite', worksite);
    },
  },
};
</script>
