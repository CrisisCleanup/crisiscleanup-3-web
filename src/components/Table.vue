<template>
  <div class="table-grid js-table w-full">
    <div
      v-if="!hideHeader && $mq !== 'sm'"
      class="header text-crisiscleanup-grey-700 bg-white"
      :style="gridStyleHeader"
    >
      <div
        v-if="enableSelection && $mq !== 'sm'"
        class="flex items-center p-2 border-b"
      >
        <base-checkbox
          class="mb-5 js-select-all"
          data-testid="testSetAllCheckedCheckbox"
          @update:modelValue="setAllChecked"
        />
      </div>
      <div
        v-if="hasRowDetails && $mq !== 'sm'"
        class="flex items-center p-2 border-b"
      ></div>
      <div
        v-for="column of columns"
        :data-testid="`testColumn${column.key}Div`"
        :key="column.key"
        class="p-2 border-b flex items-center cursor-pointer header-column"
        :class="column.headerClass || []"
        :style="column.headerStyle || []"
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
            :data-testid="`testColumn${column.key}TitleContent`"
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
            :data-testid="`testColumnSortAscending${column.key}Icon`"
            size="small"
            type="up"
          />
          <ccu-icon
            v-else-if="
              sorter.key === (column.sortKey || column.key) &&
              sorter.direction === 'desc'
            "
            :alt="$t('actions.sort_descending')"
            :data-testid="`testColumnSortDescending${column.key}Icon`"
            size="small"
            type="down"
          />
          <ccu-icon
            v-else
            :data-testid="`testColumnSortable${column.key}Icon`"
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
          class="p-2 border-b flex items-center cursor-pointer bg-crisiscleanup-light-grey"
        >
          <template v-if="column.searchable">
            <base-select
              v-if="column.searchSelect"
              :data-testid="`testColumn${column.key}Search`"
              class="w-64 bg-white border h-10 border-crisiscleanup-dark-100"
              :options="column ? column.getSelectValues(data) : []"
              item-key="value"
              label="name_t"
              :model-value="internalColumnSearch[column.key]"
              @update:modelValue="
                (value) => {
                  internalColumnSearch[column.key] = value;
                  onSearch();
                }
              "
            ></base-select>
            <base-input
              v-else
              :data-testid="`testColumn${column.key}TextInput`"
              :placeholder="column.title"
              :model-value="internalColumnSearch[column.key]"
              input-style="width: 100%"
              @update:modelValue="
                (value) => {
                  internalColumnSearch[column.key] = value;
                  onSearch();
                }
              "
            ></base-input>
          </template>
        </div>
      </template>
    </div>
    <div class="body bg-white relative" :style="gridStyleBody">
      <div
        v-if="loading"
        class="absolute bottom-0 left-0 right-0 top-0 bg-crisiscleanup-light-grey opacity-75 flex items-center justify-center"
      >
        <spinner />
      </div>
      <div
        v-for="item of data"
        :data-testid="`testDataItem${item.id}Content`"
        :key="item.id"
        :style="gridStyleRow"
        class="hover:bg-crisiscleanup-light-grey border-b js-table-row"
        :class="{
          'bg-crisiscleanup-light-grey':
            selectedItems && selectedItems.has(item.id),
        }"
        @click="rowClick(item, $event)"
      >
        <div
          v-if="enableSelection && $mq !== 'sm'"
          class="flex items-center p-2 border-b"
        >
          <base-checkbox
            :model-value="selectedItems.has(item.id)"
            :data-testid="`testDataItem${item.id}Checkbox`"
            class="mb-5 js-select-item"
            @update:modelValue="
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
            :alt="showingDetails.has(item.id) ? $t('actions.hide_options') : $t('actions.show_options')"
            :icon="showingDetails.has(item.id) ? 'caret-up' : 'caret-down'"
            @click="setShowingDetails(item)"
          />
        </div>
        <div
          v-for="column of columns"
          :data-testid="`tesColumn${column.key}Column`"
          :key="column.key"
          class="flex items-center p-2 lg:border-b md:border-b cursor-pointer"
          :class="column.class || []"
          :style="column.style || []"
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
      <div
        v-if="data.length === 0"
        data-testid="testNoItemsFoundDiv"
        class="p-2 text-crisiscleanup-grey-700 italic"
      >
        {{ $t('info.no_items_found') }}
      </div>
    </div>
    <div
      v-if="enablePagination"
      class="footer flex flex-col sm:flex-row sm:items-center justify-between p-4"
    >
      <div class="flex items-center mb-4 sm:mb-0">
        <span class="mr-2">{{ $t('tableVue.per_page') }}</span>
        <base-select
          :model-value="pagination.pageSize"
          :options="pageSizes"
          :clearable="false"
          data-testid="testPaginationPagesizeSelect"
          class="w-32"
          select-classes="sm:w-24 bg-white border vue-select-up"
          @update:modelValue="onSelectPageSize"
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
            data-testid="testPaginationPrevButton"
            icon="caret-left"
            class="mr-3 text-base js-prev"
          />
          <div class="js-page-triggers">
            <template v-for="trigger in paginationTriggers" :key="trigger">
              <span
                :class="{
                  'rounded-full border px-3 py-1 bg-white shadow-inner':
                    trigger === pagination.current,
                  [`js-pagination-trigger-${trigger}`]: true,
                }"
                class="cursor-pointer mx-4 text-base js-pagination-trigger"
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
            data-testid="testPaginationNextButton"
            suffix-icon="caret-right"
            class="text-base js-next"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { computed, ref, defineComponent } from 'vue';
