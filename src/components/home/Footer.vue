<template>
  <div class="grid--footer self-center">
    <span v-for="item in routes" :key="item.key">
      <a
        v-if="item.external"
        :href="item.route"
        class="font-body font-display text-h3 text-crisiscleanup-dark-300"
        target="_blank"
      >
        {{ lang[item.key] }}
      </a>
      <router-link
        v-if="!item.external"
        :to="item.route || '#'"
        class="font-body font-display text-h3 text-crisiscleanup-dark-300"
      >
        {{ lang[item.key] }}
      </router-link>
    </span>
    <a
      class="w-32 ml-9"
      target="_blank"
      href="https://aws.amazon.com/government-education/nonprofits/disaster-response/"
      ><img src="@/assets/powered_by_aws.png"
    /></a>
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
    route: 'https://crisiscleanup.zendesk.com/hc/en-us/requests/new',
    external: true,
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
    ).def(FooterNavigation),
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
