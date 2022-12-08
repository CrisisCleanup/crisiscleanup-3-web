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
        <base-checkbox class="mb-5" @update:modelValue="setAllChecked" />
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
          class="p-2 border-b flex items-center cursor-pointer bg-crisiscleanup-light-grey"
        >
          <template v-if="column.searchable">
            <base-select
              v-if="column.searchSelect"
              class="w-64 bg-white border h-10 border-crisiscleanup-dark-100"
              :options="column ? column.getSelectValues(data) : []"
              item-key="value"
              label="name_t"
              :model-value="columnSearch[column.key]"
              @update:modelValue="
                (value) => {
                  columnSearch[column.key] = value;
                  onSearch();
                }
              "
            ></base-select>
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
        class="absolute bottom-0 left-0 right-0 top-0 bg-crisiscleanup-light-grey opacity-75 flex items-center justify-center"
      >
        <spinner />
      </div>
      <div
        v-for="item of data"
        :key="item.id"
        :style="gridStyleRow"
        class="hover:bg-crisiscleanup-light-grey border-b"
        :class="{ 'bg-crisiscleanup-light-grey': selectedItems.has(item.id) }"
        @click="rowClick(item, $event)"
      >
        <div
          v-if="enableSelection && $mq !== 'sm'"
          class="flex items-center p-2 border-b"
        >
          <base-checkbox
            :model-value="selectedItems.has(item.id)"
            class="mb-5"
            data-cy="tableview_actionSelect"
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
            :icon="showingDetails.has(item.id) ? 'caret-up' : 'caret-down'"
            @click="setShowingDetails(item)"
          />
        </div>
        <div
          v-for="column of columns"
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
      <div v-if="!data.length" class="p-2 text-crisiscleanup-grey-700 italic">
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
            icon="caret-left"
            class="mr-3 text-base"
          />
          <div>
            <template :key="trigger" v-for="trigger in paginationTriggers">
              <span
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
// import { EventsMixin } from '@/mixins';
import { exportCSVFile } from '../utils/downloads';
import { computed, ref } from 'vue';
import { useMq } from 'vue3-mq';

export default {
  name: 'Table',
  // mixins: [EventsMixin], TODO: Events Mixin
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
      type: Array,
      default: () => [],
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
    rowStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
    headerStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
    bodyStyle: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  setup(props, { emit }) {
    const mq = useMq();

    const pagesSizes = [5, 10, 20, 100, 500, 1000];
    const visiblePagesCount = 5;
    const selectedItems = ref(new Set([]));
    const showingDetails = ref(new Set([]));

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
      const pagintationTriggersArray = Array(visiblePagesCount - 1).fill(0);

      if (pageCount.value < visiblePagesCount) {
        return Array(pageCount.value)
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
        case 'next':
          newPage = props.pagination.current + 1;
          break;
        case 'previous':
          newPage = props.pagination.current - 1;
          break;
        default:
          newPage = value;
      }
      const columnSearch = { ...props.columnSearch };

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
      const columnSearch = { ...props.columnSearch };
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
      const columnSearch = { ...props.columnSearch };
      const sorter = { ...props.sorter };
      sorter.key = key;
      if (sorter.direction === 'asc') {
        sorter.direction = 'desc';
      } else {
        sorter.direction = 'asc';
      }

      const pagination = {
        ...props.pagination,
      };
      const filter = {};
      // this.logEvent(
      //     sorter.direction === 'asc' ? 'user_ui-sort-asc' : 'user_ui-sort-desc',
      // );
      emit('change', { pagination, filter, sorter, columnSearch });
    }
    function onSearch() {
      const columnSearch = { ...props.columnSearch };
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
      headersColumns.forEach((column) => {
        headers[column.key] = column.title;
      });

      const data = props.data.map((obj) => {
        const response = {};
        headersColumns.forEach((column) => {
          response[column.key] = obj[column.key];
        });
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
      pagesSizes,
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
    };
  },
};
</script>

<style scoped></style>
