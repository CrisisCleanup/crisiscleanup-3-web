<template>
  <ol class="relative border-l border-gray-200 dark:border-gray-700 mx-2">
    <li class="mb-10 ml-4" v-for="event in events" :key="event.id">
      <div
        class="absolute w-3 h-3 bg-gray-200 rounded-full -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"
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
        class="mb-4 text-base font-normal text-gray-500 dark:text-gray-400"
        v-if="event.event.description_t"
      >
        {{ event.event.description_t }}
      </p>
    </li>
  </ol>
</template>

<script>
import UserDetailsTooltip from '../components/user/DetailsTooltip.vue';
import { formatDateString } from '../filters/index';
export default {
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
};
</script>

<style scoped></style>
