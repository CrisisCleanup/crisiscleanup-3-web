<template>
  <div class="py-4 px-6 bg-gray-100 h-full overflow-auto relative">
    <div v-if="!loading">
      <div
        class="my-2 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap"
      >
        <genstatscard />
      </div>
      <div
        class="my-4 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap "
      >
        <operatorstats />
      <div class="flex">
        <div class="w-1/4 m-35 p-6 shadow text-base bg-white relative">
          <contact-card></contact-card>
        </div>
        <div class="w-1/4 m-10 p-6 shadow bg-white relative">
          <h1>Hello</h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import genstatscard from '../../components/GeneralStatsCard.vue';
import operatorstats from '../../components/OperatorStatisticsCard';
import ContactCard from '../../components/ContactCard'
export default {
  name: 'Phone',
  components: { genstatscard, operatorstats, 'contact-card': Conta },
};
</script>
