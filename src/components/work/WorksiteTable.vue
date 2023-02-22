<template>
  <AjaxTable
    :columns="columns"
    :url="tableUrl"
    :body-style="{ height: '24rem' }"
    ref="table"
    class="mt-6 shadow-lg"
    :query="worksiteQuery"
    enable-selection
    @rowClick="
      (worksite) => {
        $emit('rowClick', worksite);
      }
    "
    @selectionChanged="(payload) => $emit('selectionChanged', payload)"
  >
    <template #work_types="slotProps">
      <div class="flex flex-col">
        <div
          v-for="work_type in slotProps.item.work_types"
          :key="`${work_type.id}`"
          class="badge-holder flex items-center cursor-pointer"
          :title="getStatusName(work_type.status)"
        >
          <badge
            class="mx-1"
            :color="
              getColorForStatus(work_type.status, Boolean(work_type.claimed_by))
            "
          />
          {{ getWorkTypeName(work_type.work_type) }}
        </div>
      </div>
    </template>
  </AjaxTable>
</template>

<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AjaxTable from '@/components/AjaxTable.vue';
import {
  getColorForStatus,
  getWorkTypeName,
  getStatusName,
} from '../../filters';

export default {
  name: 'WorksiteTable',
  components: { AjaxTable },

  setup() {
    const { t } = useI18n();

    const columns = ref([
      {
        title: t('casesVue.number_abbrev'),
        dataIndex: 'case_number',
        key: 'case_number',
        sortKey: 'id',
        width: '0.5fr',
        sortable: true,
      },
      {
        title: t('casesVue.work_type'),
        dataIndex: 'work_types',
        key: 'work_types',
        scopedSlots: { customRender: 'work_types' },
        width: '1.5fr',
      },
      {
        title: t('casesVue.name'),
        dataIndex: 'name',
        key: 'name',
        width: '1.5fr',
        sortable: true,
      },
      {
        title: t('casesVue.full_address'),
        dataIndex: 'address',
        key: 'address',
      },
      {
        title: t('casesVue.city'),
        dataIndex: 'city',
        key: 'city',
        sortable: true,
      },
      {
        title: t('casesVue.county_parish'),
        dataIndex: 'county',
        key: 'county',
        sortable: true,
      },
    ]);
    const tableUrl = `${import.meta.env.VITE_APP_API_BASE_URL}/worksites`;
    return { columns, tableUrl, getColorForStatus, getWorkTypeName, getStatusName };
  },
  props: {
    worksiteQuery: { type: Object, default: null, required: false },
  },
};
</script>

<style scoped></style>
