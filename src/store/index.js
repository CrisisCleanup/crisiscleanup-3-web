import VueLog from '@dreipol/vue-log';
import VuexORM from '@vuex-orm/core';
import VuexORMAxios from '@vuex-orm/plugin-axios';
import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import database from './database';
import auth from './modules/auth';
import enums from './modules/enums';
import incident from './modules/incident';
import loading from './modules/loading';
import locale from './modules/locale';
import phone from './modules/phone';
import rc from './modules/rc';

VuexORM.use(VuexORMAxios, {
  axios,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  baseURL: `${process.env.VUE_APP_API_BASE_URL}`,
});

Vue.use(Vuex);
Vue.use(VueLog);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    incident,
    loading,
    locale,
    phone,
    enums,
    rc,
  },
  plugins: [VuexORM.install(database)],
  strict: debug,
});
