<template>
  <div class="pewpew__nav h-full">
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
        :alt="r.title"
        :href="r.route"
        target="_blank"
      >
        <div class="pewpew__navlink">
          <ccu-icon :linked="true" v-bind="r.iconProps" />
          {{ r.title }}
        </div>
      </a>
      <router-link v-else :key="r.title" :to="r.routeProps">
        <div class="pewpew__navlink">
          <ccu-icon :linked="true" v-bind="r.iconProps" />
          {{ r.title }}
        </div>
      </router-link>
    </template>

    <div v-if="!isLoggedIn" class="pewpew__navactions flex flex-col m-1 mt-6">
      <base-text class="flex text-white">{{
        $t('publicNav.relief_orgs_only')
      }}</base-text>
      <base-button
        class="text-black text-xs font-semibold flex flex-grow p-1"
        variant="solid"
        :action="() => $router.push({ name: 'nav.register' })"
      >
        {{ $t('actions.register') }}
      </base-button>
    </div>
  </div>
</template>

<script>
import _ from 'lodash';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import useNavigation from '@/hooks/useNavigation';
import useAcl from '@/hooks/useAcl';
import useCurrentUser from '@/hooks/useCurrentUser';

export default {
  name: 'PewPewNavBar',
  props: {
    colorMode: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const store = useStore();
    const { $can } = useAcl();
    const { t } = useI18n();
    const isLoggedIn = computed(() => store.getters['auth/isLoggedIn']);

    const currentIncidentId = store.getters['incident/currentIncidentId'];
    const { currentUser } = useCurrentUser();

    const { HomeNavigation, FooterNavigation } = useNavigation();
    const publicRoutes = computed(() => {
      const _homeSideRoutes = _.keyBy(HomeNavigation, 'key');
      const _homeFooterRoutes = _.keyBy(FooterNavigation, 'key');
      const homeRoutes = { ..._homeSideRoutes, ..._homeFooterRoutes };
      return {
        survivor: { ...homeRoutes.survivor, icon: 'contact' },
        training: homeRoutes.training,
        about: { title: 'publicNav.about_us', route: { name: 'nav.about' } },
        blog: { ...homeRoutes.blog, icon: 'notepad' },
        terms: homeRoutes.terms,
        privacy: homeRoutes.privacy,
      };
    });

    const routes = computed(() => {
      return {
        dashboard: {},
        cases: {
          route: {
            name: 'nav.new_case',
            params: {
              incidentId: currentIncidentId,
            },
          },
        },
        phone: {
          disabled: !$can || !$can('phone_agent'),
        },
        organization: {
          title: 'nav.my_organization',
          route: { name: 'nav.organization_invitations' },
        },
        other_organizations: { icon: 'otherorg' },
        reports: {},
        training: { icon: { type: 'info', invertColor: true } },
        admin: {
          disabled: !(currentUser && currentUser.isAdmin),
          route: { name: 'nav.admin_dashboard' },
        },
      };
    });

    const navRoutes = computed(() => {
      const _routeDefs = store.getters['auth/isLoggedIn']
        ? routes.value
        : publicRoutes.value;
      const _routeRootKey = store.getters['auth/isLoggedIn']
        ? 'nav'
        : 'publicNav';
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
        let _title = t(routeName);
        if (!_.isNil(title)) {
          _title = t(title);
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
    });

    return {
      currentIncidentId,
      publicRoutes,
      routes,
      navRoutes,
      isLoggedIn,
    };
  },
};
</script>
<style lang="scss">
.pewpew {
  &__nav {
    @apply col-span-2 flex flex-col text-xs text-center break-words no-underline;
    color: white;
    background: #242c36;

    a {
      @apply no-underline;
    }
  }

  &__navheader {
    @apply flex justify-center items-center m-2;

    img {
      @apply h-10;
    }
  }

  &__navlink {
    @apply flex flex-col justify-center items-center m-1 p-2 rounded-lg;
    color: white;
    /** this is against accessiblity standards. */
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

  &__navactions {
    & > p {
      @apply text-white font-bold;
      /** this is against accessiblity standards. */
      font-size: 0.55rem;
    }
    & > *:last-child {
      @apply mt-2;
    }
  }
}
</style>
