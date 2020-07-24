<template>
  <TabbedCard :tabs="tabs">
    <template class="flex flex-grow" #training>
      <TrainingsCard
        v-for="(training, idx) in trainings"
        :key="idx"
        :image-path="training.imagePath"
        :description="training.description"
        :time-to-complete="training.timeToComplete"
        @onTrainingSelected="$emit('phone:showTraining', true)"
      ></TrainingsCard>
    </template>
    <template class="flex flex-grow" #news>
      <NewsCard
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

export default {
  name: 'NewsTrainingCard',
  components: {
    NewsCard,
    TrainingsCard,
    TabbedCard,
  },
  computed: {
    tabs() {
      return [
        {
          key: 'news',
          title: 'News',
          component: NewsCard,
        },
        {
          key: 'training',
          title: 'Training',
          component: TrainingsCard,
        },
      ];
    },
    news() {
      return [
        {
          imagePath: require('@/assets/newspicss.png'),
          description: this.$t(
            `~~For those of you who have ever used our call system in the past (as clunky as it was) You're going to LOVE this new system. It is easier to ever! However it is brand new, so if you find bugs, please let us know.`,
          ),
          timeToComplete: this.$t('~~15 minutes'),
        },
      ];
    },
    trainings() {
      return [
        {
          imagePath: require('@/assets/crisiscleanuphand_training.png'),
          description: this.$t(' ~~Crisis Cleanup Basic Training'),
          timeToComplete: this.$t('~~10 minutes'),
        },
        {
          imagePath: require('@/assets/crisiscleanupphone_training.png'),
          description: this.$t('~~Phone System Basic Training'),
          timeToComplete: this.$t('~~15 minutes'),
        },
      ];
    },
  },
};
</script>

<style></style>
