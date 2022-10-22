// @ts-nocheck TODO(tabiodun): Fix this file
// eslint-disable-next-line import/order
import { version } from '@/../package.json';
import '@/assets/css/tailwind.css';
import 'vue-resize/dist/vue-resize.css';
import 'amazon-connect-streams';
import VueHooks from '@u3u/vue-hooks';
import VueCompositionApi from '@vue/composition-api';
import Vue from 'vue';
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
import VueI18n from 'vue-i18n';
import Popover from 'vue-js-popover';
import * as ModalDialogs from 'vue-modal-dialogs';
import VueMq from 'vue-mq';
import VueNativeSocket from 'vue-native-websocket';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import vSelect from 'vue-select';
import Toasted from 'vue-toasted';
import Datepicker from 'vuejs-datepicker';
import VueRouterMultiView from 'vue-router-multi-view';
import MarqueeText from 'vue-marquee-text-component';
import VueNumberInput from '@chenfengyuan/vue-number-input';
import VueEasyLightbox from 'vue-easy-lightbox';
import VuePhoneNumberInput from 'vue-phone-number-input';
import ToggleButton from 'vue-js-toggle-button';
import VCalendar from 'v-calendar';
import { has, padStart } from 'lodash';
import VueViewer from 'v-viewer';
import PhoneService from '@/services/phone.service';
import Tab from '@/components/tabs/Tab.vue';
import Tabs from '@/components/tabs/Tabs.vue';
import { i18nService } from '@/services/i18n.service';
import { AuthService } from '@/services/auth.service';
import { LangOverrideMixin } from '@/mixins';
import Unauthenticated from '@/layouts/Unauthenticated.vue';
import Authenticated from '@/layouts/Authenticated.vue';
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
import Tag from '@/components/Tag.vue';
import Spinner from '@/components/Spinner.vue';
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
import store from './store/index';
// Vue 3.x backports
Vue.use(VueHooks);
Vue.use(VueCompositionApi);

// Base Components
Vue.component('base-link', BaseLink);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('ccu-icon', BaseIcon);
Vue.component('base-checkbox', BaseCheckbox);
Vue.component('base-radio', BaseRadio);
Vue.component('base-button', BaseButton);
Vue.component('base-input', BaseInput);
Vue.component('base-text', BaseText);
Vue.component('form-select', FormSelect);
Vue.component('form-tree', FormTree);
Vue.component('tree-menu', TreeMenu);
Vue.component('assessment-tree', AssessmentTree);
Vue.component('modal', Modal);
Vue.component('autocomplete', Autocomplete);
Vue.component('tag', Tag);
Vue.component('tabs', Tabs);
Vue.component('tab', Tab);
Vue.component('spinner', Spinner);
Vue.component('badge', Badge);
Vue.component('tag-input', VueTagsInput);
Vue.component('datepicker', Datepicker);
Vue.component('vue-phone-number-input', VuePhoneNumberInput);
Vue.component('marquee-text', MarqueeText);

// Layouts
Vue.component('authenticated-layout', Authenticated);
Vue.component('unauthenticated-layout', Unauthenticated);

Vue.config.productionTip = false;

// 3rd Party Libraries
Vue.component('number-input', VueNumberInput);
Vue.use(ToggleButton);
Vue.use(VueResize);
Vue.use(VueTimers);
Vue.use(VueAutosuggest);
Vue.use(VTooltip);
Vue.use(ModalDialogs);
Vue.use(VueClipboard);
Vue.use(VueEasyLightbox);
Vue.use(VueAxios, axios);
Vue.use(VueViewer);
momentWithDurations(moment);
Vue.use(require('vue-moment'), { moment });
Vue.use(VueMq, {
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  defaultBreakpoint: 'sm',
});

Vue.use(VCalendar, {
  componentPrefix: 'vc',
});

library.add(fas);
library.add(far);
Vue.use(VueRouterMultiView);

Vue.use(Toasted, {
  position: 'top-center',
  duration: 7000,
  theme: 'outline',
});

Vue.use(VueI18n);
Vue.use(Popover);
Vue.use(JsonViewer);
Vue.component('base-dropdown', Dropdown);
Vue.component('v-select', vSelect);

// Mixins
Vue.mixin(LangOverrideMixin);

// Filters
Vue.use(vueNumeralFilterInstaller, { locale: 'en-gb' });
Vue.filter('getWorkTypeName', getWorkTypeName);
Vue.filter('getStatusName', getStatusName);
Vue.filter('getOrganizationName', getOrganizationName);
Vue.filter('snakeToTitleCase', snakeToTitleCase);
Vue.filter('getColorForWorkType', getColorForWorkType);
Vue.filter('getWorkTypeImage', getWorkTypeImage);
Vue.filter('secondsToHm', secondsToHm);
Vue.filter('formatSeconds', formatSeconds);
Vue.filter('getColorForStatus', getColorForStatus);
Vue.filter('getRecurrenceString', getRecurrenceString);
Vue.filter('upper', toUpper);
Vue.filter('capitalize', capitalize);
Vue.filter('truncate', truncateFilter);
Vue.filter('startCase', startCase);
Vue.filter('snakeCase', snakeCase);
Vue.filter('padStart', padStart);
Vue.filter('formatNationalNumber', formatNationalNumber);

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
        Vue,
        attachProps: true,
        // sets whether to log errors in sentry
        // AND with the standard web log,
        // not errors overall
        logErrors: process.env.NODE_ENV !== 'production',
      }),
    ],
  });
  // Google GTag
  Vue.use(VueGtag, {
    config: {
      id: 'UA-42924421-1',
    },
  });

  // Hotjar Analytics
  Vue.use(Hotjar, {
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

Vue.prototype.$phoneService = new PhoneService();

// Setup i18n
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
  return new VueI18n({
    formatFallbackMessages: true,
    silentFallbackWarn: true,
    locale,
    messages,
  });
};

getLanguages(['en-US', detectBrowserLanguage()]).then((i18n) => {
  window.vue = new Vue({
    i18n,
    components: { App },
    render: (h) => h(App),
    router,
    store,
  }).$mount('#app');
});
