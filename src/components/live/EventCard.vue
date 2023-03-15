<template>
  <div class="text-xs">
    <div class="flex items-center justify-between">
      <span class="text-sm">{{ getEventTitle(currentEvent.event_key) }}</span>
      <span style="font-size: 10px">{{
        momentFromNow(currentEvent.created_at)
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
import { momentFromNow } from '@/filters';

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
    const { t } = useI18n();
    const $t = (text:string, attrs: Record<string, any>) => {
      return text ? t(text, attrs) : null;
    };

    function getEventTitle(event_key: string) {
      if (event_key) {
        return $t(`events.${event_key.replace(':', '_')}`, {});
      }
      return event_key;
    }
    function getTranslation(tag: string, attr: Record<string, any>) {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]) => [
          key,
          key.endsWith('_t') ? $t(value, {}) : value,
        ]),
      );
      return $t(tag, translated_attrs);
    }

    return {
      getEventTitle,
      getTranslation,
      momentFromNow,
    };
  },
};
</script>
