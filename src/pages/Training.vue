<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <!--- Navigation --->
      <div class="grid--nav border-2">
        <h1>I am in grid--nav</h1>
      </div>
      <!--- Footer --->
      <div class="grid--actions border-2">
        <h1>I am in grid--actions</h1>
      </div>
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
        <div class="flex flex-row m-5 align-left">
          <!--- Training Video --->
          <iframe
            width="560"
            height="315"
            src="https://www.youtube.com/embed/3wumEh8wcak"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <!--- Training Video Description --->
          <div class="flex-col">
            <h1
              class="h-7 px-10 text-4xl font-bold text-crisiscleanup-dark-500 py-5"
            >
              Mandatory Crisis Cleanup Training Video
            </h1>
            <p class="px-10 py-5 text-xl text-crisiscleanup-dark-400">
              Please Take a Minute to Complete a Short Training
            </p>
          </div>
        </div>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';

export const HomeNavigation = [
  {
    key: 'home',
  },
  {
    key: 'aboutUs',
  },
  {
    key: 'blog',
  },
  {
    key: 'map',
  },
  {
    key: 'training',
  },
  {
    key: 'contact',
  },
];

export default {
  name: 'TrainingPage',
  components: {
    HomeLayout,
  },
};
</script>
