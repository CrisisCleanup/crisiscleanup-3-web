<template>
  <div class="p-6 bg-gray-100 h-full overflow-auto relative">
    <div v-if="!loading">

    <div class='m-3 bg-white shadow w-64 h-auto content-center flex-wrap'>
       <genstatscard />       
    </div>

    </div>
  </div>
</template>

<script>
import genstatscard from '../../components/GeneralStatsCard.vue';
export default {
  name: 'Phone',
  components:{ genstatscard }

};
</script>
