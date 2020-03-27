<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
      <home-nav />
      <div class="grid--actions">
        <base-text
          font="display"
          variant="h2"
          :weight="300"
          class="text-crisiscleanup-dark-500"
          >{{ lang.relief_org }}</base-text
        >
        <base-button
          variant="solid"
          size="large"
          :action="() => $router.push('/register')"
        >
          {{ lang.register }}
        </base-button>
      </div>
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
import HomeLayout, { HomeNav, HomeFooter } from '@/layouts/Home.vue';
import LoginForm from '@/components/forms/LoginForm.vue';

export default {
  name: 'LoginPage',
  components: { HomeLayout, LoginForm, HomeNav, HomeFooter },
  data() {
    return {
      lang: {
        register: this.$t('actions.register'),
        relief_org: this.$t('publicNav.relief_orgs_only'),
      },
    };
  },
};
</script>

<style scoped lang="scss">
.homegrid {
  &.grid-container {
    grid:
      [r1] 'logo . . . . . survivors' 20% [r1end]
      [r2] 'nav . main main globe globe globe' [r2end]
      [r3] 'nav . main main globe globe globe' [r3end]
      [r4] 'actions . . . footer footer footer' [r4end]
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
</style>
