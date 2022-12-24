import axios from 'axios';
import { size } from 'lodash';
import moment from 'moment/moment';
import detectBrowserLanguage from 'detect-browser-language';
import { i18nService } from '@/services/i18n.service';
import { i18n } from '@/main';
import { store } from '@/store';
import Language from '@/models/Language';
import type User from '@/models/User';

export default function useSetupLanguage(currentUser: User | null = null) {
  return {
    setupLanguage: async () => {
      const { setLocaleMessage, locale } = i18n.global;
      let currentLanguage: string;
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

      store.commit('locale/setLanguage', currentLanguage);
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
        } catch {
          // $log.error(e);
        }
        moment.locale(currentLanguage.split('-')[0]);
      }
      moment.locale(currentLanguage.split('-')[0]);
    },
  };
}
