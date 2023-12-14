import axios from 'axios';
import size from 'lodash/size';
import moment from 'moment/moment';
import detectBrowserLanguage from 'detect-browser-language';
import { i18nService } from '@/services/i18n.service';
import { i18n } from '@/main';
import { store } from '@/store';
import Language from '@/models/Language';
import User from '@/models/User';

export default function useSetupLanguage() {
  return {
    async setupLanguage() {
      const { setLocaleMessage, locale } = i18n.global;
      let currentLanguage: string;
      const currentUser = User.find(store.getters['auth/userId']);
      if (currentUser?.primary_language || currentUser?.secondary_language) {
        const userLanguage =
          Language.find(currentUser?.primary_language) ||
          Language.find(currentUser?.secondary_language);

        currentLanguage = detectBrowserLanguage() as string;
        if (userLanguage) {
          currentLanguage = userLanguage.subtag;
        }
      } else {
        currentLanguage = detectBrowserLanguage() as string;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_BASE_URL}/languages`,
        );

        const _availableLanguages: Array<{
          id: string;
          name_t: string;
          subtag: string;
        }> = response?.data?.results ?? [];

        const availableLanguages = new Set(
          _availableLanguages.map((l) => l.subtag),
        );
        const isEnglish = currentLanguage.startsWith('en');
        const isSpanish = currentLanguage.startsWith('es');
        if (isEnglish && !availableLanguages.has(currentLanguage)) {
          currentLanguage = 'en-US';
        }
        if (isSpanish && !availableLanguages.has(currentLanguage)) {
          currentLanguage = 'es';
        }
      } catch (error) {
        console.log(error);
      }

      store.commit('locale/setLanguage', currentLanguage);
      if (currentLanguage) {
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
        } catch {
          // $log.error(e);
        }

        moment.locale(currentLanguage.split('-')[0]);
      }

      moment.locale(currentLanguage.split('-')[0]);
    },
  };
}
