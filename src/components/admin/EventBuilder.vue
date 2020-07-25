<template>
  <TitledCard title="~~Event Builder">
    <div class="card-container w-full h-full m-6">
      <div class="card--item">
        <base-text variant="h3" class="pb-2">{{
          $t('Search Events')
        }}</base-text>
        <EventSearch :selected-event.sync="currentEvent" />
      </div>
      <div>
        <base-text variant="h3" class="pb-2">Event Details</base-text>
        <Table :columns="eventColumns" :data="tableData" />
      </div>
    </div>
  </TitledCard>
</template>

<script>
// @flow
import TitledCard from '@/components/cards/TitledCard.vue';
import type { EventType } from '@/models/Event';
import { IconsMixin } from '@/mixins';
import EventSearch from '@/components/admin/EventSearch.vue';
import Table from '@/components/Table.vue';
import _ from 'lodash';

const makeCol = (name, width = '1fr') => ({
  dataIndex: _.snakeCase(name),
  key: _.snakeCase(name),
  title: _.startCase(_.replace(name, '_t', '')),
  width,
});

const eventCols = [
  makeCol('id', '0.5fr'),
  makeCol('key'),
  makeCol('name_t'),
  makeCol('description_t'),
  makeCol('actor_model', '0.5fr'),
  makeCol('patient_model', '0.5fr'),
  makeCol('recipient_model', '0.5fr'),
  makeCol('total_uses', '0.5fr'),
  makeCol('last_used_at', '0.5fr'),
];

export default {
  name: 'EventBuilder',
  components: { TitledCard, EventSearch, Table },
  mixins: [IconsMixin],
  data() {
    return ({
      loading: false,
      currentEvent: null,
      eventColumns: eventCols,
    }: {
      loading: boolean,
      currentEvent: null | EventType,
    });
  },
  computed: {
    tableData() {
      return this.currentEvent ? [this.currentEvent.withTrans()] : [];
    },
  },
};
</script>

<style scoped lang="scss">
.card {
  &-container {
    display: grid;
    grid-auto-flow: row;
    grid-template-rows: 1fr auto;
    gap: 2rem;
  }
}
</style>
