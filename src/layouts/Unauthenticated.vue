<template>
  <div class="wrapper unauthenticated">
    <slot />
  </div>
</template>

<script lang="ts">
import detectBrowserLanguage from 'detect-browser-language';
import { size } from 'lodash';
import moment from 'moment';
import {defineComponent, onBeforeMount} from 'vue';
import { i18nService } from '../services/i18n.service';
import axios from "axios";
import {useStore} from "vuex";
import {useI18n} from "vue-i18n";

export default defineComponent({
  setup() {
    const store = useStore();
    const {t, setLocaleMessage, locale} = useI18n();

    let currentLanguage = detectBrowserLanguage() as string;
    console.log('current lang', currentLanguage);

    const setupLanguage = async () => {
      const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/languages`,
      );

      const _availableLanguages: Array<{
        id: string;
        name_t: string;
        subtag: string;
      }> = response?.data?.results ?? [];

      const availableLanguages = _availableLanguages.map((l) => l.subtag);
      const isSpanish = currentLanguage.startsWith('es');
      if (isSpanish && !availableLanguages.includes(currentLanguage)) {
        currentLanguage = 'es';
      }

      store.commit("locale/setLanguage", currentLanguage);
      if (currentLanguage !== locale.value) {
        try {
          const data = await i18nService.getLanguage(currentLanguage);
          const { translations } = data;
          if (size(translations) > 0) {
            setLocaleMessage(currentLanguage, translations);
            locale.value = currentLanguage;
            axios.defaults.headers.common['Accept-Language'] = currentLanguage;
            const htmlHtmlElement = document.querySelector('html');
            if (htmlHtmlElement) {
              htmlHtmlElement.setAttribute('lang', currentLanguage);
            }
          }
        } catch (e) {
          // $log.error(e);
        }
        moment.locale(currentLanguage.split('-')[0]);
      }
      moment.locale(currentLanguage.split("-")[0]);
    };

    onBeforeMount(async () => {
      await setupLanguage();
    });
  },
});
</script>

<style>
html,
body,
.wrapper,
#app {
  @apply w-full h-full;
}

a:hover,
a:active,
a:focus {
  outline: 0;
  cursor: pointer;
  user-select: none;
}
</style>