import { useMq } from 'vue3-mq';
import { exportCSVFile } from '../utils/downloads';
import useLogEvent from '@/hooks/useLogEvent';

export type TableColumnSearch = Record<string, any>;
export type TableColumnFilters = Record<string, any>;
export interface TablePagination {
  current?: number;
  page?: number;
  pageSize?: number;
  total?: number;
}
export type TableSorterObject<T = Record<string, unknown>> = Record<
  string,
  unknown
> & {
  key?: keyof T;
  direction?: 'asc' | 'desc';
};
export interface TableChangeEmitItem<T = Record<string, unknown>> {
  sorter?: TableSorterObject<T>;
  pagination?: TablePagination;
  filters?: TableColumnFilters;
  columnSearch?: TableColumnSearch;
}

export default defineComponent({
  name: 'Table',
  props: {
    columns: {
      type: Array,
      default() {
        return [];
      },
    },
    hideHeader: {
      type: Boolean,
    },
    data: {
      type: Array,
      default: () => [],
    },
    pagination: {
      type: Object as PropType<TablePagination>,
      default() {
        return {};
      },
    },
    sorter: {
      type: Object as PropType<TableSorterObject>,
      default(): TableSorterObject {
        return {};
      },
    },
    columnSearch: {
      type: Object as PropType<TableColumnSearch>,
      default() {
        return {};
      },
    },
    loading: Boolean,
    enableSelection: Boolean,
    enablePagination: Boolean,
    enableColumnSearch: Boolean,
    hasRowDetails: Boolean,
    rowStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    headerStyle: {
      type: Object,
      default() {
        return {};
      },
    },
    bodyStyle: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  emits: [
    'change',
    'allSelected',
    'allDeselected',
    'selectionChanged',
    'rowClick',
  ],
  setup(props, { emit }) {
    const mq = useMq();

    const pageSizes = [5, 10, 20, 100, 500, 1000];
    const visiblePagesCount = 5;
    const selectedItems = ref(new Set([]));
    const showingDetails = ref(new Set([]));
    const internalColumnSearch = ref({ ...props.columnSearch });

    const pageCount = computed(() => {
      return Math.ceil(
        (props.pagination.total || 1) / props.pagination.pageSize,
      );
    });

    const isPreviousButtonDisabled = computed(() => {
      return props.pagination.current === 1;
    });

    const isNextButtonDisabled = computed(() => {
      return props.pagination.current === pageCount.value;
    });

    const paginationTriggers = computed(() => {
      const currentPage = props.pagination.current;
      const visiblePagesThreshold = (visiblePagesCount - 1) / 2;
      const pagintationTriggersArray = Array.from({
        length: visiblePagesCount - 1,
      }).fill(0);

      if (pageCount.value < visiblePagesCount) {
        return Array.from({ length: pageCount.value })
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
        pagintationTriggers.push(pageCount.value);
        return pagintationTriggers;
      }

      if (currentPage >= pageCount.value - visiblePagesThreshold + 1) {
        const pagintationTriggers = pagintationTriggersArray.map(
          (paginationTrigger, index) => {
            return pageCount.value - index;
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
      pagintationTriggers[pagintationTriggers.length - 1] = pageCount.value;
      return pagintationTriggers;
    });

    const gridTemplate = computed(() => {
      const columnWidths = props.columns.map((column) => column.width || '1fr');
      if (props.hasRowDetails) {
        columnWidths.unshift('35px');
      }

      if (props.enableSelection) {
        columnWidths.unshift('35px');
      }

      return columnWidths.join(' ');
    });

    const gridStyleHeader = computed(() => {
      return {
        display: 'grid',
        'grid-template-columns': gridTemplate.value,
        ...props.headerStyle,
      };
    });

    const gridStyleBody = computed(() => {
      return {
        overflow: 'auto',
        ...props.bodyStyle,
      };
    });

    const gridStyleRow = computed(() => {
      return {
        display: 'grid',
        'grid-template-columns': mq === 'sm' ? 'auto' : gridTemplate.value,
        ...props.rowStyle,
      };
    });

    function setChecked(item, value) {
      if (value) {
        selectedItems.value.add(item.id);
      } else {
        selectedItems.value.delete(item.id);
      }

      selectedItems.value = new Set(selectedItems.value);
      emit('selectionChanged', selectedItems.value);
    }

    function setShowingDetails(item) {
      if (showingDetails.value.has(item.id)) {
        showingDetails.value.delete(item.id);
      } else {
        showingDetails.value.add(item.id);
      }

      showingDetails.value = new Set(showingDetails.value);
    }

    function setAllChecked(value) {
      if (value) {
        selectedItems.value = new Set(props.data.map((item) => item.id));
        emit('allSelected', selectedItems.value);
      } else {
        selectedItems.value = new Set();
        emit('allDeselected', selectedItems.value);
      }

      emit('selectionChanged', selectedItems.value);
    }

    function pageChangeHandle(value) {
      let newPage;
      switch (value) {
        case 'next': {
          newPage = props.pagination.current + 1;
          break;
        }

        case 'previous': {
          newPage = props.pagination.current - 1;
          break;
        }

        default: {
          newPage = value;
        }
      }

      const columnSearch = { ...internalColumnSearch.value };

      const pagination = {
        ...props.pagination,
        current: newPage,
        page: newPage,
      };
      const filter = {};
      const sorter = {
        ...props.sorter,
      };
      emit('change', { pagination, filter, sorter, columnSearch });
    }

    function onSelectPageSize(pageSize) {
      const columnSearch = { ...internalColumnSearch.value };
      const pagination = {
        ...props.pagination,
        current: 1,
        pageSize,
      };
      const filter = {};
      const sorter = {
        ...props.sorter,
      };
      emit('change', { pagination, filter, sorter, columnSearch });
    }

    function sort(key) {
      const columnSearch = { ...internalColumnSearch.value };
      const sorter = { ...props.sorter };
      sorter.key = key;
      sorter.direction = sorter.direction === 'asc' ? 'desc' : 'asc';

      const pagination = {
        ...props.pagination,
      };
      const filter = {};
      const { logEvent } = useLogEvent();

      logEvent(
        sorter.direction === 'asc' ? 'user_ui-sort-asc' : 'user_ui-sort-desc',
      );
      emit('change', { pagination, filter, sorter, columnSearch });
    }

    function onSearch() {
      const columnSearch = { ...internalColumnSearch.value };
      const sorter = { ...props.sorter };
      const pagination = {
        ...props.pagination,
      };
      const filter = {};
      emit('change', { pagination, filter, sorter, columnSearch });
    }

    function rowClick(item, event) {
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

      emit('rowClick', item);
    }

    function exportTableCSV() {
      const headers = {};
      const headersColumns = props.columns.filter((column) =>
        Boolean(column.title),
      );
      for (const column of headersColumns) {
        headers[column.key] = column.title;
      }

      const data = props.data.map((object) => {
        const response = {};
        for (const column of headersColumns) {
          response[column.key] = object[column.key];
        }

        return response;
      });
      exportCSVFile(headers, data, 'export');
    }

    async function handleColumnAction(column, data, item) {
      if (column.action) {
        await column.action(data, item);
      }
    }

    return {
      pageSizes,
      visiblePagesCount,
      selectedItems,
      showingDetails,
      pageCount,
      isPreviousButtonDisabled,
      isNextButtonDisabled,
      paginationTriggers,
      gridTemplate,
      gridStyleHeader,
      gridStyleBody,
      gridStyleRow,
      setChecked,
      setShowingDetails,
      setAllChecked,
      pageChangeHandle,
      onSelectPageSize,
      sort,
      onSearch,
      rowClick,
      exportTableCSV,
      handleColumnAction,
      internalColumnSearch,
    };
  },
});
</script>

<style lang="postcss" scoped></style>
