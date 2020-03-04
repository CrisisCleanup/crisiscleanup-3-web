import '@/assets/css/tailwind.css';
import Autocomplete from '@/components/Autocomplete';
import Badge from '@/components/Badge';
import BaseButton from '@/components/BaseButton';
import BaseCheckbox from '@/components/BaseCheckbox';
import BaseIcon from '@/components/BaseIcon';
import BaseInput from '@/components/BaseInput';
import BaseRadio from '@/components/BaseRadio';
import BaseText from '@/components/BaseText';
import FormSelect from '@/components/FormSelect';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Tag from '@/components/Tag';
import {
  getColorForWorkType,
  getStatusName,
  getWorkTypeImage,
  getWorkTypeName,
  secondsToHm,
  snakeToTitleCase,
} from '@/filters';
import Authenticated from '@/layouts/Authenticated';
import Unauthenticated from '@/layouts/Unauthenticated';
import VueLog from '@dreipol/vue-log';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueTagsInput from '@johmun/vue-tags-input';
import { withA11y } from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';
import { addDecorator, addParameters, configure } from '@storybook/vue';
// Import your global components.
import axios from 'axios';
import Dropdown from 'bp-vuejs-dropdown';
import moment from 'moment';
import 'moment/min/locales';
import { withInfo } from 'storybook-addon-vue-info';
// Fonts
import 'typeface-montserrat';
import 'typeface-nunito-sans';
import VTooltip from 'v-tooltip';
import Vue from 'vue';
import VueAutosuggest from 'vue-autosuggest';
import VueAxios from 'vue-axios';
import VueI18n from 'vue-i18n';
import Popover from 'vue-js-popover';
import * as ModalDialogs from 'vue-modal-dialogs';
import vueNumeralFilterInstaller from 'vue-numeral-filter';
import vSelect from 'vue-select';
import Toasted from 'vue-toasted';
// Import Vue plugins
import Vuex from 'vuex';

library.add(fas);

// Base Components
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('ccu-icon', BaseIcon);
Vue.component('base-checkbox', BaseCheckbox);
Vue.component('base-radio', BaseRadio);
Vue.component('base-button', BaseButton);
Vue.component('base-input', BaseInput);
Vue.component('base-text', BaseText);
Vue.component('form-select', FormSelect);
Vue.component('modal', Modal);
Vue.component('autocomplete', Autocomplete);
Vue.component('tag', Tag);
Vue.component('spinner', Spinner);
Vue.component('badge', Badge);
Vue.component('tag-input', VueTagsInput);

// Layouts
Vue.component('authenticated-layout', Authenticated);
Vue.component('unauthenticated-layout', Unauthenticated);

Vue.config.productionTip = false;

// 3rd Party Libraries
Vue.use(VueAutosuggest);
Vue.use(VTooltip);
Vue.use(ModalDialogs);
Vue.use(VueAxios, axios);
Vue.use(require('vue-moment'), { moment });

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
Vue.filter('getWorkTypeImage', getWorkTypeImage);
Vue.filter('secondsToHm', secondsToHm);

// Install Vue plugins.
Vue.use(Vuex);

// Decorators
addDecorator(centered);
addDecorator(withA11y);
addDecorator(withInfo);

// Global Params
addParameters({
  backgrounds: [
    { name: 'CrisisCleanup Gray', value: '#f9f9f9', default: true },
  ],
});

configure(require.context('../src', true, /\.stories\.js$/), module);
