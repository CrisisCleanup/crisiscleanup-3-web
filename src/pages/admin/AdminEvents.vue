<template>
  <div class="events__container">
    <TitledCard class="search__card" title="~~Event Search">
      <div class="search__container">
        <EventSearchTable />
      </div>
    </TitledCard>
  </div>
</template>

<script>
import EventSearchTable from '@/components/admin/events/EventSearchTable.vue';
import TitledCard from '@/components/cards/TitledCard.vue';

export default {
  name: 'AdminEvents',
  components: { EventSearchTable, TitledCard },
};
</script>

<style scoped lang="postcss">
.events {
  &__container {
    @apply h-full w-full bg-crisiscleanup-light-grey py-6;
    > div {
      lost-row: 1/3;
      @apply pb-6;
    }
  }
}

.search {
  &__container {
    @apply h-full w-full m-6;
    transition: height 600ms easeInCirc;
  }
}
</style>
