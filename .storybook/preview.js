import { configure, addDecorator } from '@storybook/vue';
import { withA11y } from '@storybook/addon-a11y';
import centered from '@storybook/addon-centered/vue';

import Vue from 'vue';

// Fonts
import 'typeface-montserrat';
import 'typeface-nunito-sans';

// Import Vue plugins
import Vuex from 'vuex';

// Import your global components.
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
import VueTagsInput from '@johmun/vue-tags-input';
import Popover from 'vue-js-popover';
import Dropdown from 'bp-vuejs-dropdown';
import vSelect from 'vue-select';
import * as ModalDialogs from 'vue-modal-dialogs';
import moment from 'moment';
import 'moment/min/locales';

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
import BaseRadio from '@/components/BaseRadio';

import {
  getColorForWorkType,
  getStatusName,
  getWorkTypeImage,
  getWorkTypeName,
  secondsToHm,
  snakeToTitleCase,
} from '@/filters';

import '@/assets/css/tailwind.css';
import Badge from '@/components/Badge';
import { i18nService } from '@/services/i18n.service';

library.add(fas);

// Base Components
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('ccu-icon', BaseIcon);
Vue.component('base-checkbox', BaseCheckbox);
Vue.component('base-radio', BaseRadio);
Vue.component('base-button', BaseButton);
Vue.component('base-input', BaseInput);
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

configure(require.context('../src', true, /\.stories\.js$/), module);
