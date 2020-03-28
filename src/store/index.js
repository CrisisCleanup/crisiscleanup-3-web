import VuexORM from '@vuex-orm/core';
import VuexORMAxios from '@vuex-orm/plugin-axios';
import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import database from './database';
import auth from './modules/auth';
import incident from './modules/incident';
import loading from './modules/loading';
import locale from './modules/locale';
import phone from './modules/phone';
import enums from './modules/enums';

VuexORM.use(VuexORMAxios, {
  axios,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  baseURL: `${process.env.VUE_APP_API_BASE_URL}`,
});

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    incident,
    loading,
    locale,
    phone,
    enums,
  },
  plugins: [VuexORM.install(database)],
  strict: debug,
});
