<template>
  <div class="text-xs">
    <div class="flex items-center justify-between">
      <span class="text-sm">{{ getEventTitle(currentEvent.event_key) }}</span>
      <span style="font-size: 10px">{{
        currentEvent.created_at | moment('from', 'now')
      }}</span>
    </div>
    <div>
      <span
        >{{ currentEvent.attr.actor_first_name }}
        {{ currentEvent.attr.actor_last_name }}</span
      >
      from
      <span>{{ currentEvent.attr.actor_organization_name }}</span>
      {{ getTranslation(currentEvent.past_tense_t, currentEvent.attr) }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'EventCard',
  props: {
    currentEvent: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  methods: {
    getEventTitle(event_key) {
      if (event_key) {
        return this.$t(`events.${event_key.replace(':', '_')}`);
      }
      return event_key;
    },
    getTranslation(tag, attr) {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]) => [
          key,
          key.endsWith('_t') ? this.$t(value) : value,
        ]),
      );
      return this.$t(tag, translated_attrs);
    },
  },
  computed: {
    name() {
      return this.data;
    },
  },
};
</script>
