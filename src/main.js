import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

import App from './App.vue'
import router from './router'
import store from './store/index';

import { AuthService } from "@/services/auth.service";

import Antd from 'ant-design-vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
library.add(fas);
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import Authenticated from "@/layouts/Authenticated";
import Unauthenticated from "@/layouts/Unauthenticated";

import BaseIcon from "@/components/BaseIcon";
import BaseCheckbox from "@/components/BaseCheckbox";
import BaseButton from "@/components/BaseButton";
import BaseInput from "@/components/BaseInput";
import BaseSelect from "@/components/BaseSelect";
import Modal from "@/components/Modal";
import Autocomplete from "@/components/Autocomplete";
import Tag from "@/components/Tag";
import Spinner from "@/components/Spinner";

import VueLog from '@dreipol/vue-log';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import VueAutosuggest from "vue-autosuggest";
import VTooltip from 'v-tooltip'
import {getWorkTypeName, snakeToTitleCase, getStatusName, getColorForWorkType} from "@/filters";
import Popover from 'vue-js-popover'
import Dropdown from 'bp-vuejs-dropdown';

import 'ant-design-vue/dist/antd.less'
import '@/assets/css/tailwind.css'
import Badge from "@/components/Badge";


// Base Components
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('ccu-icon', BaseIcon);
Vue.component('base-checkbox', BaseCheckbox);
Vue.component('base-button', BaseButton);
Vue.component('base-input', BaseInput);
Vue.component('base-select', BaseSelect);
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
Vue.use(VTooltip)
Vue.use(VueAxios, axios);
Vue.use(Antd)
Vue.use(require('vue-moment'));
Vue.use(VueLog);
Vue.use(Popover)
Vue.component('base-dropdown', Dropdown)


// Filters
Vue.use(vueNumeralFilterInstaller, { locale: 'en-gb' });
Vue.filter('getWorkTypeName', getWorkTypeName);
Vue.filter('getStatusName', getStatusName);
Vue.filter('snakeToTitleCase', snakeToTitleCase);
Vue.filter('getColorForWorkType', getColorForWorkType);


// API & Auth
if (AuthService.getUser()) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${AuthService.getToken()}`
}

axios.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.response.status === 401) {
    store.dispatch('auth/logout');
    router.push('/login');
  }
  return Promise.reject(error)
});

new Vue({
  render: h => h(App),
  router,
  store,
  components: { App }
}).$mount('#app');
