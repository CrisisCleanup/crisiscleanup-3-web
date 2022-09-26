<template>
  <div class="wrapper">
    <slot />
  </div>
</template>

<script lang="ts">
import detectBrowserLanguage from 'detect-browser-language';
import { useMutations } from '@u3u/vue-hooks';
import { size } from 'lodash';
import moment from 'moment';
import { onMounted } from '@vue/composition-api';
import { i18nService } from '@/services/i18n.service';

export default {
  setup(props, context) {
    const { $t, $log, $http } = context.root;
    const i18nLocale = context.root.$i18n.locale;
    const { setLanguage } = useMutations('locale', ['setLanguage']);
    const currentLanguage = detectBrowserLanguage() as string;
    console.log('current lang', currentLanguage);

    const setupLanguage = async () => {
      if (currentLanguage.startsWith('es')) {
        setLanguage('es-MX'); // if browser language is spanish, set to spanish (mexico)
      } else {
        setLanguage(currentLanguage);
      }
      if (currentLanguage !== i18nLocale) {
        try {
          const data = await i18nService.getLanguage(currentLanguage);
          const { translations } = data;
          if (size(translations) > 0) {
            context.root.$i18n.setLocaleMessage(currentLanguage, translations);
            context.root.$i18n.locale = currentLanguage;
            $http.defaults.headers.common['Accept-Language'] = currentLanguage;
            const htmlHtmlElement = document.querySelector('html');
            if (htmlHtmlElement) {
              htmlHtmlElement.setAttribute('lang', currentLanguage);
            }
          }
        } catch (e) {
          $log.error(e);
        }
        moment.locale(currentLanguage.split('-')[0]);
      }
    };

    onMounted(async () => {
      await setupLanguage();
    });
  },
};
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
