import '@/assets/css/tailwind.css';
import Autocomplete from '@/components/Autocomplete.vue';
import Badge from '@/components/Badge.vue';
import BaseButton from '@/components/BaseButton.vue';
import BaseCheckbox from '@/components/BaseCheckbox.vue';
import BaseIcon from '@/components/BaseIcon.vue';
import BaseInput from '@/components/BaseInput.vue';
import BaseLink from '@/components/BaseLink.vue';
import BaseRadio from '@/components/BaseRadio.vue';
import BaseText from '@/components/BaseText.vue';
import FormSelect from '@/components/FormSelect.vue';
import Modal from '@/components/Modal.vue';
import Spinner from '@/components/Spinner.vue';
import Tag from '@/components/Tag.vue';
import VueCompositionApi from '@vue/composition-api';
import VueI18n from 'vue-i18n';
import {
  getColorForWorkType,
  getStatusName,
  getWorkTypeImage,
  getWorkTypeName,
  secondsToHm,
  snakeToTitleCase,
} from '@/filters';
import Authenticated from '@/layouts/Authenticated.vue';
import Unauthenticated from '@/layouts/Unauthenticated.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VueTagsInput from '@johmun/vue-tags-input';
import { withA11y } from '@storybook/addon-a11y';
import VueResize from 'vue-resize';
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
import Popover from 'vue-js-popover';
import vSelect from 'vue-select';
import Toasted from 'vue-toasted';
// Import Vue plugins
import Vuex from 'vuex';
import { getOrganizationName } from '../src/filters';
import Logger from 'js-logger';

Logger.useDefaults();
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
Vue.use(VueAxios, axios);
Vue.use(require('vue-moment'), { moment });

Vue.use(Toasted, {
  position: 'top-center',
  duration: 7000,
  theme: 'outline',
});

Vue.use(VueI18n);
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

const LangMockMixin = {
  created() {
    this.$t = (...args) => args;
  },
};
Vue.mixin(LangMockMixin);

// Default Decorators
export const decorators = [withA11y];

// Global Default Params
export const parameters = {
  backgrounds: {
    values: [
      { name: 'CrisisCleanup Gray', value: '#f9f9f9', default: true },
      { name: 'White', value: '#fff' },
      { name: 'Dark', value: '#4a4a4a' },
    ],
  },
};
