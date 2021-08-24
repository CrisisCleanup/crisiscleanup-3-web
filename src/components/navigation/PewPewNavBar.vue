<template>
  <div class="pewpew__nav">
    <router-link :to="{ name: 'nav.pew' }" class="pewpew__navheader">
      <img
        v-if="colorMode === 'dark'"
        src="@/assets/cc-pew-pew-logo.gif"
        :alt="$t('nav.crisis_cleanup')"
        class="h-8"
      />
      <img
        v-else
        src="@/assets/ccu-logo-black-500w.png"
        :alt="$t('nav.crisis_cleanup')"
        class="h-16"
      />
    </router-link>


    <template v-for="r in navRoutes">
      <a
        v-if="r.external"
        :key="r.title"
        class="pewpew__navlink"
        :alt="r.title"
        :href="r.route"
      >
        <ccu-icon v-bind="r.iconProps" />
        {{ r.title }}
      </a>
      <router-link v-else :to="r.routeProps" class="pewpew__navlink">
        <ccu-icon v-bind="r.iconProps" />
        {{ r.title }}
      </router-link>
    </template>
  </div>
</template>

<script>
import { UserMixin } from '@/mixins';
import { HomeNavigation } from '@/components/home/SideNav.vue';
import { FooterNavigation } from '@/components/home/Footer.vue';
import _ from 'lodash';

export default {
  name: 'PewPewNavBar',
  mixins: [UserMixin],
  props: {
    colorMode: {
      type: String,
      required: true,
    },
  },
  computed: {
    publicRoutes() {
      const _homeSideRoutes = _.keyBy(HomeNavigation, 'key');
      const _homeFooterRoutes = _.keyBy(FooterNavigation, 'key');
      const homeRoutes = { ..._homeSideRoutes, ..._homeFooterRoutes };
      return {
        home: { route: { name: 'nav.dashboard' } },
        'current-disasters': {
          title: 'publicNav.current_disasters',
          route: { name: 'nav.cases' },
        },
        survivor: { ...homeRoutes.survivor, icon: 'earth-globe' },
        training: homeRoutes.training,
        contact: homeRoutes.contact,
        about: { title: 'publicNav.about_us', route: { name: 'nav.about' } },
        blog: { ...homeRoutes.blog, icon: 'notepad' },
        terms: homeRoutes.terms,
        privacy: homeRoutes.privacy,
      };
    },
    routes() {
      return {
        dashboard: {},
        cases: {},
        phone: {
          disabled: !this.$can || !this.$can('phone_agent'),
        },
        organization: { title: 'nav.my_organization' },
        other_organizations: { icon: 'otherorg' },
        reports: {},
        training: { icon: { type: 'info', invertColor: true } },
        admin: {
          disabled: !(this.currentUser && this.currentUser.isAdmin),
        },
      };
    },
    navRoutes() {
      const _routeDefs = this.isLoggedIn ? this.routes : this.publicRoutes;
      const _routeRootKey = this.isLoggedIn ? 'nav' : 'publicNav';
      return _.map(_routeDefs, (value, key) => {
        const { icon, disabled, title, route, external } = value;
        if (disabled === true) return false;
        let iconProps = { type: key };
        if (!_.isNil(icon)) {
          if (_.isObject(icon)) {
            iconProps = icon;
          } else {
            iconProps.type = icon;
          }
        }
        const routeName = `${_routeRootKey}.${key}`;
        let _title = this.$t(routeName);
        if (!_.isNil(title)) {
          _title = this.$t(title);
        }
        let routeProps = route;
        if (!external && _.isNil(route)) {
          routeProps = { name: routeName };
        }
        return {
          ...value,
          iconProps,
          title: _title,
          routeName,
          routeProps,
        };
      });
    },
  },
};
</script>
<style lang="postcss">
.pewpew {
  &__nav {
    @apply col-span-2 flex flex-col text-xs text-center break-words;
    background: #242c36;
  }

  &__navheader {
    @apply flex justify-center items-center m-2;

    img {
      @apply h-10;
    }
  }

  &__navlink {
    @apply flex flex-col justify-center items-center m-1 p-2 rounded-lg;
    font-size: 0.55rem;
    transition: background-color 300ms;

    img {
      @apply w-4 h-4;
    }

    &:focus,
    &:hover {
      @apply bg-white bg-opacity-25;
    }
  }
}
</style>
