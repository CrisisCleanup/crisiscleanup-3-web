<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <!--- Navigation --->
      <div class="grid--nav">
        <router-link
          v-for="item in navigation"
          :key="item.key"
          :to="item.route || '#'"
          class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
        >
          {{ lang.nav[item.key] }}
        </router-link>
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
  data() {
    return {
      lang: {
        register: this.$t('actions.register'),
        relief_org: this.$t('publicNav.relief_orgs_only'),
        nav: {
          home: this.$t('publicNav.home'),
          aboutUs: this.$t('publicNav.about_us'),
          blog: this.$t('publicNav.blog'),
          map: this.$t('publicNav.map'),
          training: this.$t('publicNav.training'),
          contact: this.$t('publicNav.contact'),
        },
        footer: {
          demo: this.$t('publicNav.demo'),
          contact: this.$t('publicNav.contact'),
          terms: this.$t('publicNav.terms'),
          privacy: this.$t('publicNav.privacy'),
        },
      },
      navigation: HomeNavigation,
    };
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
