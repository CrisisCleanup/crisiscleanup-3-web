<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <div
        v-if="showDevCredentials"
        class="absolute left-0 right-0 p-2 shadow-lg bg-white"
      >
        <span class="text-2xl"
          >Username: demo@crisiscleanup.org Password: demodemo1</span
        >
      </div>
      <home-nav />
      <home-actions class="mt-10" />
      <div class="grid--main">
        <LoginForm />
      </div>
      <div class="grid--globe self-center">
        <div class="homegrid-globe">
          <img src="@/assets/globe.png" :alt="$t('loginForm.globe')" />
        </div>
      </div>
      <home-footer :class="$mq === 'sm' ? 'mb-24 ml-20' : ''" />
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout, {
  HomeNav,
  HomeFooter,
  HomeActions,
} from '@/layouts/Home.vue';
import LoginForm from '@/components/forms/LoginForm.vue';

export default {
  name: 'LoginPage',
  components: { HomeLayout, LoginForm, HomeNav, HomeFooter, HomeActions },
  computed: {
    showDevCredentials() {
      return process.env.VUE_APP_STAGE === 'development';
    },
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid:
      [r1] 'logo . . . . . survivors' 20% [r1end]
      [r2] 'nav . main main globe globe globe' [r2end]
      [r3] 'actions . main main globe globe globe' [r3end]
      [r4] '. . . . footer footer footer' [r4end]
      / auto;
    .grid {
      &--main {
        align-self: center;
        @apply mx-10 h-full;
      }
      &--globe {
        justify-self: center;
      }
    }
  }
}

@media only screen and (max-width: 640px) {
  .homegrid {
    height: 100vh;
    &.grid-container {
      grid:
        [r1] 'logo survivors' [r1end]
        [r2] 'main main' [r2end]
        [r3] 'actions actions' [r3end]
        [r4] 'nav nav' [r4end]
        [r5] 'globe globe' [r5end]
        [r6] 'footer footer' [r6end]
        / auto;
      grid-template-rows: 0.5fr 0.5fr 4fr 1fr;
    }
  }
}
@media only screen and (max-width: 1223px) and (orientation: landscape) {
  .homegrid {
    height: 100vh;
    &.grid-container {
      grid:
        [r1] 'logo survivors' [r1end]
        [r2] 'main main' [r2end]
        [r3] 'actions actions' [r3end]
        [r4] 'nav nav' [r4end]
        [r5] 'globe globe' [r5end]
        [r6] 'footer footer' [r6end]
        / auto;
      grid-template-rows: 0.5fr 0.5fr 4fr 1fr;
    }
  }
}
</style>
