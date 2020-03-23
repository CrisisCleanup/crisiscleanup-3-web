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
        <div class="flex flex-col m-5">
          <h1
            class="text-4xl px-0.5 text-crisiscleanup-dark-500 font-bold pb-8"
          >
            About Crisis Cleanup
          </h1>
          <!--- Description --->
          <p class="text-xl px-0.5 pb-5">
            Crisis Cleanup is not a technology. It's a philosophy.
          </p>
          <p class="text-xl px-o.5 pb-8">
            <span class="font-bold">Mission:</span>
            To help voluntary relief organizations help more more people by
            enabling collaborative disaster recovery.
          </p>
        </div>
        <!--- Content --->
        <!--- About Us Video
        <div class="video-container">
          <iframe
            class="resp-video"
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/kc_T2giyg9Q"
            frameborder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
        --->
        <!--- About Us Cards --->
        <div class="flex flex-col m-5">
          <!-- Left Side Info Cards -->
          <div class="flex flex-row justify-between">
            <!-- Top Left Info Card -->
            <div class="flex-col">
              <div class="flex flex-row m-3">
                <img
                  src="../assets/tinycrisiscleanuplogoscreenshot.jpg"
                  class="w-7 h-6"
                />
                <base-text variant="body" class="pt-2">
                  <span class="font-bold">Crisis Cleanup</span>
                  is a collaborative
                  <span class="font-bold">disaster work order</span>
                  management platform that improves coordination, reduces
                  duplication of efforts, imporves efficiency and improves
                  volunteers' experience.
                </base-text>
              </div>
              <!-- Bottom Left Info Card -->
              <div class="flex-col">
                <div class="flex flex-row m-3">
                  <img
                    src="../assets/tinycrisiscleanuplogoscreenshot.jpg"
                    class="w-7 h-6"
                  />
                  <base-text variant="body" class="pt-2">
                    <span class="font-bold">Crisis Cleanup</span>
                    helps with the
                    <span class="font-bold">4 "C"s of disaster recovery:</span>
                    Communication, Coordination, Collaboration, and Cooperation
                    (as well as the fifth silent "C" of Competition)
                  </base-text>
                </div>
              </div>
            </div>
            <!-- Right Side Info Cards -->
            <div class="flex-col">
              <!-- Top Right Info Card -->
              <div class="flex flex-row m-3">
                <img
                  src="../assets/tinycrisiscleanuplogoscreenshot.jpg"
                  class="w-7 h-6"
                />
                <base-text variant="body" class="pt-2">
                  <span class="font-bold">Crisis Cleaning</span>
                  works best when a large number of volunteer organizations with
                  many volunteers work together
                  <span class="font-bold">
                    to large numbers of people in a large area, all at the same
                    time
                  </span>
                </base-text>
              </div>
              <!-- Bottom Right Info Card -->
              <div class="flex flex-col">
                <div class="flex flex-row m-3">
                  <img
                    src="../assets/tinycrisiscleanuplogoscreenshot.jpg"
                    class="w-7 h-6"
                  />
                  <base-text variant="body" class="pt-2">
                    <span class="font-bold"
                      >Crisis Cleanup does not create the 4 "R"s of disaster
                      recovery:</span
                    >
                    Relationships, Resources, Roles, and Responsibilites. It
                    cannot fix relationships, create resources, or dictate who
                    does what.
                  </base-text>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Stats -->
        <div class="flex flex-row justify-between">
          <div class="flex flex-col">
            <h1 class="text-xl font-bold">1700+</h1>
            <base-text weight="300" variant="h1">Organizations</base-text>
          </div>
          <div class="flex flex-col">
            <h1 class="text-xl font-bold">80,905+</h1>
            <base-text weight="300" variant="h1"
              >Homes and Businesses Cleaned and Recovered
            </base-text>
          </div>
          <div class="flex flex-col">
            <h1 class="text-xl font-bold">$46,929</h1>
            <base-text weight="300" variant="h1">
              Saved for disaster survivors each day
            </base-text>
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
  name: 'AboutPage',
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
  justify-content: right;
}
</style>
