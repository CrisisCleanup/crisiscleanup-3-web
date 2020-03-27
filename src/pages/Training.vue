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
            Training
          </h1>
          <!--- Description --->
          <p class="text-xl px-0.5">
            Please take a minute to see our trainings. It will help you when a
            you when a disaster happens.
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
                src="https://www.youtube.com/embed/3wumEh8wcak"
                frameborder="0"
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              />
            </div>
          </div>
          <!--- Training Video Description --->
          <div class="flex-col w-1/2">
            <h1 class="px-10 text-3xl font-bold text-crisiscleanup-dark-500">
              Mandatory Crisis Cleanup Training Video
            </h1>
            <p class="px-10 text-xl text-crisiscleanup-dark-400">
              Please Take a Minute to Complete a Short Training
            </p>
          </div>
        </div>
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
