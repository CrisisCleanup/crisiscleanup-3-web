<template>
  <HomeLayout>
    <template #grid-overlay>
      <div class="grid--overlay homegrid-backdrop" />
    </template>
    <template #grid-content>
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
          :action="
            () => {
              $router.push('/register');
            }
          "
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
      <div class="grid--footer self-center">
        <router-link
          v-for="item in footer"
          :key="item.key"
          :to="item.route || '#'"
          class="font-body font-display text-h3 text-crisiscleanup-dark-300"
        >
          {{ lang.footer[item.key] }}
        </router-link>
      </div>
    </template>
  </HomeLayout>
</template>

<script>
import HomeLayout from '@/layouts/Home';
import LoginForm from '@/components/forms/LoginForm';

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

export const FooterNavigation = [
  {
    key: 'demo',
  },
  {
    key: 'contact',
  },
  {
    key: 'terms',
  },
  {
    key: 'privacy',
  },
];

export default {
  name: 'LoginPage',
  components: { HomeLayout, LoginForm },
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
      footer: FooterNavigation,
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
      &--nav {
        a {
          transition: color 250ms ease;
          &:hover {
            @apply text-crisiscleanup-dark-300;
          }
        }
      }
      &--globe {
        justify-self: center;
      }
      &--footer {
        @apply mr-24 h-full;
        display: inline-grid;
        align-content: center;
        justify-content: space-between;
        grid-auto-flow: column;
        a {
          @apply px-4;
        }
      }
    }
  }
}
</style>
