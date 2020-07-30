<template>
  <div>
    <autocomplete
      v-bind="$attrs"
      :icon="icons.search"
      :suggestions="eventSuggestions"
      size="large"
      display-property="key"
      :loading="loading"
      :clear-on-selected="false"
      @search="debouncedCompletions"
      @selected="fetchSelected"
    />
    <template v-if="selected">
      <base-text variant="bodysm" class="text-gray-800 pl-1">{{
        selected.description
      }}</base-text>
    </template>
  </div>
</template>

<script>
// @flow
import Autocomplete from '@/components/Autocomplete.vue';
import EventComponent, { EventComponentTypes } from '@/models/EventComponent';
import type {
  EventComponentType,
  EventComponentTypeT,
  SuggestedComponentItem,
} from '@/models/EventComponent';
import { IconsMixin } from '@/mixins';
import VueTypes from 'vue-types';
import _ from 'lodash';

export default {
  name: 'EventComponentSearch',
  components: { Autocomplete },
  mixins: [IconsMixin],
  props: {
    type: VueTypes.oneOf<EventComponentTypeT>(
      Object.values(EventComponentTypes),
    ),
  },
  data() {
    return ({
      debouncedCompletions: null,
      eventSuggestions: [],
      loading: false,
      selectedComponent: null,
    }: {
      debouncedCompletions: Function | null,
      eventSuggestions: SuggestedComponentItem[],
      loading: boolean,
      selectedComponent: null | EventComponentType,
    });
  },
  created() {
    this.debouncedCompletions = _.debounce(this.fetchCompletions, 250);
  },
  computed: {
    selected() {
      return this.selectedComponent ? this.selectedComponent.withTrans() : null;
    },
  },
  methods: {
    async fetchCompletions(key: string): void {
      this.loading = true;
      this.eventSuggestions = await EventComponent.getKeyCompletions({
        partial: key,
        type: this.type,
      });
      this.loading = false;
    },
    async fetchSelected({ id }: { id: number }): void {
      this.selectedComponent = await EventComponent.fetchOrFindId(id);
      this.$emit('update:selected-component', this.selectedComponent);
    },
  },
};
</script>
