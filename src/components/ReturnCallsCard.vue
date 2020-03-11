<template>
  <div>
    <b-card>
      <b-tabs pills card>
        <!--- Current Call --->
        <b-tab title="Current Call" class="current-call-tab" active>
          Current Call
          <!--- See All Button --->
          <div id="See-All-btn">
            <base-button class="text-crisis-cleanup-yellow-900 align-right">
              See All
            </base-button>
          </div>
        </b-tab>
        <!---Scripts Tab--->
        <b-tab title="Scripts" class="scripts-tab" active>
          Scripts
          <!--- See All Button --->
          <div id="See-All-btn">
            <base-button class="text-crisis-cleanup-yellow-900 align-right">
              See All
            </base-button>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script>
//import NewsCard from './NewsCard';
//import TrainingsCard from './TrainingsCard';
export default {
  name: 'ReturnCallsCard',
  components: {
    //NewsCard,
    //TrainingsCard,
  },
};
</script>

<style scoped>
/* tab selection colors */
.news-tab {
  border-width: thick;
}
.news-tab:focus {
  border-bottom: #f79820;
  border-width: thick;
}
.training-tab {
  border-width: thick;
}
.training-tab:focus {
  border-bottom: #f79820;
  border-width: thick;
}
</style>
