<template>
  <TitledCard title="~~Event Builder">
    <div class="card__container w-full h-full m-6">
      <div class="card__item">
        <base-text variant="h3" class="pb-2">{{
          $t('Search Events')
        }}</base-text>
        <EventSearch
          :event-items.sync="eventResults_"
          :loading.sync="isLoadingSearch"
        />
        <div class="my-4">
          <base-text variant="h4" class="pb-2">Event Details</base-text>
          <Table
            :loading="isLoadingSearch"
            :columns="eventColumns"
            :data="tableData"
          />
        </div>
      </div>
      <div>
        <base-text variant="h1" class="pb-3">Create Event</base-text>
        <base-text variant="body" class="pb-3">Generate Key</base-text>
        <div class="card__builder pb-6">
          <div v-for="key in Object.keys(eventInputs)" :key="key">
            <base-text variant="h4" class="pb-1">{{
              key | capitalize
            }}</base-text>
            <EventComponentSearch
              :selected-component.sync="eventInputs[key].value"
              :placeholder="key | capitalize"
              :type="eventInputs[key].type"
            />
          </div>
          <div>
            <base-text variant="h4" class="pb-1">
              Badge Key
            </base-text>
            <FormSelect
              searchable
              placeholder="Badge Key"
              label="text"
              item-key="id"
              @search="(payload) => debouncedBadgeKey(payload)"
              :options="badgeKeys_"
            />
          </div>
          <div>
            <base-text variant="h4" class="pb-1">
              Required Attributes
            </base-text>
            <FormSelect
              searchable
              multiple
              placeholder="Required Attrs"
              label="name"
              :options="componentAttrs"
            />
          </div>
        </div>
        <base-text variant="body" class="pb-3">Set Localizations</base-text>
        <div class="card__locale py-4">
          <LocaleForm :fields="eventLocaleInputs" />
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
import EventComponent, { EventComponentTypes } from '@/models/EventComponent';
import Event from '@/models/Event';
import type { EventComponentTypeT } from '@/models/EventComponent';
import Table from '@/components/Table.vue';
import _ from 'lodash';
import LocaleForm from '@/components/forms/LocaleForm.vue';
import type { LocaleFormFieldsT } from '@/components/forms/LocaleForm.vue';
import FormSelect from '@/components/FormSelect.vue';

const makeCol = (name, width = '1fr', title) => ({
  dataIndex: _.snakeCase(name),
  key: _.snakeCase(name),
  title: title || _.startCase(_.replace(name, '_t', '')),
  width,
});

const eventCols = [
  makeCol('id', '0.2fr'),
  makeCol('key', '0.7fr'),
  makeCol('name_t'),
  makeCol('description'),
  makeCol('actor_model', '0.5fr'),
  makeCol('patient_model', '0.5fr'),
  makeCol('recipient_model', '0.5fr'),
  makeCol('total_uses', '0.2fr'),
];

const dirtyEventCols = [
  makeCol('key'),
  makeCol('name_t'),
  makeCol('description_t'),
  makeCol('actor_model', '0.5fr'),
  makeCol('patient_model', '0.5fr'),
  makeCol('recipient_model', '0.5fr'),
  makeCol('points', '0.25fr'),
];

export type EventInput = {|
  type: EventComponentTypeT,
  value: string | null,
|};

export type EventInputsMap = {
  [key: string]: EventInput,
};

export default {
  name: 'EventBuilder',
  components: {
    LocaleForm,
    TitledCard,
    EventSearch,
    Table,
    EventComponentSearch,
    FormSelect,
  },
  mixins: [IconsMixin],
  data() {
    return ({
      loading: false,
      eventResults_: [],
      isLoadingSearch: false,
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
      eventLocaleInputs_: [
        'name',
        'description:d',
        'past_tense:pt',
        'present_progressive:ppt',
      ],
      badgeKeys_: [],
    }: {
      isLoadingSearch: boolean,
      loading: boolean,
      eventResults_: EventType[],
      eventInputs: EventInputsMap,
      eventLocaleInputs_: LocaleFormFieldsT,
      badgeKeys_: string[],
    });
  },
  async mounted() {
    await EventComponent.fetchAllByType(EventComponentTypes.ATTR);
  },
  created() {
    this.debouncedBadgeKey = _.debounce(this.handleBadgeKeys, 250);
  },
  methods: {
    async handleBadgeKeys(value: string) {
      if (!value) return;
      const results = await Event.getCompletions(value, 'badge_key');
      this.badgeKeys_ = _.uniqBy(
        results.map((r) => r.value),
        _.isEqual,
      );
    },
  },
  computed: {
    /**
     * Table Data for currently selected event.
     * @returns {any}
     */
    tableData() {
      return this.eventResults_.map((e) => e.withTrans<EventType>());
    },
    /**
     * Maps event input data to 'dirty' partial keys.
     * @returns {Dictionary<string>}
     */
    dirtyKeys() {
      return _.transform(
        this.eventInputs,
        (result, value, key) => {
          result[key] = _.get(this.eventInputs[key].value, 'key', '');
        },
        {},
      );
    },
    /**
     * Formats dirty partial keys into a dirty full event key.
     * @returns {string}
     */
    dirtyEventKey() {
      const { actor, action, subaction, recipient, patient } = this.dirtyKeys;
      let baseKey = _.snakeCase(`${actor} ${action} ${recipient} ${patient}`);
      if (!_.isEmpty(subaction)) {
        baseKey = `${baseKey}:${subaction}`;
      }
      return baseKey;
    },
    dirtyEventPoints() {
      return _.reduce(
        this.eventInputs,
        (result, value) => result + _.get(value.value, 'points', 0),
        0,
      );
    },
    /**
     * Computes dirty event data for preview and eventual submission.
     * @returns {$Shape<EventType>}
     */
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
              points: this.dirtyEventPoints,
            },
          ]
        : [];
    },
    /**
     * Iterates over locale inputs and generates locale keys for each.
     * @returns {Dictionary<LocaleFormFieldsT>}
     */
    eventLocaleInputs() {
      return _.transform(
        this.eventLocaleInputs_,
        (result, value) => {
          const [name, suffix = null] = _.split(value, ':');
          const _key = `event.${_.snakeCase(this.dirtyEventKey)}${
            _.isNil(suffix) ? '' : `_${suffix}`
          }`;
          result[name] = {
            value,
            key: _key,
          };
        },
        {},
      );
    },
    /**
     * Returns all Event Components of Attr type.
     * @returns {Data.Collection<InstanceOf<EventComponent>>}
     */
    componentAttrs() {
      return EventComponent.query()
        .where('type', EventComponentTypes.ATTR)
        .get()
        .map((e) => e.withTrans());
    },
  },
};
</script>

<style scoped lang="scss">
.card {
  &__container {
    display: grid;
    grid-auto-flow: row;
    grid-template-rows: 1fr auto;
    gap: 2rem;
  }
  &__builder {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 1rem;
  }
}
</style>
