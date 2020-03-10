<template>
  <div>
    <b-card>
      <b-tabs pills card>
        <b-tab title="News" class="news-tab" active>
          <NewsCard />
          <NewsCard />
          <!--- See All Button --->
          <div id="See-All-btn">
            <base-button class="text-crisis-cleanup-yellow-900 align-right">
              See All
            </base-button>
          </div>
        </b-tab>
        <b-tab title="Training" class="training-tab" active>
          <TrainingsCard />
          <TrainingsCard />
          <!--- See All Button --->
          <div id="See-All-btn">
            <base-button class="text-crisis-cleanup-yellow-900 align-right">
              See All
            </base-button>
          </div>
        </b-tab>
      </b-tabs>
    </b-card>
    <!--line-->
    <hr class="bg-white" />
  </div>
</template>

<script>
import NewsCard from './NewsCard';
import TrainingsCard from './TrainingsCard';
export default {
  name: 'NewsTrainingCard',
  components: {
    NewsCard,
    TrainingsCard,
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
