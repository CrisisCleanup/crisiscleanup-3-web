<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <home-actions />
      <div class="grid--main">
        <LoginForm />
      </div>
      <div class="grid--globe self-center">
        <div class="homegrid-globe">
          <img src="@/assets/globe.png" alt="globe" />
        </div>
      </div>
      <home-footer />
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
      grid-template-areas:
        'logo'
        'main'
        'actions';
      grid-template-rows: 0.5fr 0.5fr 4fr 1fr;
    }
  }
}
</style>
