<template>
  <div class="table w-full">
    <div class="header text-gray-600 bg-white" :style="gridStyleHeader">
      <div v-if="enableSelection" class="flex items-center p-2 border-b">
        <base-checkbox class="mb-5" @input="setAllChecked" />
      </div>
      <div
        v-for="column of columns"
        :key="column.key"
        class="p-2 border-b flex items-center cursor-pointer"
        @click="
          () => {
            if (column.sortable) {
              sort(column.sortKey || column.key);
            }
          }
        "
      >
        {{ column.title }}
        <div v-if="column.sortable">
          <ccu-icon
            v-if="
              sorter.key === (column.sortKey || column.key) &&
                sorter.direction === 'asc'
            "
            :alt="$t('actions.sort_ascending')"
            size="small"
            type="up"
          />
          <ccu-icon
            v-else-if="
              sorter.key === (column.sortKey || column.key) &&
                sorter.direction === 'desc'
            "
            :alt="$t('actions.sort_descending')"
            size="small"
            type="down"
          />
          <ccu-icon
            v-else
            :alt="$t('actions.sortable')"
            size="small"
            type="updown"
          />
        </div>
      </div>
    </div>
    <div class="body bg-white relative" :style="gridStyleBody">
      <div
        v-if="loading"
        class="absolute bottom-0 left-0 right-0 top-0 bg-gray-100 opacity-75 flex items-center justify-center"
      >
        <spinner />
      </div>
      <div
        v-for="item of data"
        :key="item.id"
        :style="gridStyleRow"
        class="hover:bg-gray-100"
        :class="{ 'bg-gray-100': selectedItems.has(item.id) }"
        @click="rowClick(item, $event)"
      >
        <div v-if="enableSelection" class="flex items-center p-2 border-b">
          <base-checkbox
            :value="selectedItems.has(item.id)"
            class="mb-5"
            @input="
              value => {
                setChecked(item, value);
              }
            "
          />
        </div>
        <div
          v-for="column of columns"
          :key="column.key"
          class="flex items-center p-2 border-b cursor-pointer"
        >
          <slot :name="column.key" :item="item">
            <template v-if="item[column.key]">{{
              column.subKey ? item[column.key][column.subKey] : item[column.key]
            }}</template>
          </slot>
        </div>
      </div>
    </div>
    <div
      v-if="enablePagniation"
      class="footer flex items-center justify-between p-4"
    >
      <div class="flex items-center">
        <span class="mr-2">{{ $t('table.per_page') }}</span>
        <form-select
          :value="pagination.pageSize"
          :options="pageSizes"
          :clearable="false"
          select-classes="w-24 bg-white border"
          @input="onSelectPageSize"
        />
      </div>
      <div>
        <div class="flex items-center">
          <base-button
            :disabled="isPreviousButtonDisabled"
            :action="
              () => {
                pageChangeHandle('previous');
              }
            "
            text="PREV"
            icon="caret-left"
            class="mr-3 text-base"
          />
          <div>
            <template v-for="trigger in paginationTriggers">
              <span
                :key="trigger"
                :class="{
                  'rounded-full border px-3 py-1 bg-white shadow-inner':
                    trigger === pagination.current,
                }"
                class="cursor-pointer mx-4 text-base"
                @click="
                  () => {
                    pageChangeHandle(trigger);
                  }
                "
                >{{ trigger }}</span
              >
            </template>
          </div>
          <base-button
            :disabled="isNextButtonDisabled"
            :action="
              () => {
                pageChangeHandle('next');
              }
            "
            text="NEXT"
            suffix-icon="caret-right"
            class="text-base"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Table',
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    data: {
      type: null,
      default: null,
    },
    pagination: {
      type: Object,
      default: () => {
        return {};
      },
    },
    sorter: {
      type: Object,
      default: () => {
        return {};
      },
    },
    loading: Boolean,
    enableSelection: Boolean,
    enablePagniation: Boolean,
    bodyStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  data() {
    return {
      pageSizes: [5, 10, 20, 100, 500, 1000],
      visiblePagesCount: 5,
      selectedItems: new Set([]),
    };
  },
  computed: {
    pageCount() {
      return Math.ceil((this.pagination.total || 1) / this.pagination.pageSize);
    },
    isPreviousButtonDisabled() {
      return this.pagination.current === 1;
    },
    isNextButtonDisabled() {
      return this.pagination.current === this.pageCount;
    },
    paginationTriggers() {
      const currentPage = this.pagination.current;
      const { pageCount } = this;
      const { visiblePagesCount } = this;
      const visiblePagesThreshold = (visiblePagesCount - 1) / 2;
      const pagintationTriggersArray = Array(this.visiblePagesCount - 1).fill(
        0,
      );

      if (pageCount < visiblePagesCount) {
        return Array(pageCount)
          .fill(0)
          .map((_, index) => index + 1);
      }

      if (currentPage <= visiblePagesThreshold + 1) {
        pagintationTriggersArray[0] = 1;
        const pagintationTriggers = pagintationTriggersArray.map(
          (paginationTrigger, index) => {
            return pagintationTriggersArray[0] + index;
          },
        );
        pagintationTriggers.push(pageCount);
        return pagintationTriggers;
      }

      if (currentPage >= pageCount - visiblePagesThreshold + 1) {
        const pagintationTriggers = pagintationTriggersArray.map(
          (paginationTrigger, index) => {
            return pageCount - index;
          },
        );
        pagintationTriggers.reverse().unshift(1);
        return pagintationTriggers;
      }

      pagintationTriggersArray[0] = currentPage - visiblePagesThreshold + 1;
      const pagintationTriggers = pagintationTriggersArray.map(
        (paginationTrigger, index) => {
          return pagintationTriggersArray[0] + index;
        },
      );
      pagintationTriggers.unshift(1);
      pagintationTriggers[pagintationTriggers.length - 1] = pageCount;
      return pagintationTriggers;
    },
    gridTemplate() {
      const columnWidths = this.columns.map(column => column.width || '1fr');
      if (this.enableSelection) {
        columnWidths.unshift('35px');
      }
      return columnWidths.join(' ');
    },
    gridStyleHeader() {
      return {
        display: 'grid',
        'grid-template-columns': this.gridTemplate,
      };
    },
    gridStyleBody() {
      return {
        'max-height': '600px',
        overflow: 'auto',
        ...this.bodyStyle,
      };
    },
    gridStyleRow() {
      return {
        display: 'grid',
        'grid-template-columns': this.gridTemplate,
      };
    },
  },
  mounted() {},
  methods: {
    setChecked(item, value) {
      if (value) {
        this.selectedItems.add(item.id);
      } else {
        this.selectedItems.delete(item.id);
      }
      this.selectedItems = new Set(this.selectedItems);
      this.$emit('selectionChanged', this.selectedItems);
    },
    setAllChecked(value) {
      if (value) {
        this.selectedItems = new Set(this.data.map(item => item.id));
        this.$emit('allSelected', this.selectedItems);
      } else {
        this.selectedItems = new Set();
        this.$emit('allDeselected', this.selectedItems);
      }
      this.$emit('selectionChanged', this.selectedItems);
    },
    pageChangeHandle(value) {
      let newPage;
      switch (value) {
        case 'next':
          newPage = this.pagination.current + 1;
          break;
        case 'previous':
          newPage = this.pagination.current - 1;
          break;
        default:
          newPage = value;
      }

      const pagination = {
        ...this.pagination,
        current: newPage,
        page: newPage,
      };
      const filter = {};
      const sorter = {
        ...this.sorter,
      };
      this.$emit('change', { pagination, filter, sorter });
    },
    onSelectPageSize(pageSize) {
      const pagination = {
        ...this.pagination,
        current: 1,
        pageSize,
      };
      const filter = {};
      const sorter = {
        ...this.sorter,
      };
      this.$emit('change', { pagination, filter, sorter });
    },
    sort(key) {
      const sorter = { ...this.sorter };
      sorter.key = key;
      if (sorter.direction === 'asc') {
        sorter.direction = 'desc';
      } else {
        sorter.direction = 'asc';
      }

      const pagination = {
        ...this.pagination,
      };
      const filter = {};
      this.$emit('change', { pagination, filter, sorter });
    },
    rowClick(item, event) {
      if (
        event &&
        (event.target.className === 'checkmark' ||
          event.target.className === 'checkmark-input')
      ) {
        return;
      }
      this.$emit('rowClick', item);
    },
  },
};
</script>

<style scoped></style>
