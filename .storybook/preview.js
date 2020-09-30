import '@/assets/css/tailwind.css';
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
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import Tag from '@/components/Tag';
import VueCompositionApi from '@vue/composition-api';
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
import VueResize from 'vue-resize';
import { addDecorator, addParameters, configure } from '@storybook/vue';
// Import your global components.
import axios from 'axios';
import moment from 'moment';
import 'moment/min/locales';
// Fonts
import 'typeface-montserrat/index.css';
import 'typeface-nunito-sans/index.css';
import VTooltip from 'v-tooltip';
import Vue from 'vue';
import VueAutosuggest from 'vue-autosuggest';
import VueAxios from 'vue-axios';
import VueI18n from 'vue-i18n';
import Popover from 'vue-js-popover';
import * as ModalDialogs from 'vue-modal-dialogs';
import vSelect from 'vue-select';
import Toasted from 'vue-toasted';
// Import Vue plugins
import Vuex from 'vuex';
import { getOrganizationName } from '../src/filters';

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
Vue.component('base-link', BaseLink);

// Layouts
Vue.component('authenticated-layout', Authenticated);
Vue.component('unauthenticated-layout', Unauthenticated);

Vue.config.productionTip = false;

// 3rd Party Libraries
Vue.use(VueResize);
Vue.use(VueAutosuggest);
Vue.use(VTooltip);
Vue.use(ModalDialogs);
Vue.use(VueAxios, axios);
Vue.use(require('vue-moment'), { moment });

Vue.use(Toasted, {
  position: 'top-center',
  duration: 7000,
  theme: 'outline',
});

Vue.use(VueI18n);
Vue.use(VueLog);
Vue.use(Popover);
Vue.version = '2.0';
Vue.use(VueCompositionApi);
Vue.component('v-select', vSelect);

// Filters
Vue.filter('getWorkTypeName', getWorkTypeName);
Vue.filter('getStatusName', getStatusName);
Vue.filter('getOrganizationName', getOrganizationName);
Vue.filter('snakeToTitleCase', snakeToTitleCase);
Vue.filter('getColorForWorkType', getColorForWorkType);
Vue.filter('getWorkTypeImage', getWorkTypeImage);
Vue.filter('secondsToHm', secondsToHm);

// Install Vue plugins.
Vue.use(Vuex);

const i18n = new VueI18n({
  locale: 'en-US',
  messages: {},
});

// Decorators
addDecorator(withA11y);
addDecorator(() => ({
  template: '<story/>',
  i18n,
}));

// Global Params
addParameters({
  backgrounds: [
    { name: 'CrisisCleanup Gray', value: '#f9f9f9', default: true },
    { name: 'White', value: '#fff' },
    { name: 'Dark', value: '#4a4a4a' },
  ],
});

configure(require.context('../src', true, /\.stories\.js$/), module);
