<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid--backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <base-text variant="h6" class="text-4xl" v-html="contrib.title" />
        <div class="row mb-6">
          <base-text variant="h3">{{ $t('contrib.subtitle1') }}</base-text>
          <base-text v-html="contrib.subtitle1_intro" />
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout, { HomeNav, HomeActions } from '@/layouts/Home';

export default {
  name: 'Contributions',
  components: { HomeLayout, HomeNav, HomeActions },
  computed: {
    contrib() {
      return {
        title: this.$t('~~Example Title'),
        subtitle1_intro: this.$t('Example Subtitle1 Intro'),
      };
    },
  },
};
</script>

<style scoped>
@import '../../assets/css/_terms-privacy.scss';

.homegrid {
  &.grid-container {
    grid-template-areas:
      'logo . . . . survivors'
      'nav . main main main .'
      'nav . main main main .'
      'actions actions main main main .'
      '. . main main main .';
    overflow: auto;

    .grid {
      &--overlay {
        grid-row: 1 / span 5;
        grid-column: 1 / span 3;
      }
    }
  }
}
</style>
