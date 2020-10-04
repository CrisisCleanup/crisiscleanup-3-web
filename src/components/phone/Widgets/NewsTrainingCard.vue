<template>
  <TabbedCard :tabs="tabs" class="h-auto" :style="{ height: 'auto' }">
    <template #training>
      <TrainingsCard
        v-for="(training, idx) in trainingCards"
        :key="idx"
        :image-path="training.imagePath"
        :description="training.description"
        :time-to-complete="training.timeToComplete"
        @onTrainingSelected="$emit('phone:showTraining', true)"
      ></TrainingsCard>
    </template>
    <template #news>
      <NewsCard
        class="h-full"
        v-for="(newss, idx) in news"
        :key="idx"
        :image-path="newss.image"
        :description="newss.description"
        :time-to-complete="newss.timeToComplete"
      />
    </template>
  </TabbedCard>
</template>

<script>
import NewsCard from '@/components/phone/NewsCard.vue';
import TrainingsCard from '@/components/phone/TrainingsCard.vue';
import TabbedCard from '@/components/cards/TabbedCard.vue';
import { TrainingMixin } from '@/mixins';
import VueTypes from 'vue-types';

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
          imagePath: require('@/assets/news/hurricane.png'),
          description: this.$t('phoneDashboard.news_1'),
          //timeToComplete: this.$t('~~15 minutes'),
        },// TO DO: Ensure that the translation will accept html.
        {
          imagePath: require('@/assets/news/list.png'),
          description: this.$t('phoneDashboard.news_2'),
          //timeToComplete: this.$t('~~15 minutes'),
        },// TO DO: Ensure that the translation will accept html.
        {
          imagePath: require('@/assets/news/char_3_phone_blue.png'),
          description: this.$t('phoneDashboard.news_3'),
          //timeToComplete: this.$t('~~15 minutes'),
        },// TO DO: Ensure that the translation will accept html.
        {
          imagePath: require('@/assets/news/smartphone.png'),
          description: this.$t('phoneDashboard.news_4'),
          //timeToComplete: this.$t('~~15 minutes'),
        },// TO DO: Ensure that the translation will accept html.
        {
          imagePath: require('@/assets/news/photo_lady_phone_computer.png'),
          description: this.$t('phoneDashboard.news_5'),
          //timeToComplete: this.$t('~~15 minutes'),
        },// TO DO: Ensure that the translation will accept html.
      ];
    },
    trainingCards() {
      return this.trainingItems.map((tr) => ({
        imagePath: this.getTrainingThumbnail(tr),
        description: this.$t(tr.title_t),
        timeToComplete: tr.settings.completion_seconds,
      }));
    },
  },
};
</script>

<style></style>
