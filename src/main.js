import '@/assets/css/tailwind.css';
import AssessmentTree from '@/components/AssessmentTree';
import Autocomplete from '@/components/Autocomplete';
import Badge from '@/components/Badge';
import BaseButton from '@/components/BaseButton';
import BaseCheckbox from '@/components/BaseCheckbox';
import BaseIcon from '@/components/BaseIcon';
import BaseInput from '@/components/BaseInput';
import BaseLink from '@/components/BaseLink';
import BaseRadio from '@/components/BaseRadio';
import BaseText from '@/components/BaseText';
import FormSelect from '@/components/FormSelect';
import FormTree from '@/components/FormTree';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Tag from '@/components/Tag';
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
} from '@/filters';
import Authenticated from '@/layouts/Authenticated';
import Unauthenticated from '@/layouts/Unauthenticated';
import { AuthService } from '@/services/auth.service';
import { i18nService } from '@/services/i18n.service';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
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
import Vue from 'vue';
import VueAutosuggest from 'vue-autosuggest';
import VueAxios from 'vue-axios';
import VueClipboard from 'vue-clipboard2';
import VueGtag from 'vue-gtag';
import Hotjar from 'vue-hotjar';
import VueI18n from 'vue-i18n';
import Popover from 'vue-js-popover';
import * as ModalDialogs from 'vue-modal-dialogs';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import vSelect from 'vue-select';
import Toasted from 'vue-toasted';
import Datepicker from 'vuejs-datepicker';
import App from './App.vue';
import router from './router';
import store from './store/index';

library.add(fas);

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
Vue.component('assessment-tree', AssessmentTree);
Vue.component('modal', Modal);
Vue.component('autocomplete', Autocomplete);
Vue.component('tag', Tag);
Vue.component('spinner', Spinner);
Vue.component('badge', Badge);
Vue.component('tag-input', VueTagsInput);
Vue.component('datepicker', Datepicker);

// Layouts
Vue.component('authenticated-layout', Authenticated);
Vue.component('unauthenticated-layout', Unauthenticated);

Vue.config.productionTip = false;

// 3rd Party Libraries
Vue.use(VueAutosuggest);
Vue.use(VTooltip);
Vue.use(ModalDialogs);
Vue.use(VueClipboard);
Vue.use(VueAxios, axios);
momentWithDurations(moment);
Vue.use(require('vue-moment'), { moment });

Vue.use(Toasted, {
  position: 'top-center',
  duration: 2000,
  theme: 'outline',
});

Vue.use(VueI18n);
Vue.use(Popover);
Vue.component('base-dropdown', Dropdown);
Vue.component('v-select', vSelect);

// Filters
Vue.use(vueNumeralFilterInstaller, { locale: 'en-gb' });
Vue.filter('getWorkTypeName', getWorkTypeName);
Vue.filter('getStatusName', getStatusName);
Vue.filter('snakeToTitleCase', snakeToTitleCase);
Vue.filter('getColorForWorkType', getColorForWorkType);
Vue.filter('getWorkTypeImage', getWorkTypeImage);
Vue.filter('secondsToHm', secondsToHm);
Vue.filter('getColorForStatus', getColorForStatus);
Vue.filter('getRecurrenceString', getRecurrenceString);
Vue.filter('upper', toUpper);
Vue.filter('capitalize', capitalize);

// API & Auth
if (AuthService.getUser()) {
  axios.defaults.headers.common.Authorization = `Bearer ${AuthService.getToken()}`;
}

// Sentry Logging
Sentry.init({
  dsn: process.env.SENTRY_DSN,
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

axios.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 401) {
      store.dispatch('auth/logout');
      router.push('/login');
    }
    return Promise.reject(error);
  },
);

const getLanguages = async (tags) => {
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
