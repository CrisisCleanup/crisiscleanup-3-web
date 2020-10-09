<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <!--- Title --->
        <div class="flex flex-col m-5 pb-8">
          <h1 class="text-5xl px-0.5 text-crisiscleanup-dark-500 font-bold">
            {{ $t('training.training') }}
          </h1>
          <!--- Description --->
          <p class="text-xl px-0.5">
            {{ $t('training.please_complete_training') }}
          </p>
        </div>
        <!--- Content --->
        <div class="flex flex-row justify-between m-5">
          <!--- Training Video --->
          <div class="flex-col w-1/2">
            <div class="video-container">
              <iframe
                class="resp-video"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/ot4LZjtK0xo"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <!--- Training Video Description --->
          <div class="flex-col w-1/2">
            <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
              {{ $t('training.mandatory_training_video') }}
            </h1>
            <p class="px-10 text-xl text-crisiscleanup-dark-400">
              {{ $t('training.mandatory_training_video_intro') }}
            </p>
          </div>
          <!--- /Training Video Description --->
        </div>
        <!--- /Content --->

        <!--- Content --->
        <div class="flex flex-row justify-between m-5">
          <!--- Training Video --->
          <div class="flex-col w-1/2">
            <div class="video-container">
              <iframe
                class="resp-video"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dp_1A1qVSog"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <!--- Training Video Description --->
          <div class="flex-col w-1/2">
            <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
              {{ $t('training.suppliment_phone_training') }}
            </h1>
            <p class="px-10 text-xl text-crisiscleanup-dark-400">
              {{ $t('training.suppliment_phone_training_intro') }}
            </p>
          </div>
          <!--- /Training Video Description --->
        </div>
        <!--- /Content --->

        <!--- Content --->
        <div class="flex flex-row justify-between m-5">
          <!--- Training Video --->
          <div class="flex-col w-1/2">
            <div class="video-container">
              <iframe
                class="resp-video"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/HqXm2s5Dy3c"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <!--- Training Video Description --->
          <div class="flex-col w-1/2">
            <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
              {{ $t('training.calldown_training') }}
            </h1>
            <p class="px-10 text-xl text-crisiscleanup-dark-400">
              {{ $t('training.calldown_training_intro') }}
            </p>
          </div>
          <!--- /Training Video Description --->
        </div>
        <!--- /Content --->

        <!--- Content --->
        <div class="flex flex-row justify-between m-5">
          <!--- Training Video --->
          <div class="flex-col w-1/2">
            <div class="video-container">
              <iframe
                class="resp-video"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/vWFI7udFmik"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <!--- Training Video Description --->
          <div class="flex-col w-1/2">
            <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
              {{ $t('training.ccu_during_covid') }}
            </h1>
            <p class="px-10 text-xl text-crisiscleanup-dark-400">
              {{ $t('training.ccu_during_covid_intro') }}
            </p>
          </div>
          <!--- /Training Video Description --->
        </div>
        <!--- /Content --->
        <home-footer />
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout, { HomeNav, HomeFooter, HomeActions } from '@/layouts/Home';

export default {
  name: 'TrainingPage',
  components: {
    HomeLayout,
    HomeFooter,
    HomeNav,
    HomeActions,
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid:
      [r1] 'logo . main main main main survivors' 20% [r1end]
      [r2] 'nav . main main main main main' [r2end]
      [r3] 'actions . main main main main main' [r3end]
      [r4] '. . . . footer footer .' [r4end]
      / auto;

    .grid {
      &--main {
        align-self: center;
        @apply mx-10 h-full;
        overflow: auto;
        grid-column: logo-end / span main-end;
        grid-row: main-start / span actions-end;
      }
      &--overlay {
        grid-column: 1 / span 5;
      }
      &--footer {
        height: auto;
        display: flex;
        justify-content: space-evenly;
        @apply my-1;
      }
    }
  }
}
.resp-video {
  position: absolute;
  top: 0;
  left: 0;
  border: 0;
  width: 100%;
  height: 100%;
}
.video-container {
  position: relative;
  overflow: hidden;
  padding-top: 56.25%;
}
</style>
