<template>
  <ol class="relative border-l border-gray-200 dark:border-gray-700 mx-2">
    <li v-for="event in events" :key="event.id" class="mb-10 ml-4">
      <div
        class="absolute w-3 h-3 bg-gray-200 rounded-full -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"
        :data-testid="`testEvent${event.id}Div`"
      ></div>
      <time
        class="mb-1 text-sm font-normal leading-none text-gray-400 dark:text-gray-500"
        >{{ formatDateString(event.created_at, 'MM/DD/YYYY, h:mm:ss A') }}</time
      >
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        <UserDetailsTooltip :user="event.created_by">
          {{ event.event.event_name_t }}
        </UserDetailsTooltip>
      </h3>
      <p
        v-if="event.event.description_t"
        class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
      >
        {{ event.event.description_t }}
      </p>
    </li>
  </ol>
</template>

<script lang="ts">
import { formatDateString } from '../filters/index';
import UserDetailsTooltip from './user/DetailsTooltip.vue';

export default defineComponent({
  name: 'Timeline',
  components: { UserDetailsTooltip },
  props: {
    events: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    return { formatDateString };
  },
});
</script>

<style scoped></style>
