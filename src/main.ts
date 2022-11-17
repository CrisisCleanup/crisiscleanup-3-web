import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";

import axios from 'axios'
import VueAxios from 'vue-axios'

import BaseButton from "./components/BaseButton.vue";
import BaseInput from "./components/BaseInput.vue";
import BaseText from "./components/BaseText.vue";

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

const i18n = createI18n({
    legacy: false,
    formatFallbackMessages: true,
    silentFallbackWarn: true,
    locale: 'en',
    messages: {},
})

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('ccu-icon', BaseIcon)
app.component('base-button', BaseButton)
app.component('base-input', BaseInput)
app.component('base-text', BaseText)
app.use(store)
app.use(VueAxios, axios)
app.use(router)
app.use(i18n)
app.use(Toast, {});
app.mount('#app');
