import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.less'
import '@/assets/css/tailwind.css'
import router from './router'
import store from './store/index';
import { TokenService } from "@/services/storage.service";
import * as VueGoogleMaps from 'vue2-google-maps'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


library.add(fas);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(Antd)

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyAHiaoK3SfG5qU-eMKMCqijL5HjdCPs9A0',
    libraries: 'places', // This is required if you use the Autocomplete plugin
  },
  installComponents: true
});

if (TokenService.getToken()) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${TokenService.getToken()}`
}

new Vue({
  render: h => h(App),
  router,
  store,
  components: { App }
}).$mount('#app');
