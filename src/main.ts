import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';

import axios from 'axios';
import VueAxios from 'vue-axios';

import BaseButton from './components/BaseButton.vue';
import BaseInput from './components/BaseInput.vue';
import BaseText from './components/BaseText.vue';
import Badge from './components/Badge.vue';
import Tag from './components/Tag.vue';
import FormSelect from './components/FormSelect.vue';
import Modal from './components/Modal.vue';

import Authenticated from './layouts/Authenticated.vue';

// Icons
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
  faSpinner,
  faBars,
  faTimes,
  faChevronDown,
  faChevronUp,
  faCaretDown,
  faCaretUp,
  faEye,
  faPlus,
  faMinus,
  faTree,
  faSync,
  faCaretLeft,
  faCaretRight,
  faMap,
  faCamera,
  faStreetView,
  faSearchMinus,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import BaseIcon from './components/BaseIcon.vue';
import { store } from './store';
library.add(faSpinner);
library.add(faBars);
library.add(faTimes);
library.add(faChevronDown);
library.add(faChevronUp);
library.add(faCaretDown);
library.add(faCaretUp);
library.add(faCaretLeft);
library.add(faCaretRight);
library.add(faEye);
library.add(faPlus);
library.add(faMinus);
library.add(faTree);
library.add(faSync);
library.add(faMap);
library.add(faCamera);
library.add(faStreetView);
library.add(faSearchMinus);
library.add(faChevronRight);

// Toast
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

// i18n
import { createI18n } from 'vue-i18n';
import { AuthService } from './services/auth.service';

import vSelect from 'vue-select';
import 'vue-select/dist/vue-select.css';

// Responsive
import { Vue3Mq } from 'vue3-mq';

// Popover
import { Dropdown, VTooltip, Menu } from 'floating-vue';
import 'floating-vue/dist/style.css';

// JSON
import JsonViewer from 'vue-json-viewer';
import BaseSelect from './components/BaseSelect.vue';
import Spinner from './components/Spinner.vue';
import BaseCheckbox from './components/BaseCheckbox.vue';
import FormTree from './components/form/FormTree.vue';
import Tab from './components/tabs/Tab.vue';
import Tabs from './components/tabs/Tabs.vue';

const getI18n = (messages = {}) => {
  return createI18n({
    legacy: false,
    formatFallbackMessages: true,
    silentFallbackWarn: true,
    locale: 'en',
    messages,
  });
};

if (AuthService.getUser()) {
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common.Authorization = `Bearer ${AuthService.getToken()}`;
}

const app = createApp(App);
app.component('font-awesome-icon', FontAwesomeIcon);
app.component('ccu-icon', BaseIcon);
app.component('base-button', BaseButton);
app.component('base-input', BaseInput);
app.component('base-text', BaseText);
app.component('badge', Badge);
app.component('tag', Tag);
app.component('v-select', vSelect);
app.component('authenticated-layout', Authenticated);
app.component('form-select', FormSelect);
app.component('base-select', BaseSelect);
app.component('base-checkbox', BaseCheckbox);
app.component('modal', Modal);
app.component('v-popover', Dropdown);
app.component('v-menu', Menu);
app.component('spinner', Spinner);
app.component('form-tree', FormTree);
app.component('tabs', Tabs);
app.component('tab', Tab);

app.directive('tooltip', VTooltip);

app.use(store);
app.use(VueAxios, axios);
app.use(Vue3Mq);
app.use(router);
app.use(getI18n());
app.use(Toast, {});
app.use(JsonViewer);
app.config.devtools = true;
app.mount('#app');
