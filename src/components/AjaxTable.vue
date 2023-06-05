<template>
  <div>
    <div class="flex items-center justify-between">
      <base-input
        v-if="enableSearch"
        data-testid="testTableSearchTextInput"
        :model-value="search"
        icon="search"
        class="w-72 mx-4"
        :placeholder="$t('info.search_items')"
        @update:modelValue="
          (value) => {
            search = value;
            meta.pagination.page = 1;
            throttle(getData, 1000)();
          }
        "
      ></base-input>
      <slot name="header-actions"> </slot>
    </div>
    <Table
      :columns="columns"
      :data="data"
      :body-style="bodyStyle"
      :pagination="meta.pagination"
      :sorter="meta.sorter"
      data-testid="testTableContent"
      enable-pagination
      :enable-selection="enableSelection"
      :loading="loading"
      @change="getData"
      @rowClick="(payload) => $emit('rowClick', payload)"
      @selectionChanged="(payload) => $emit('selectionChanged', payload)"
      v-bind="$attrs"
    >
      <template v-for="(_, slot) of $slots" #[slot]="scope"
        ><slot :name="slot" v-bind="scope"
      /></template>
    </Table>
  </div>
</template>

<script lang="ts">
import { throttle } from 'lodash';
import type { PropType } from 'vue';
import { defineComponent, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { getQueryString } from '../utils/urls';
import Table from './Table.vue';

interface TablePagination {
  pageSize: number;
  page: number;
  current: number;
  total?: number;
}

interface TableSorter {
  key?: string | null;
  direction?: string | null;
}

interface TableMeta {
  pagination?: TablePagination;
  sorter?: TableSorter;
}

interface TableApiParameters {
  search?: string;
  sort?: string;
  offset?: number;
  limit?: number;
}

export default defineComponent({
  name: 'AjaxTable',
  components: { Table },
  props: {
    url: {
      type: String,
      default: '',
      required: true,
    },
    enableSearch: {
      type: Boolean,
    },
    enableSelection: {
      type: Boolean,
    },
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    query: {
      type: Object as PropType<TableApiParameters>,
      default() {
        return {};
      },
    },
    bodyStyle: {
      type: Object,
      default() {
        return { height: '300px' };
      },
    },
  },
  setup(props) {
    const defaultColumns = ref<any[]>([]);
    const data = ref<any[]>([]);
    const search = ref<string>('');
    const visible = ref(false);
    const loading = ref(false);
    const meta = ref<TableMeta>({
      pagination: {
        pageSize: 10,
        page: 1,
        current: 1,
      },
      sorter: {
        key: null,
        direction: null,
      },
    });

    const getData = async (tableMeta: TableMeta = {}) => {
      loading.value = true;
      const pagination = tableMeta.pagination || meta.value.pagination;
      const sorter = tableMeta.sorter || meta.value.sorter;
      const params = {
        offset: pagination ? pagination.pageSize * (pagination.page - 1) : 0,
        limit: pagination ? pagination.pageSize : 10,
        ...props.query,
      };
      params.search = props.query.search || search.value;
      if (sorter && sorter.key) {
        params.sort = `${sorter.direction === 'desc' ? '-' : ''}${sorter.key}`;
      }

      const response = await axios.get(`${props.url}`, {
        params,
      });
      data.value = response.data.results || response.data;
      meta.value.pagination = {
        ...pagination,
        total: response.data.count,
      } as any;
      meta.value.sorter = {
        ...sorter,
      };
      loading.value = false;
    };

    onMounted(async () => {
      await getData();
    });

    watch(
      () => props.query,
      () => {
        throttle(getData, 1000)();
      },
    );

    return {
      defaultColumns,
      data,
      meta,
      search,
      visible,
      throttle,
      getData,
      loading,
    };
  },
});
</script>

<style scoped></style>
