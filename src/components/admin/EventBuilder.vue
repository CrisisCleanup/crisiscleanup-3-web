<template>
  <TitledCard title="~~Event Builder">
    <div class="card-container w-full h-full m-6">
      <div class="card--item">
        <base-text variant="h3" class="pb-2">{{
          $t('Search Events')
        }}</base-text>
        <EventSearch :selected-event.sync="currentEvent" />
        <div class="my-4">
          <base-text variant="h4" class="pb-2">Event Details</base-text>
          <Table :columns="eventColumns" :data="tableData" />
        </div>
      </div>
      <div>
        <base-text variant="h1" class="pb-3">Create Event</base-text>
        <base-text variant="body" class="pb-3">Generate Key</base-text>
        <div class="card--builder pb-6">
          <div v-for="key in Object.keys(eventInputs)">
            <base-text variant="h4" class="pb-1">{{
              key | capitalize
            }}</base-text>
            <EventComponentSearch
              :selected-component.sync="eventInputs[key].value"
              :placeholder="key | capitalize"
              :type="eventInputs[key].type"
            />
          </div>
        </div>
        <base-text variant="body" class="pb-3">Set Localizations</base-text>
        <div class="card--builder">
          <div v-for="key in Object.keys(eventLocaleInputs)">
            <base-text variant="h4" class="pb-1">{{
              key | capitalize
            }}</base-text>
            <base-input
              class="pb-3"
              placeholder="Translation Key"
              size="medium"
              @change="(value) => (eventLocaleInputs[key].key = value)"
            />
            <base-input
              placeholder="Value"
              size="medium"
              @change="(value) => (eventLocaleInputs[key].value = value)"
            />
          </div>
        </div>
        <div class="my-4">
          <base-text variant="h2" class="pb-2">Event Output</base-text>
          <Table :columns="dirtyEventColumns" :data="dirtyEventData" />
        </div>
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
import EventComponentSearch from '@/components/admin/EventComponentSearch.vue';
import { EventComponentTypes } from '@/models/EventComponent';
import type { EventComponentTypeT } from '@/models/EventComponent';
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

const dirtyEventCols = [
  makeCol('key'),
  makeCol('name_t'),
  makeCol('description_t'),
  makeCol('actor_model', '0.5fr'),
  makeCol('patient_model', '0.5fr'),
  makeCol('recipient_model', '0.5fr'),
];

export type EventInput = {|
  type: EventComponentTypeT,
  value: string | null,
|};

export type EventInputsMap = {
  [key: string]: EventInput,
};

type EventLocaleInput = {|
  key: string | null,
  value: string | null,
|};

type EventLocaleInputsMap = {
  [key: string]: EventLocaleInput,
};

export default {
  name: 'EventBuilder',
  components: { TitledCard, EventSearch, Table, EventComponentSearch },
  mixins: [IconsMixin],
  data() {
    return ({
      loading: false,
      currentEvent: null,
      eventColumns: eventCols,
      dirtyEventColumns: dirtyEventCols,
      eventInputs: {
        actor: {
          type: EventComponentTypes.OBJECT,
          value: null,
        },
        action: {
          type: EventComponentTypes.ACTION,
          value: null,
        },
        subaction: {
          type: EventComponentTypes.SUB_ACTION,
          value: null,
        },
        recipient: {
          type: EventComponentTypes.OBJECT,
          value: null,
        },
        patient: {
          type: EventComponentTypes.OBJECT,
          value: null,
        },
      },
      eventLocaleInputs: {
        name: {
          key: null,
          value: null,
        },
        description: {
          key: null,
          value: null,
        },
      },
    }: {
      loading: boolean,
      currentEvent: null | EventType,
      eventInputs: EventInputsMap,
      eventLocaleInputs: EventLocaleInputsMap,
    });
  },
  computed: {
    tableData() {
      return this.currentEvent ? [this.currentEvent.withTrans()] : [];
    },
    dirtyKeys() {
      return _.transform(
        this.eventInputs,
        (result, value, key) => {
          result[key] = _.get(this.eventInputs[key].value, 'key', '');
        },
        {},
      );
    },
    dirtyEventKey() {
      const { actor, action, subaction, recipient, patient } = this.dirtyKeys;
      let baseKey = _.snakeCase(`${actor} ${action} ${recipient} ${patient}`);
      if (!_.isEmpty(subaction)) {
        baseKey = `${baseKey}:${subaction}`;
      }
      return baseKey;
    },
    dirtyEventData() {
      return this.dirtyEventKey
        ? [
            {
              key: this.dirtyEventKey,
              actor_model: _.get(this.eventInputs.actor.value, 'model', ''),
              patient_model: _.get(this.eventInputs.patient.value, 'model', ''),
              recipient_model: _.get(
                this.eventInputs.patient.value,
                'model',
                '',
              ),
              name_t: _.get(this.eventLocaleInputs.name, 'key', ''),
              description_t: _.get(
                this.eventLocaleInputs.description,
                'key',
                '',
              ),
            },
          ]
        : [];
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
  &--builder {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
  }
}
</style>
