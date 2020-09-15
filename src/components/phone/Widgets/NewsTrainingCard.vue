<template>
  <TabbedCard :tabs="tabs" class="h-auto">
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
          imagePath: require('@/assets/newspicss.png'),
          description: this.$t(
            `~~For those of you who have ever used our call system in the past (as clunky as it was) You're going to LOVE this new system. It is easier to ever! However, it is brand new, so if you find bugs, please let us know.`,
          ),
          timeToComplete: this.$t('~~15 minutes'),
        },
      ];
    },
    trainingCards() {
      return this.trainings.map((tr) => ({
        imagePath: this.getTrainingThumbnail(tr),
        description: this.$t(tr.title_t),
        timeToComplete: tr.settings.completion_seconds,
      }));
    },
  },
};
</script>

<style></style>
