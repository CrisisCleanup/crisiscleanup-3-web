// @ts-nocheck TODO(tabiodun): Fix this file
// eslint-disable-next-line import/order
import { version } from '@/../package.json';
import '@/assets/css/tailwind.css';
import 'vue-resize/dist/vue-resize.css';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';
import 'amazon-connect-streams';
import { createApp } from 'vue';
import JsonViewer from 'vue-json-viewer';
import VueTimers from 'vue-timers';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueTagsInput from '@johmun/vue-tags-input';
import * as Sentry from '@sentry/browser';
import * as SentryIntegrations from '@sentry/integrations';
import axios from 'axios';
import Dropdown from 'bp-vuejs-dropdown';
import detectBrowserLanguage from 'detect-browser-language';
import moment from 'moment';
import momentWithDurations from 'moment-duration-format';
import 'moment/min/locales';
import VTooltip from 'v-tooltip';
import VueAutosuggest from 'vue-autosuggest';
import VueResize from 'vue-resize';
import VueAxios from 'vue-axios';
import VueClipboard from 'vue-clipboard2';
import VueGtag from 'vue-gtag';
import Hotjar from 'vue-hotjar';
import { createI18n } from 'vue-i18n';
import Popover from 'vue-js-popover';
import { Vue3Mq } from 'vue3-mq';
import VueNativeSocket from 'vue-native-websocket';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import vSelect from 'vue-select';
import Toasted from 'vue-toasted';
import Datepicker from 'vuejs-datepicker';
import VueRouterMultiView from 'vue-router-multi-view';
import VueCookies from 'vue-cookies';
import MarqueeText from 'vue-marquee-text-component';
import VueNumberInput from '@chenfengyuan/vue-number-input';
import VuePhoneNumberInput from 'vue-phone-number-input';
import ToggleButton from 'vue-js-toggle-button';
import VCalendar from 'v-calendar';
import { has, padStart } from 'lodash';
import { getModule } from 'vuex-module-decorators';
import Logger from 'js-logger';
import VueEasyLightbox from 'vue-easy-lightbox';
import store from './store/index';
import Spinner from '@/components/Spinner.vue';
import Tag from '@/components/Tag.vue';
import Authenticated from '@/layouts/Authenticated.vue';
import Unauthenticated from '@/layouts/Unauthenticated.vue';
import {
  capitalize,
  getColorForStatus,
  getColorForWorkType,
  getRecurrenceString,
  getStatusName,
  getWorkTypeImage,
  getWorkTypeName,
  secondsToHm,
  snakeToTitleCase,
  toUpper,
  truncateFilter,
  startCase,
  snakeCase,
  getOrganizationName,
  formatNationalNumber,
  formatSeconds,
} from '@/filters';
import { LangOverrideMixin } from '@/mixins';
import { AuthService } from '@/services/auth.service';
import { i18nService } from '@/services/i18n.service';
import Tabs from '@/components/tabs/Tabs.vue';
import Tab from '@/components/tabs/Tab.vue';
import PhoneService from '@/services/phone.service';
import Modal from '@/components/Modal.vue';
import TreeMenu from '@/components/TreeMenu.vue';
import FormTree from '@/components/FormTree.vue';
import FormSelect from '@/components/FormSelect.vue';
import BaseText from '@/components/BaseText.vue';
import BaseRadio from '@/components/BaseRadio.vue';
import BaseLink from '@/components/BaseLink.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseIcon from '@/components/BaseIcon.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import BaseButton from '@/components/BaseButton.vue';
import Badge from '@/components/Badge.vue';
import Autocomplete from '@/components/Autocomplete.vue';
import AssessmentTree from '@/components/AssessmentTree.vue';
import App from './App.vue';
import router from './router';

Logger.useDefaults();

const app = createApp(App);

// TODO: cleanup this file with module system
// see: https://github.com/antfu/vitesse/tree/main/src/modules

// Base Components
app
  .component('BaseLink', BaseLink)
  .component('font-awesome-icon', FontAwesomeIcon)
  .component('ccu-icon', BaseIcon)
  .component('base-checkbox', BaseCheckbox)
  .component('base-radio', BaseRadio)
  .component('base-button', BaseButton)
  .component('base-input', BaseInput)
  .component('base-text', BaseText)
  .component('form-select', FormSelect)
  .component('form-tree', FormTree)
  .component('tree-menu', TreeMenu)
  .component('assessment-tree', AssessmentTree)
  .component('modal', Modal)
  .component('autocomplete', Autocomplete)
  .component('tag', Tag)
  .component('tabs', Tabs)
  .component('tab', Tab)
  .component('spinner', Spinner)
  .component('badge', Badge)
  .component('tag-input', VueTagsInput)
  .component('datepicker', Datepicker)
  .component('vue-phone-number-input', VuePhoneNumberInput)
  .component('marquee-text', MarqueeText)
  .component('base-dropdown', Dropdown)
  .component('v-select', vSelect);

