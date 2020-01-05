import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueLog from '@dreipol/vue-log';
import VueI18n from 'vue-i18n';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import VueAutosuggest from 'vue-autosuggest';
import VTooltip from 'v-tooltip';
import Toasted from 'vue-toasted';
import Popover from 'vue-js-popover';
import Dropdown from 'bp-vuejs-dropdown';
import vSelect from 'vue-select';
import detectBrowserLanguage from 'detect-browser-language';
import App from './App.vue';
import router from './router';
import store from './store/index';

import { AuthService } from '@/services/auth.service';

import Authenticated from '@/layouts/Authenticated';
import Unauthenticated from '@/layouts/Unauthenticated';

import BaseIcon from '@/components/BaseIcon';
import BaseCheckbox from '@/components/BaseCheckbox';
import BaseButton from '@/components/BaseButton';
import BaseInput from '@/components/BaseInput';
import Modal from '@/components/Modal';
import Autocomplete from '@/components/Autocomplete';
import Tag from '@/components/Tag';
import Spinner from '@/components/Spinner';
import FormSelect from '@/components/FormSelect';

import {
  getColorForWorkType,
  getStatusName,
  getWorkTypeName,
  snakeToTitleCase,
} from '@/filters';

import '@/assets/css/tailwind.css';
import Badge from '@/components/Badge';

library.add(fas);

// Base Components
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('ccu-icon', BaseIcon);
Vue.component('base-checkbox', BaseCheckbox);
Vue.component('base-button', BaseButton);
Vue.component('base-input', BaseInput);
Vue.component('form-select', FormSelect);
Vue.component('modal', Modal);
Vue.component('autocomplete', Autocomplete);
Vue.component('tag', Tag);
Vue.component('spinner', Spinner);
Vue.component('badge', Badge);

// Layouts
Vue.component('authenticated-layout', Authenticated);
Vue.component('unauthenticated-layout', Unauthenticated);

Vue.config.productionTip = false;

// 3rd Party Libraries
Vue.use(VueAutosuggest);
Vue.use(VTooltip);
Vue.use(VueAxios, axios);
Vue.use(require('vue-moment'));
Vue.use(Toasted, {
  position: 'top-center',
  duration: 2000,
  theme: 'outline',
});

Vue.use(VueI18n);
Vue.use(VueLog);
Vue.use(Popover);
Vue.component('base-dropdown', Dropdown);
Vue.component('v-select', vSelect);

// Filters
Vue.use(vueNumeralFilterInstaller, { locale: 'en-gb' });
Vue.filter('getWorkTypeName', getWorkTypeName);
Vue.filter('getStatusName', getStatusName);
Vue.filter('snakeToTitleCase', snakeToTitleCase);
Vue.filter('getColorForWorkType', getColorForWorkType);

// API & Auth
if (AuthService.getUser()) {
  axios.defaults.headers.common.Authorization = `Bearer ${AuthService.getToken()}`;
}

axios.interceptors.response.use(
  function(response) {
    return response;
  },
  function(error) {
    if (error.response.status === 401) {
      store.dispatch('auth/logout');
      router.push('/login');
    }
    return Promise.reject(error);
  },
);

const getLanguages = async tags => {
  const messages = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const tag of tags) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await axios.get(
        `${process.env.VUE_APP_API_BASE_URL}/languages/${tag}`,
      );
      const { subtag, translations } = response.data;

      // Only install locales that actually have translations
      if (Object.keys(translations).length > 0) {
        messages[subtag] = translations;
      }
    } catch (e) {
      VueLog.error(e);
    }
  }

  const locale = Object.keys(messages).pop();
  axios.defaults.headers.common['Accept-Language'] = locale;
  return new VueI18n({
    locale,
    messages,
  });
};

getLanguages(['en-US', detectBrowserLanguage()]).then(i18n => {
  new Vue({
    i18n,
    components: { App },
    render: h => h(App),
    router,
    store,
  }).$mount('#app');
});
