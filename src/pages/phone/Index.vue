<template>
  <div class="py-4 px-6 bg-gray-100 h-full overflow-auto relative">
    <div v-if="!loading">
      <div class="flex">
        <div
          class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
        >
          <contact-card />
        </div>
      </div>
      <div
        class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
      >
        <genstatscard />
      </div>
      <div
        class="my-4 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
      >
        <operatorstats />
      </div>
    </div>
    <div
      class="my-4 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
    >
      <stories-card />
    </div>
  </div>
</template>

<script>
import genstatscard from '../../components/GeneralStatsCard.vue';
import operatorstats from '../../components/OperatorStatisticsCard';
import ContactCard from '../../components/ContactCard';
import PeopleStoriesCard from '../../components/PeopleStoriesCard'
export default {
  name: 'Phone',
  components: { genstatscard,
    operatorstats,
    'contact-card': ContactCard,
    'stories-card': PeopleStoriesCard,
  },
};
</script>
