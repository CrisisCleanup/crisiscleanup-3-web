import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";

import axios from 'axios'
import VueAxios from 'vue-axios'

import BaseButton from "./components/BaseButton.vue";
import BaseInput from "./components/BaseInput.vue";
import BaseText from "./components/BaseText.vue";
import Badge from "./components/Badge.vue";
import FormSelect from "./components/FormSelect.vue";
import Modal from "./components/Modal.vue";

import Authenticated from './layouts/Authenticated.vue';

// Icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faSpinner, faBars, faTimes } from '@fortawesome/free-solid-svg-icons'
import BaseIcon from "./components/BaseIcon.vue";
import {store} from "./store";
library.add(faSpinner)
library.add(faBars)
library.add(faTimes)

// Toast
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// i18n
import { createI18n } from 'vue-i18n'
import {AuthService} from "./services/auth.service";

import vSelect from "vue-select";
import "vue-select/dist/vue-select.css";

export const i18n = createI18n({
    legacy: false,
    formatFallbackMessages: true,
    silentFallbackWarn: true,
    locale: 'en',
    messages: {},
})

if (AuthService.getUser()) {
    axios.defaults.withCredentials = true;
    axios.defaults.headers.common.Authorization = `Bearer ${AuthService.getToken()}`;
}

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('ccu-icon', BaseIcon)
app.component('base-button', BaseButton)
app.component('base-input', BaseInput)
app.component('base-text', BaseText)
app.component('badge', Badge)
app.component("v-select", vSelect)
app.component('authenticated-layout', Authenticated);
app.component('form-select', FormSelect);
app.component('modal', Modal);

app.use(store)
app.use(VueAxios, axios)
app.use(router)
app.use(i18n)
app.use(Toast, {});
app.config.devtools = true
app.mount('#app');
