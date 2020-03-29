<template>
  <div class="grid--footer self-center">
    <router-link
      v-for="item in routes"
      :key="item.key"
      :to="item.route || '#'"
      class="font-body font-display text-h3 text-crisiscleanup-dark-300"
    >
      {{ lang[item.key] }}
    </router-link>
  </div>
</template>

<script>
import VueTypes from 'vue-types';

export const FooterNavigation = [
  // {
  //   key: 'demo',
  // },
  {
    key: 'contact',
  },
  {
    key: 'terms',
    route: '/terms',
  },
  {
    key: 'privacy',
    route: '/privacy',
  },
];
// This component is designed for usage in layouts/Home
export default {
  name: 'HomeFooter',
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
        demo: this.$t('publicNav.demo'),
        contact: this.$t('publicNav.contact'),
        terms: this.$t('publicNav.terms'),
        privacy: this.$t('publicNav.privacy'),
        ...this.translations,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.homegrid {
  &.grid-container {
    .grid {
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
