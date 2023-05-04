<template>
  <UserDetailsTooltip class="my-2" :user="user"></UserDetailsTooltip>
  <ol class="relative border-l border-gray-200 dark:border-gray-700 mx-2">
    <li v-for="event in events" :key="event.id" class="mb-10 ml-4">
      <div
        class="absolute w-3 h-3 bg-gray-200 rounded-full -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"
      ></div>
      <time
        class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
        >{{ formatDateString(event.created_at, 'MM/DD/YYYY, h:mm:ss A') }}</time
      >
      <h3 class="text-base font-semibold text-gray-900 dark:text-white">
        {{ getTranslation(event.past_tense_t, event.attr) }}
      </h3>
      <p
        v-if="event.actor_location_name"
        class="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400"
      >
        {{ event.actor_location_name }}
      </p>
    </li>
  </ol>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';
import UserDetailsTooltip from './user/DetailsTooltip.vue';
import { formatDateString } from '@/filters';

export default defineComponent({
  name: 'EventTimeline',
  components: { UserDetailsTooltip },
  props: {
    events: {
      type: Array,
      default: () => [],
    },
    user: {
      type: Number,
    },
  },
  setup() {
    const { t } = useI18n();
    function getTranslation(tag: string, attr: Record<string, string>) {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]) => [
          key,
          key.endsWith('_t') ? t(value || '') : value,
        ]),
      );

      return t(tag, translated_attrs);
    }

    return {
      getTranslation,
      formatDateString,
    };
  },
});
</script>

<style scoped></style>
