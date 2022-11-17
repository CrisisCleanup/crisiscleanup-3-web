import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";

import axios from 'axios'
import VueAxios from 'vue-axios'

// Icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import BaseIcon from "./components/BaseIcon.vue";
library.add(faSpinner)


const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.component('ccu-icon', BaseIcon)
app.use(VueAxios, axios)
app.use(router)
app.mount('#app');
