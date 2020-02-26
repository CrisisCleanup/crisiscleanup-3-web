<template>
  <div class="py-4 px-6 bg-gray-100 h-full overflow-auto relative grid grid-cols-12 gap-4">
    <div class='flex'>
    <div v-if="!loading">
     <div class='flex flex-row justify-around'>
    <div class='my-2 mx-3 bg-white shadow w-3/4 h-auto content-center flex-wrap'>
       <genstatscard />     
    </div>
    
     <div class='my-2 bg-white shadow w-11/12 h-56 content-center flex-wrap'>
      <leaderBoard />
    </div>
    </div>
    <div class='my-4 mx-3 bg-white shadow w-64 h-auto content-center flex-wrap '>
       <operatorstats />
    </div>
    </div>
    </div>
  </div>
</template>
<script>
import genstatscard from '../../components/GeneralStatsCard.vue';
import operatorstats from '../../components/OperatorStatisticsCard';
import leaderBoard from '../../components/LeaderBoard';
export default {
  name: 'Phone',
  components:{ genstatscard, operatorstats, leaderBoard }

};
</script>
