<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main h-screen">
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
          <div class="flex-col w-1/2 h-screen">
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
          <div class="flex-col w-1/2 h-screen">
            <div class="video-container">
              <iframe
                class="resp-video"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/Cjf72U8U_Y8"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <!--- Training Video Description --->
          <div class="flex-col w-1/2">
            <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
              {{ $t('training.mandatory_phone_training') }}
            </h1>
            <p class="px-10 text-xl text-crisiscleanup-dark-400">
              {{ $t('training.mandatory_phone_training_intro') }}
            </p>
          </div>
          <!--- /Training Video Description --->
        </div>
        <!--- /Content --->

        <!--- Content --->
        <div class="flex flex-row justify-between m-5">
          <!--- Training Video --->
          <div class="flex-col w-1/2 h-screen">
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

        <!--- Content --->
        <div class="flex flex-row justify-between m-5">
          <!--- Training Video --->
          <div class="flex-col w-1/2 h-screen">
            <div class="video-container">
              <iframe
                class="resp-video"
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/yCxI5YHyX5k"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <!--- Training Video Description --->
          <div class="flex-col w-1/2">
            <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
              {{ $t('training.ccu_intro') }}
            </h1>
            <p class="px-10 text-xl text-crisiscleanup-dark-400">
              {{ $t('training.ccu_intro_intro') }}
            </p>
          </div>
          <!--- /Training Video Description --->
        </div>
        <!--- /Content --->
      </div>
      <home-footer />
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

<style scoped>
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
