<template>
  <div class="esearch">
    <div class="esearch__input">
      <base-input
        icon="search"
        size="large"
        placeholder="Events Query"
        @input="(value) => makeQuery(value)"
      />
    </div>
    <div class="esearch__table">
      <base-text variant="h3">
        {{ $t('eventBuilder.event_details') }}
      </base-text>
      <Table
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
        ['name_t'],
        ['description'],
        ['actor_model', '0.5fr'],
        ['patient_model', '0.5fr'],
        ['recipient_model', '0.5fr'],
        ['total_uses', '0.2fr'],
      ]),
    );
    const tableData = computed(() =>
      items.value.map((e) => e.withTrans<Event>()),
    );
    const onKeyClick = (key) => {
      context.root.$copyText(key);
      context.root.$toasted.success('~~Copied to Clipboard!');
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