// Layouts
app
  .component('AuthenticatedLayout', Authenticated)
  .component('unauthenticated-layout', Unauthenticated);

momentWithDurations(moment);

// 3rd Party Libraries
app
  .component('NumberInput', VueNumberInput)
  .use(ToggleButton)
  .use(VueResize)
  .use(VueTimers)
  .use(VueAutosuggest)
  .use(VTooltip)
  .use(VueClipboard)
  .use(VueEasyLightbox)
  .use(VueAxios, axios) // sets app.config.globalProperties.$http
  .use(VueCookies)
  .use(require('vue-moment'), { moment })
  .use(Vue3Mq, {
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
    defaultBreakpoint: 'sm',
  })
  .use(VCalendar, {
    componentPrefix: 'vc',
  })
  // TODO: Migrate to Vue3
  .use(VueRouterMultiView)
  .use(Toasted, {
    position: 'top-center',
    duration: 7000,
    theme: 'outline',
  })
  // TODO: Migrate to Vue3
  .use(Popover)
  .use(JsonViewer);

library.add(fas);
library.add(far);

// Mixins
app.mixin(LangOverrideMixin);

// Filters
app
  .use(vueNumeralFilterInstaller, { locale: 'en-gb' })
  .filter('getWorkTypeName', getWorkTypeName)
  .filter('getStatusName', getStatusName)
  .filter('getOrganizationName', getOrganizationName)
  .filter('snakeToTitleCase', snakeToTitleCase)
  .filter('getColorForWorkType', getColorForWorkType)
  .filter('getWorkTypeImage', getWorkTypeImage)
  .filter('secondsToHm', secondsToHm)
  .filter('formatSeconds', formatSeconds)
  .filter('getColorForStatus', getColorForStatus)
  .filter('getRecurrenceString', getRecurrenceString)
  .filter('upper', toUpper)
  .filter('capitalize', capitalize)
  .filter('truncate', truncateFilter)
  .filter('startCase', startCase)
  .filter('snakeCase', snakeCase)
  .filter('padStart', padStart)
  .filter('formatNationalNumber', formatNationalNumber);

// API & Auth
if (AuthService.getUser()) {
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common.Authorization = `Bearer ${AuthService.getToken()}`;
}

// Sentry Logging
if (!process.env.VUE_APP_IS_LOCAL) {
  Sentry.init({
    dsn: 'https://2b3f683efc3d444d82c8719fdb6d69dd@sentry.io/5166561',
    release: `crisiscleanup-3-web@v${version}`,
    environment: process.env.VUE_APP_STAGE,
    integrations: [
      new SentryIntegrations.Vue({
        app,
        attachProps: true,
        // sets whether to log errors in sentry
        // AND with the standard web log,
        // not errors overall
        logErrors: process.env.NODE_ENV !== 'production',
      }),
    ],
  });
  // Google GTag
  app.use(VueGtag, {
    config: {
      id: 'UA-42924421-1',
    },
  });
  // Hotjar Analytics
  app.use(Hotjar, {
    id: '1722600',
    isProduction: process.env.NODE_ENV === 'production',
  });
}

// Add a request interceptor
axios.interceptors.request.use(function (config) {
  config.headers.CCU_WEB_URL = window.location.href;
  config.headers.CCU_PORTAL_KEY = process.env.VUE_APP_PORTAL_KEY;
  return config;
});

// Intercept and handle unauthenticated requests
axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response && error.response.status === 401) {
      store.commit('auth/setShowLoginModal', true);
    }
    return Promise.reject(error);
  },
);

app.provide('$http', axios);
app.provide('$axios', axios);
app.provide('$phoneService', new PhoneService());

app.config.globalProperties.$axios = axios;
app.config.globalProperties.$store = store;
app.config.globalProperties.$phoneService = new PhoneService();

console.log('app.config', app.config);

(async () => {
  const getLanguages = async (tags: any) => {
    const messages = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const tag of tags) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const data = await i18nService.getLanguage(tag);
        const { subtag, translations } = data;

        // Only install locales that actually have translations
        if (Object.keys(translations).length > 0) {
          messages[subtag] = translations;
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
    const locale = Object.keys(messages).pop();
    axios.defaults.headers.common['Accept-Language'] = locale;
    return new createI18n({
      formatFallbackMessages: true,
      silentFallbackWarn: true,
      locale,
      messages,
      // needed for useI18n
      allowComposition: true,
    });
  };
  const i18n = await getLanguages(['en-US']);
  app.use(i18n).use(router).use(store);
  window.vue = app.mount('#app');
  console.log('app.config', app.config);
})();
