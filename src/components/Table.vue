<template>
  <div class="table-grid w-full">
    <div
      v-if="!hideHeader && $mq !== 'sm'"
      class="header text-crisiscleanup-grey-700 bg-white"
      :style="gridStyleHeader"
    >
      <div
        v-if="enableSelection && $mq !== 'sm'"
        class="flex items-center p-2 border-b"
      >
        <base-checkbox class="mb-5" @input="setAllChecked" />
      </div>
      <div
        v-if="hasRowDetails && $mq !== 'sm'"
        class="flex items-center p-2 border-b"
      ></div>
      <div
        v-for="column of columns"
        :key="column.key"
        class="p-2 border-b flex items-center cursor-pointer header-column"
        :class="column.headerClass || []"
        @click="
          () => {
            if (column.sortable) {
              sort(column.sortKey || column.key);
            }
          }
        "
      >
        <slot :name="`${column.key}-title`" :column="column">
          <base-text
            class="text-crisiscleanup-grey-700"
            :class="column.titleClass && column.titleClass"
            variant="h3"
            regular
          >
            {{ $t(column.title) }}
          </base-text>
        </slot>
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
      <template v-if="enableColumnSearch">
        <div
          v-for="column of columns"
          :key="`search-${column.key}`"
          class="
            p-2
            border-b
            flex
            items-center
            cursor-pointer
            bg-crisiscleanup-light-grey
          "
        >
          <template v-if="column.searchable">
            <form-select
              v-if="column.searchSelect"
              class="w-64 bg-white border h-10 border-crisiscleanup-dark-100"
              :options="column ? column.getSelectValues(data) : []"
              item-key="value"
              label="name_t"
              :value="columnSearch[column.key]"
              @input="
                (value) => {
                  columnSearch[column.key] = value;
                  onSearch();
                }
              "
            ></form-select>
            <base-input
              v-else
              :placeholder="column.title"
              :value="columnSearch[column.key]"
              @input="
                (value) => {
                  columnSearch[column.key] = value;
                  onSearch();
                }
              "
              input-style="width: 100%"
            ></base-input>
          </template>
        </div>
      </template>
    </div>
    <div class="body bg-white relative" :style="gridStyleBody">
      <div
        v-if="loading"
        class="
          absolute
          bottom-0
          left-0
          right-0
          top-0
          bg-crisiscleanup-light-grey
          opacity-75
          flex
          items-center
          justify-center
        "
      >
        <spinner />
      </div>
      <div
        v-for="item of data"
        :key="item.id"
        :style="gridStyleRow"
        class="hover:bg-crisiscleanup-light-grey"
        :class="{ 'bg-crisiscleanup-light-grey': selectedItems.has(item.id) }"
        @click="rowClick(item, $event)"
      >
        <div
          v-if="enableSelection && $mq !== 'sm'"
          class="flex items-center p-2 lg:border-b md:border-b"
        >
          <base-checkbox
            :value="selectedItems.has(item.id)"
            class="mb-5"
            data-cy="tableview_actionSelect"
            @input="
              (value) => {
                setChecked(item, value);
              }
            "
          />
        </div>
        <div
          v-if="hasRowDetails && $mq !== 'sm'"
          class="flex items-center p-2 lg:border-b md:border-b"
        >
          <font-awesome-icon
            class="cursor-pointer"
            size="md"
            :icon="showingDetails.has(item.id) ? 'caret-up' : 'caret-down'"
            @click="setShowingDetails(item)"
          />
        </div>
        <div
          v-for="column of columns"
          :key="column.key"
          class="flex items-center p-2 lg:border-b md:border-b cursor-pointer"
          :class="column.class || []"
          @click="handleColumnAction(column, item[column.key], item)"
        >
          <slot :name="column.key" :item="item">
            <span v-if="$mq === 'sm'" class="font-semibold mr-2">
              {{ column.title }}:
            </span>
            <template
              v-if="
                item[column.key] || item[column.key] === 0 || column.transformer
              "
            >
              <span v-if="column.transformer">{{
                column.transformer(item[column.key], item)
              }}</span>
              <span v-else>{{
                column.subKey
                  ? item[column.key][column.subKey]
                  : item[column.key]
              }}</span>
            </template>
          </slot>
        </div>
        <div
          v-if="hasRowDetails"
          v-show="showingDetails.has(item.id)"
          :style="`grid-column-start: 1; grid-column-end: ${
            columns.length + 1
          };`"
        >
          <slot name="rowDetails" :item="item"></slot>
        </div>
      </div>
      <div v-if="!data.length" class="p-2 text-crisiscleanup-grey-700 italic">
        {{ $t('info.no_items_found') }}
      </div>
    </div>
    <div
      v-if="enablePagination"
      class="footer flex items-center justify-between p-4"
    >
      <div class="flex items-center">
        <span class="mr-2">{{ $t('tableVue.per_page') }}</span>
        <form-select
          :value="pagination.pageSize"
          :options="pageSizes"
          :clearable="false"
          select-classes="w-24 bg-white border vue-select-up"
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
            :text="$t('tableVue.prev')"
            :alt="$t('tableVue.prev')"
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
            :text="$t('tableVue.next')"
            :alt="$t('tableVue.next')"
            suffix-icon="caret-right"
            class="text-base"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { EventsMixin } from '@/mixins';
import { exportCSVFile } from '../utils/downloads';

export default {
  name: 'Table',
  mixins: [EventsMixin],
  props: {
    columns: {
      type: Array,
      default: () => {
        return [];
      },
    },
    hideHeader: {
      type: Boolean,
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
    columnSearch: {
      type: Object,
      default: () => {
        return {};
      },
    },
    loading: Boolean,
    enableSelection: Boolean,
    enablePagination: Boolean,
    enableColumnSearch: Boolean,
    hasRowDetails: Boolean,
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
      showingDetails: new Set([]),
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
      const columnWidths = this.columns.map((column) => column.width || '1fr');
      if (this.hasRowDetails) {
        columnWidths.unshift('35px');
      }
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
        'grid-template-columns': this.$mq === 'sm' ? 'auto' : this.gridTemplate,
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
    setShowingDetails(item) {
      if (this.showingDetails.has(item.id)) {
        this.showingDetails.delete(item.id);
      } else {
        this.showingDetails.add(item.id);
      }
      this.showingDetails = new Set(this.showingDetails);
    },
    setAllChecked(value) {
      if (value) {
        this.selectedItems = new Set(this.data.map((item) => item.id));
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
      const columnSearch = { ...this.columnSearch };

      const pagination = {
        ...this.pagination,
        current: newPage,
        page: newPage,
      };
      const filter = {};
      const sorter = {
        ...this.sorter,
      };
      this.$emit('change', { pagination, filter, sorter, columnSearch });
    },
    onSelectPageSize(pageSize) {
      const columnSearch = { ...this.columnSearch };
      const pagination = {
        ...this.pagination,
        current: 1,
        pageSize,
      };
      const filter = {};
      const sorter = {
        ...this.sorter,
      };
      this.$emit('change', { pagination, filter, sorter, columnSearch });
    },
    sort(key) {
      const columnSearch = { ...this.columnSearch };
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
      this.logEvent(
        sorter.direction === 'asc' ? 'user_ui-sort-asc' : 'user_ui-sort-desc',
      );
      this.$emit('change', { pagination, filter, sorter, columnSearch });
    },
    onSearch() {
      const columnSearch = { ...this.columnSearch };
      const sorter = { ...this.sorter };
      const pagination = {
        ...this.pagination,
      };
      const filter = {};
      this.$emit('change', { pagination, filter, sorter, columnSearch });
    },
    rowClick(item, event) {
      const hasClass = (className) =>
        event.target.className.includes &&
        event.target.className.includes(className);
      if (
        event &&
        [
          'case-flag',
          'checkmark',
          'checkmark-input',
          'base-button',
          'link',
        ].some(hasClass)
      ) {
        return;
      }
      this.$emit('rowClick', item);
    },
    exportTableCSV() {
      const headers = {};
      const headersColumns = this.columns.filter((column) =>
        Boolean(column.title),
      );
      headersColumns.forEach((column) => {
        headers[column.key] = column.title;
      });

      const data = this.data.map((obj) => {
        const response = {};
        headersColumns.forEach((column) => {
          response[column.key] = obj[column.key];
        });
        return response;
      });
      exportCSVFile(headers, data, 'export');
    },
    async handleColumnAction(column, data, item) {
      if (column.action) {
        await column.action(data, item);
      }
    },
  },
};
</script>

<style scoped></style>
