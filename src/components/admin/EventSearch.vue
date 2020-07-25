<template>
  <autocomplete
    :icon="icons.search"
    :suggestions="eventSuggestions"
    size="large"
    display-property="key"
    placeholder="Events"
    :loading="loading"
    :clear-on-selected="false"
    @search="debouncedCompletions"
    @selected="fetchSelected"
  />
</template>

<script>
// @flow
import Autocomplete from '@/components/Autocomplete.vue';
import Event from '@/models/Event';
import type { SuggestedEventItem, EventType } from '@/models/Event';
import { IconsMixin } from '@/mixins';
import _ from 'lodash';

export default {
  name: 'EventSearch',
  components: { Autocomplete },
  mixins: [IconsMixin],
  data() {
    return ({
      debouncedCompletions: null,
      eventSuggestions: [],
      loading: false,
      selectedEvent: null,
    }: {
      debouncedCompletions: Function | null,
      eventSuggestions: SuggestedEventItem[],
      loading: boolean,
      selectedEvent: null | EventType,
    });
  },
  created() {
    this.debouncedCompletions = _.debounce(this.fetchCompletions, 250);
  },
  methods: {
    async fetchCompletions(key: string): void {
      this.loading = true;
      this.eventSuggestions = await Event.getCompletions(key);
      this.loading = false;
    },
    async fetchSelected({ id }: { id: number }): void {
      const exists = await Event.query().whereId(id).exists();
      if (!exists) {
        await Event.fetchById(id);
      }
      this.selectedEvent = Event.find(id);
      this.$emit('update:selected-event', this.selectedEvent);
    },
  },
};
</script>
