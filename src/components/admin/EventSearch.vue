<template>
  <base-input
    :icon="icons.search"
    size="large"
    placeholder="Events Query"
    @input="(value) => debouncedQuery(value)"
  />
</template>

<script>
// @flow
import Event from '@/models/Event';
import type { EventType, EventSearchResult } from '@/models/Event';
import { IconsMixin } from '@/mixins';
import _ from 'lodash';

export default {
  name: 'EventSearch',
  mixins: [IconsMixin],
  data() {
    return ({
      debouncedCompletions: null,
      eventResults: [],
      eventItems: [],
      loading: false,
      selectedEvent: null,
    }: {
      debouncedCompletions: Function | null,
      eventResults: EventSearchResult[],
      eventItems: EventType[],
      loading: boolean,
      selectedEvent: null | EventType,
    });
  },
  created() {
    this.debouncedQuery = _.debounce(this.makeQuery, 400);
  },
  methods: {
    async makeQuery(key: string): void {
      this.loading = true;
      this.$emit('update:loading', this.loading);
      this.eventResults = await Event.search(key, 5);
      await this.fetchDetails();
      this.loading = false;
      this.$emit('update:loading', this.loading);
    },
    async fetchDetails(): void {
      this.eventItems = [];
      await _.mapValues(this.eventResults, async ({ id }) => {
        const event = await Event.fetchOrFindId(id);
        this.eventItems.push(event);
      });
      this.$emit('update:event-items', this.eventItems);
    },
  },
};
</script>
