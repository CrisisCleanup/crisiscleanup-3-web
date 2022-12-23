import { createApp } from 'vue';
import './style.css';
import axios from 'axios';
import VueAxios from 'vue-axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueTagsInput from '@sipec/vue3-tags-input';
import Datepicker from '@vuepic/vue-datepicker';

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
  faChevronLeft,
  faUsers,
  faStar,
} from '@fortawesome/free-solid-svg-icons';
import Toast from 'vue-toastification';
import { createI18n } from 'vue-i18n';
import vSelect from 'vue-select';
import App from './App.vue';
import router from './router';

import BaseButton from './components/BaseButton.vue';
import BaseInput from './components/BaseInput.vue';
import BaseText from './components/BaseText.vue';
import Badge from './components/Badge.vue';
import Tag from './components/Tag.vue';
import FormSelect from './components/FormSelect.vue';
import Modal from './components/Modal.vue';

import Authenticated from './layouts/Authenticated.vue';

// Icons

import BaseIcon from './components/BaseIcon.vue';
import { store } from './store';

// Toast
import 'vue-toastification/dist/index.css';

// I18n
import { AuthService } from './services/auth.service';

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
import BaseRadio from './components/BaseRadio.vue';
import Unauthenticated from './layouts/Unauthenticated.vue';
import BaseLink from './components/BaseLink.vue';

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
library.add(faChevronLeft);
library.add(faUsers);
library.add(faStar);

const getI18n = (messages = {}) => {
  return createI18n({
    legacy: false,
    formatFallbackMessages: true,
    silentFallbackWarn: true,
    locale: 'en',
    messages,
  });
};

export const i18n = getI18n();

if (AuthService.getUser()) {
  axios.defaults.withCredentials = true;
  axios.defaults.headers.common.Authorization = `Bearer ${AuthService.getToken()}`;
}

const app = createApp(App);
app.component('FontAwesomeIcon', FontAwesomeIcon);
app.component('CcuIcon', BaseIcon);
app.component('BaseButton', BaseButton);
app.component('BaseInput', BaseInput);
app.component('BaseText', BaseText);
app.component('BaseLink', BaseLink);
app.component('BaseRadio', BaseRadio);
app.component('Badge', Badge);
app.component('Tag', Tag);
app.component('TagInput', VueTagsInput);
app.component('VSelect', vSelect);
app.component('AuthenticatedLayout', Authenticated);
app.component('UnauthenticatedLayout', Unauthenticated);
app.component('FormSelect', FormSelect);
app.component('BaseSelect', BaseSelect);
app.component('BaseCheckbox', BaseCheckbox);
app.component('Modal', Modal);
app.component('VPopover', Dropdown);
app.component('VMenu', Menu);
app.component('Spinner', Spinner);
app.component('FormTree', FormTree);
app.component('Tabs', Tabs);
app.component('Tab', Tab);
app.component('Datepicker', Datepicker);

app.directive('tooltip', VTooltip);

app.use(store);
app.use(VueAxios, axios);
app.use(Vue3Mq);
app.use(router);
app.use(i18n);
app.use(Toast, {});
app.use(JsonViewer);
app.config.devtools = true;
app.mount('#app');
