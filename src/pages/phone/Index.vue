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
      </div>
    </div>
  </div>
</template>

<script>
import genstatscard from '../../components/GeneralStatsCard.vue';
import operatorstats from '../../components/OperatorStatisticsCard';
export default {
  name: 'Phone',
  components: { genstatscard, operatorstats },
};
</script>
