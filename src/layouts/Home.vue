<template>
  <div class="home-grid">
    <div class="side m-8 flex flex-col justify-between">
      <div class="grid--logo logo w-48">
        <a href="/">
          <img src="../assets/ccu-logo-black-500w.png" alt="Crisis Cleanup" />
        </a>
      </div>
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
      <div></div>
    </div>
    <div class="top"></div>
    <div class="main">
      <slot/>
    </div>
    <div class="bottom"></div>
  </div>
</template>

<script>
import { reactive } from "vue";
import { useI18n } from 'vue-i18n'

export default {
  name: "Home",
  setup() {
    const { t } = useI18n();

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
    const lang = reactive({
      home: t('publicNav.home'),
      aboutUs: t('publicNav.about_us'),
      blog: t('publicNav.blog'),
      map: t('publicNav.map'),
      training: t('publicNav.training'),
      survivor: t('publicNav.survivor'),
      contact: t('publicNav.contact'),
    })
    return {
      routes: defaultRoutes,
      lang
    }
  }
}
</script>

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
      'side top top'
      'side main main'
      'side main main'
      'side bottom bottom';
    padding-bottom: env(safe-area-inset-bottom);
  }
</style>
