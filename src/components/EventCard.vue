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

<script lang="ts">
import usei18n from '@/use/usei18n';

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
  setup() {
    const { $t } = usei18n();

    function getEventTitle(event_key) {
      if (event_key) {
        return $t(`events.${event_key.replace(':', '_')}`);
      }
      return event_key;
    }
    function getTranslation(tag, attr) {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]) => [
          key,
          key.endsWith('_t') ? $t(value as string) : value,
        ]),
      );
      return $t(tag, translated_attrs);
    }

    return {
      getEventTitle,
      getTranslation,
    };
  },
};
</script>
