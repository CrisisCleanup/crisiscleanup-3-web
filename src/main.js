import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import '@/assets/css/tailwind.css'
import router from './router'
import store from './store/index';
import { AuthService } from "@/services/storage.service";
import * as VueGoogleMaps from 'vue2-google-maps'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import 'pretty-checkbox/dist/pretty-checkbox.css';
import PrettyCheckbox from 'pretty-checkbox-vue';
import { ServerTable } from 'vue-tables-2';
import Authenticated from "@/layouts/Authenticated";
import Unauthenticated from "@/layouts/Unauthenticated";
import BaseIcon from "@/components/BaseIcon";


library.add(fas);

Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('ccu-icon', BaseIcon);
Vue.component('authenticated-layout', Authenticated);
Vue.component('authenticated-layout', Authenticated);
Vue.component('unauthenticated-layout', Unauthenticated);

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(Antd)
Vue.use(PrettyCheckbox);
Vue.use(ServerTable);

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
    libraries: 'places', // This is required if you use the Autocomplete plugin
  },
  installComponents: true
});

if (AuthService.getUser()) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${AuthService.getToken()}`
}

new Vue({
  render: h => h(App),
  router,
  store,
  components: { App }
}).$mount('#app');
