<template>
  <ol class="relative border-l border-gray-200 dark:border-gray-700 mx-2">
    <li class="mb-10 ml-4" v-for="event in events" :key="event.id">
      <div
        class="
          absolute
          w-3
          h-3
          bg-gray-200
          rounded-full
          -left-1.5
          border border-white
          dark:border-gray-900 dark:bg-gray-700
        "
      ></div>
      <time
        class="
          mb-1
          text-sm
          font-normal
          leading-none
          text-gray-400
          dark:text-gray-500
        "
        >{{ event.created_at | moment('MM/DD/YYYY, h:mm:ss A') }}</time
      >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        <UserDetailsTooltip :user="event.actor_id">
          {{ getTranslation(event.past_tense_t, event.attr) }}
        </UserDetailsTooltip>
      </h3>
      <p
        class="mb-4 text-sm font-normal text-gray-500 dark:text-gray-400"
        v-if="event.actor_location_name"
      >
        {{ event.actor_location_name }}
      </p>
    </li>
  </ol>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import UserDetailsTooltip from '../components/user/DetailsTooltip.vue';
import {useI18n} from "vue-i18n";
export default defineComponent({
  name: 'EventTimeline',
  components: { UserDetailsTooltip },
  props: {
    events: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const { t } = useI18n();
    const getTranslation = (tag, attr) => {
      const translated_attrs = Object.fromEntries(
        Object.entries(attr).map(([key, value]) => [
          key,
          key.endsWith('_t') ? t(value as string) : value,
        ]),
      );
      return t(tag, translated_attrs);
    };

    return {
      getTranslation,
    };
  },
});
</script>

<style scoped></style>
