<template>
  <div class="grid--nav">
    <span v-for="item in routes">
      <a
        v-if="item.external"
        :href="item.route"
        class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
        target="_blank"
      >
        {{ lang.nav[item.key] }}
      </a>
      <router-link
        v-if="!item.external"
        :key="item.key"
        :to="item.route || '#'"
        class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
      >
        {{ lang.nav[item.key] }}
      </router-link>
    </span>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export const HomeNavigation = [
  {
    key: 'home',
    route: '/login',
  },
  {
    key: 'aboutUs',
    route: '/about',
  },
  {
    key: 'blog',
    route: 'http://blog.crisiscleanup.org',
    external: true,
  },
  {
    key: 'map',
    route: '/map',
  },
  {
    key: 'training',
    route: '/training',
  },
  {
    key: 'contact',
    route: 'https://crisiscleanup.zendesk.com/hc/en-us/requests/new',
    external: true,
  },
];

// This component is designed for usage in layouts/Home
export default {
  name: 'SideNav',
  props: {
    routes: VueTypes.arrayOf(
      VueTypes.shape({
        key: VueTypes.string,
        route: VueTypes.string,
        external: VueTypes.bool.def(false),
      }),
    ).def(HomeNavigation),
    translations: VueTypes.objectOf(VueTypes.string),
  },
  computed: {
    lang() {
      return {
        nav: {
          home: this.$t('publicNav.home'),
          aboutUs: this.$t('publicNav.about_us'),
          blog: this.$t('publicNav.blog'),
          map: this.$t('publicNav.map'),
          training: this.$t('publicNav.training'),
          contact: this.$t('publicNav.contact'),
          ...this.translations,
        },
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.homegrid {
  &.grid-container {
    .grid {
      &--nav {
        display: inline-grid;
        align-items: center;
        margin-left: 2.8rem;
        @apply py-16 my-20;
        a {
          transition: color 250ms ease;
          &:hover {
            @apply text-crisiscleanup-dark-300;
          }
        }
      }
    }
  }
}
</style>
