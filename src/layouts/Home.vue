<template>
  <div class="home-grid">
    <div
      class="top p-4 flex items-center justify-center flex-col md:flex-row md:justify-between w-[calc(100vw-0px)] min-w-0"
    >
      <div class="grid--logo logo w-24 md:w-52">
        <a href="/">
          <img src="../assets/ccu-logo-black-500w.png" alt="Crisis Cleanup" />
        </a>
      </div>
      <IncidentContact class="w-full md:w-max" />
    </div>
    <div
      :key="Object.keys(messages)"
      class="side m-8 flex flex-col justify-center"
    >
      <div class="grid--nav flex flex-col gap-2">
        <span v-for="item in routes" :key="item.key">
          <a
            v-if="item.external"
            :href="item.route"
            class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
            target="_blank"
          >
            {{ lang[item.key] }}
          </a>
          <router-link
            v-if="!item.external"
            :to="item.route || '#'"
            class="font-h1 font-display text-h1 text-crisiscleanup-dark-500"
          >
            {{ lang[item.key] }}
          </router-link>
        </span>
      </div>
    </div>
    <div class="register flex items-center justify-center m-8 w-max">
      <slot name="register">
        <div class="grid--actions mb-4 flex flex-col w-full">
          <base-text
            font="display"
            variant="h2"
            :weight="300"
            class="text-crisiscleanup-dark-500 w-full"
            >{{ $t('publicNav.relief_orgs_only') }}</base-text
          >
          <base-button
            variant="solid"
            size="large"
            class="w-full"
            :action="() => $router.push('/register')"
          >
            {{ $t('actions.register') }}
          </base-button>
        </div>
      </slot>
    </div>
    <div class="main w-screen md:w-auto sm:m-10 z-50">
      <slot />
    </div>
    <div class="bottom">
      <div v-if="route.name === 'nav.login'" class="flex flex-col m-8">
        <div class="flex items-end md:justify-end gap-5">
          <span v-for="item in footerRoutes" :key="item.key">
            <a
              v-if="item.external"
              :href="item.route"
              class="font-body font-display text-h2 text-crisiscleanup-dark-300"
              target="_blank"
            >
              {{ lang[item.key] }}
            </a>
            <router-link
              v-if="!item.external"
              :to="item.route || '#'"
              class="font-body font-display text-h2 text-crisiscleanup-dark-300"
            >
              {{ lang[item.key] }}
            </router-link>
          </span>
        </div>
        <a
          class="w-40 block md:self-end mt-3"
          target="_blank"
          href="https://aws.amazon.com/government-education/nonprofits/disaster-response/"
          ><img src="@/assets/powered_by_aws.png"
        /></a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { onBeforeMount, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import useSetupLanguage from '@/hooks/useSetupLanguage';
import IncidentContact from '@/components/IncidentContact.vue';

export default defineComponent({
  name: 'Home',
  components: { IncidentContact },
  setup() {
    const { t, messages } = useI18n();
    const { setupLanguage } = useSetupLanguage();
    const route = useRoute();

    onBeforeMount(async () => {
      await setupLanguage();
    });

    const defaultRoutes = [
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
        key: 'survivor',
        route: '/survivor',
      },
      {
        key: 'contact',
        route: 'https://crisiscleanup.zendesk.com/hc/en-us/requests/new',
        external: true,
      },
    ];

    const footerRoutes = [
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

    const lang = reactive({
      home: t('publicNav.home'),
      aboutUs: t('publicNav.about_us'),
      blog: t('publicNav.blog'),
      map: t('publicNav.map'),
      training: t('publicNav.training'),
      survivor: t('publicNav.survivor'),
      contact: t('publicNav.contact'),
      privacy: t('publicNav.privacy'),
      terms: t('publicNav.terms'),
    });

    return {
      routes: defaultRoutes,
      footerRoutes,
      lang,
      messages,
      route,
    };
  },
});
</script>

<style lang="scss">
.grid--main {
  h1 {
    @apply text-2xl font-bold mt-3;
  }
  h2 {
    @apply text-xl font-bold mt-3;
  }

  h3 {
    @apply text-lg font-semibold mt-3;
  }

  h4 {
    @apply text-base mt-3;
  }

  h5 {
    @apply text-sm mt-3;
  }

  h6 {
    @apply text-xs mt-3;
  }

  p {
    @apply my-2;
  }

  ul {
    @apply mt-3 list-disc;
    list-style-position: inside;
  }

  ol {
    @apply mt-3 list-decimal;
    list-style-position: inside;
  }

  strong {
    @apply font-bold;
  }

  u {
    @apply underline;
  }

  em {
    @apply italic;
  }

  a {
    @apply text-primary-dark underline;
    &:hover {
      text-decoration: none;
    }
  }
}
</style>

<style scoped>
.side {
  grid-area: side;
}

.top {
  grid-area: top;
}

.main {
  grid-area: main;
}

.bottom {
  grid-area: bottom;
}

.home-grid {
  width: 100vw;
  height: 100vh;
  display: grid;
  grid-template-rows: 200px 1fr 1fr 150px;
  grid-auto-columns: 350px 1fr 1fr;
  /*grid-auto-rows: 1fr;*/
  /*grid-auto-flow: row;*/
  grid-template-areas:
    'top top top'
    'side main main'
    'side main main'
    'register . bottom';
  padding-bottom: env(safe-area-inset-bottom);
}

.grid--survivors {
  @apply bg-crisiscleanup-yellow-700 my-4 text-center p-4;
  //min-width: 205px;

  p {
    letter-spacing: 0.35px;
    &:first-child {
      font-weight: 700;
      @apply text-2xl;
    }
    &:last-child {
      font-weight: 600;
    }
  }

  a {
    @apply underline;
  }
}

@media only screen and (max-width: 768px) {
  .home-grid {
    display: grid;
    align-items: center;
    grid-auto-flow: row;
    grid-template-columns: 1fr 1fr; /* do not set template columns and rows */
    grid-template-rows: unset;
    overflow-y: auto;
    //grid-template-columns: 1fr 1fr;
    //grid-template-rows: repeat(auto-fit, 1fr);
    grid-template-areas:
      'top top'
      'main main'
      'main main'
      'main main'
      'main main'
      'register register'
      'side side'
      'bottom bottom';
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>
