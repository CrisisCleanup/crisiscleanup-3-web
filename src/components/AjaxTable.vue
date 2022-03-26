<template>
  <div>
    <div class="flex items-center justify-between">
      <base-input
        :value="search"
        v-if="enableSearch"
        icon="search"
        class="w-72 mx-4"
        :placeholder="$t('info.search_items')"
        @input="
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
      enable-pagination
      @change="getData"
      @rowClick="(payload) => $emit('rowClick', payload)"
    >
      <template v-for="(_, slot) of $scopedSlots" v-slot:[slot]="scope"
        ><slot :name="slot" v-bind="scope"
      /></template>
    </Table>
  </div>
</template>

<script>
import { throttle } from 'lodash';
import Table from '@/components/Table';
import { getQueryString } from '@/utils/urls';

export default {
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
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    query: {
      type: Object,
      default: () => {
        return {};
      },
    },
    bodyStyle: {
      type: Object,
      default: () => {
        return { height: '300px' };
      },
    },
  },
  async mounted() {
    await this.getData();
  },
  methods: {
    async getData(data = {}) {
      const pagination = data.pagination || this.meta.pagination;
      const sorter = data.sorter || this.meta.sorter;
      const params = {
        offset: pagination.pageSize * (pagination.page - 1),
        limit: pagination.pageSize,
        ...this.query,
      };
      params.search = this.search;
      if (sorter && sorter.key) {
        params.sort = `${sorter.direction === 'desc' ? '-' : ''}${sorter.key}`;
      }
      const queryString = getQueryString(params);

      const response = await this.$http.get(`${this.url}?${queryString}`);
      this.data = response.data.results;
      this.meta.pagination = {
        ...pagination,
        total: response.data.count,
      };
      this.meta.sorter = {
        ...sorter,
      };
    },
  },
  watch: {
    query: {
      handler() {
        throttle(this.getData, 1000)();
      },
    },
  },
  data() {
    return {
      defaultColumns: [],
      data: [],
      meta: {
        pagination: {
          pageSize: 10,
          page: 1,
          current: 1,
        },
        sorter: {
          key: null,
          direction: null,
        },
      },
      search: '',
      visible: true,
      throttle,
    };
  },
};
</script>

<style scoped></style>
