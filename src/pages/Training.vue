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
      <div class="grid--main h-screen border-2">
        <!--- Title --->
        <base-text weight="700" class="">Training</base-text>
        <!--- Description --->
        <base-text variant="h2" weight="500">
          Please take a minute to see our trainings. It will help you when a
          disaster happens.
        </base-text>
        <!--- Content --->
        <div class="flex flex-col justify-content">
          <div class="flex flex-row">
            <!--- Training Video --->
            <div class="flex flex-col">
              <video
                src="https://www.youtube.com/watch?v=3wumEh8wcak&feature=youtu.be"
              />
            </div>
            <!--- Training Video Description --->
            <div class="flex flex-col">
              <base-text weight="500" class="h-7"
                >Mandatory Crisis Cleanup Training Video</base-text
              >
              <base-text
                >Please Take a Minute to Complete a Short Training</base-text
              >
            </div>
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
