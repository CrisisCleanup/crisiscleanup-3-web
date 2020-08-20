<template>
  <div class="esearch">
    <div class="esearch__input">
      <base-input
        icon="search"
        size="large"
        :placeholder="$t('eventBuilder.search_events')"
        @input="(value) => makeQuery(value)"
      />
    </div>
    <div class="esearch__table">
      <base-text variant="h3">
        {{ $t('eventBuilder.event_details') }}
      </base-text>
      <Table
        class="border border-1 select-none cursor-pointer"
        :loading="loading"
        :columns="tableCols"
        :data="tableData"
        @rowClick="(row) => onKeyClick(row.key)"
      />
    </div>
  </div>
</template>

<script>
// @flow

import useSearchEvents from '@/use/events/useSearchEvents';
import { makeTableColumns } from '@/utils/table';
import { computed } from '@vue/composition-api';
import Table from '@/components/Table.vue';

export default {
  name: 'EventSearchTable',
  components: { Table },
  setup(props, context) {
    const { loading, items, makeQuery } = useSearchEvents({ context });
    const tableCols = computed(() =>
      makeTableColumns([
        ['id', '0.2fr'],
        ['key', '0.7fr'],
        ['name_t', '0.7fr'],
        ['description'],
        ['actor_model', '0.5fr'],
        ['patient_model', '0.5fr'],
        ['recipient_model', '0.5fr'],
        ['points', '0.2fr'],
        ['total_uses', '0.3fr'],
      ]),
    );
    const tableData = computed(() =>
      items.value.map((e) => e.withTrans<Event>()),
    );
    const onKeyClick = (key) => {
      context.root.$copyText(key);
      context.root.$toasted.success(context.root.$t('info.copied_to_clipboard'));
    };
    return {
      loading,
      items,
      makeQuery,
      tableCols,
      tableData,
      onKeyClick,
    };
  },
};
</script>

<style scoped lang="postcss">
.esearch {
  > div {
    lost-row: 1/2;
  }
}
</style>
