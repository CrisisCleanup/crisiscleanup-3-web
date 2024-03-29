<template>
  <TabbedCard :tabs="tabs" class="h-auto" :style="{ height: 'auto' }">
    <template #training>
      <div class="card-container h-full overflow-auto">
        <TrainingsCard
          v-for="(training, idx) in trainingCards"
          :key="idx"
          :image-path="training.imagePath"
          :description="training.description"
          :time-to-complete="training.timeToComplete"
          @onTrainingSelected="$emit('phone:showTraining', true)"
        ></TrainingsCard>
      </div>
    </template>
    <template #news>
      <div class="card-container h-full overflow-auto">
        <NewsCard
          v-for="(newss, idx) in news"
          :key="`${newss.date}_${idx}`"
          v-bind="newss"
        />
      </div>
    </template>
  </TabbedCard>
</template>

<script>
import VueTypes from 'vue-types';
import _ from 'lodash';
import NewsCard from '@/components/phone/NewsCard.vue';
import TrainingsCard from '@/components/phone/TrainingsCard.vue';
import TabbedCard from '@/components/cards/TabbedCard.vue';
import { TrainingMixin } from '@/mixins';

export default {
  name: 'NewsTrainingCard',
  mixins: [TrainingMixin],
  components: {
    NewsCard,
    TrainingsCard,
    TabbedCard,
  },
  props: {
    trainingItems: VueTypes.array,
    userTrainingItems: VueTypes.array,
  },
  computed: {
    tabs() {
      return [
        {
          key: 'news',
        },
        {
          key: 'training',
        },
      ];
    },
    news() {
      return [
        {
          media: {
            path: require('@/assets/news/pipes.jpg'),
            alt: this.$t('phoneDashboard.news_1_img_title'),
          },
          content: this.$t('phoneDashboard.news_1'),
          date: this.$t('phoneDashboard.news_1_date'),
        },
        {
          media: {
            path: require('@/assets/news/hurricane.png'),
            alt: this.$t('phoneDashboard.news_2_img_title'),
          },
          content: this.$t('phoneDashboard.news_2'),
          date: this.$t('phoneDashboard.news_2_date'),
        },
        {
          media: {
            path: require('@/assets/news/list.png'),
            alt: this.$t('phoneDashboard.news_3_img_title'),
          },
          content: this.$t('phoneDashboard.news_3'),
          date: this.$t('phoneDashboard.news_3_date'),
        },
        {
          media: {
            path: require('@/assets/news/char_3_phone_blue.png'),
            alt: this.$t('phoneDashboard.news_4_img_title'),
          },
          content: this.$t('phoneDashboard.news_4'),
          date: this.$t('phoneDashboard.news_4_date'),
        },
        {
          media: {
            path: require('@/assets/news/smart_phone.png'),
            alt: this.$t('phoneDashboard.news_5_img_title'),
          },
          content: this.$t('phoneDashboard.news_5'),
          date: this.$t('phoneDashboard.news_5_date'),
        },
        {
          media: {
            path: require('@/assets/news/photo_lady_phone_computer.png'),
            alt: this.$t('phoneDashboard.news_6_img_title'),
          },
          content: this.$t('phoneDashboard.news_6'),
          date: this.$t('phoneDashboard.news_6_date'),
        },
      ];
    },
    trainingCards() {
      return _.orderBy(this.trainingItems, ['settings.order'], ['asc']).map(
        (tr) => ({
          imagePath: this.getTrainingThumbnail(tr),
          description: this.$t(tr.title_t),
          timeToComplete: tr.settings.completion_seconds,
        }),
      );
    },
  },
};
</script>

<style>
.card-container {
  max-height: 60vh;
}
</style>
